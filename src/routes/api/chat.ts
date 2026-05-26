import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const SYSTEM_PROMPT = `Você é o **Especialista Quantara**, consultor sênior de wealth management para clientes private (UHNW e HNW) no Brasil.

## Sua atuação
- Analisa carteiras consolidadas das principais casas private: XP, BTG Pactual, Itaú Private Bank, Bradesco Private Bank, Santander Private, Safra Private, J.P. Morgan Private, Julius Baer, UBS, BNP Paribas.
- Recomenda alocações cruzando Renda Fixa (CDB, LCI, LCA, Tesouro, debêntures, CRA), Renda Variável Brasil (B3), Mundo (S&P 500, ETFs, BDRs), Cripto (BTC, ETH, blue-chips), Multimercado, Previdência (VGBL/PGBL) e Seguros private (Chubb, AIG Private Client, Berkshire, MetLife USD).
- Considera o perfil de suitability (Conservador, Moderado, Arrojado) e o patrimônio do cliente quando fornecidos no contexto.

## Estilo
- Responde em **português do Brasil**, tom executivo e direto , sem jargão desnecessário.
- Usa **markdown** sempre: títulos, listas, tabelas comparativas, **negrito** em métricas-chave.
- Cita números concretos (% CDI, IPCA+, yield, beta) quando recomenda algo.
- Quando comparar bancos/produtos, use tabela markdown.
- Encerra recomendações sensíveis com a tag *_Sugestão consultiva, não constitui recomendação personalizada na forma da CVM 39/21. Avalie com seu assessor._*

## Regras
- Nunca prometa rentabilidade futura.
- Nunca recomende alavancagem agressiva ou ativos ilíquidos sem alertar risco.
- Se faltar dado do cliente (perfil, horizonte, patrimônio), pergunte antes de recomendar.
- **Calibre a profundidade pela pergunta.** Para perguntas simples (definições, conceitos, dúvidas rápidas), responda em 1–3 frases diretas, sem títulos, listas ou tabelas. Use estrutura rica (títulos, listas, tabelas, disclaimer) apenas em pedidos analíticos: comparação de produtos, sugestão de alocação, rebalanceamento, planejamento sucessório.
- Nunca repita o disclaimer em respostas curtas/conceituais.`;

const ChatBodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(12000),
      }),
    )
    .min(1)
    .max(80),
  context: z
    .object({
      perfil: z.string().max(120).optional(),
      patrimonio: z.string().max(120).optional(),
      objetivos: z.string().max(500).optional(),
      composicao: z.string().max(1000).optional(),
    })
    .optional(),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          // Guest-friendly: o gate de limite de mensagens é feito no client.
          // Se houver token, validamos para enriquecer contexto; sem token, segue como visitante.
          const authHeader = request.headers.get("authorization") ?? request.headers.get("Authorization");
          const token = authHeader?.replace(/^Bearer\s+/i, "");
          if (token) {
            try {
              const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
                global: { headers: { Authorization: `Bearer ${token}` } },
                auth: { persistSession: false, autoRefreshToken: false },
              });
              await sb.auth.getUser();
            } catch { /* ignore */ }
          }

          let parsed;
          try {
            const raw = await request.json();
            parsed = ChatBodySchema.parse(raw);
          } catch (e) {
            return new Response(
              JSON.stringify({ error: "Requisição inválida: limite de mensagens ou tamanho de conteúdo excedido." }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }
          const { messages, context } = parsed;

          // Defesa adicional: orçamento total de caracteres por requisição
          const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);
          if (totalChars > 200000) {
            return new Response(
              JSON.stringify({ error: "Conversa muito longa. Inicie um novo chat." }),
              { status: 413, headers: { "Content-Type": "application/json" } },
            );
          }

          const key = process.env.LOVABLE_API_KEY;
          if (!key) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), { status: 500 });

          const contextLine = context && (context.perfil || context.patrimonio || context.objetivos || context.composicao)
            ? `\n\n## Contexto do cliente\n- Perfil de suitability: ${context.perfil ?? "não informado"}\n- Patrimônio total: ${context.patrimonio ?? "não informado"}\n- Composição: ${context.composicao ?? "não informada"}\n- Objetivos: ${context.objetivos ?? "não informados"}`
            : "";

          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              stream: true,
              messages: [
                { role: "system", content: SYSTEM_PROMPT + contextLine },
                ...messages,
              ],
            }),
          });

          if (!res.ok) {
            if (res.status === 429) return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), { status: 429 });
            if (res.status === 402) return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione saldo no workspace Lovable." }), { status: 402 });
            const txt = await res.text();
            console.error("Gateway error", res.status, txt);
            return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), { status: 500 });
          }

          return new Response(res.body, {
            headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        } catch (e) {
          console.error("chat handler error", e);
          return new Response(JSON.stringify({ error: "Erro interno" }), { status: 500 });
        }
      },
    },
  },
});