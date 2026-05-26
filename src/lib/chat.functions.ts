import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getOrCreateConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("conversations").select("id,title,updated_at")
      .order("updated_at", { ascending: false }).limit(1).maybeSingle();
    if (existing) return { id: existing.id };
    const { data, error } = await supabase
      .from("conversations").insert({ user_id: userId, title: "Conversa com Especialista" })
      .select("id").single();
    if (error) throw new Error(error.message);
    return { id: data.id };
  });

export const listMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ conversationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("chat_messages").select("role,content,created_at")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const saveMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      conversationId: z.string().uuid(),
      role: z.enum(["user", "assistant"]),
      content: z.string().min(1).max(20000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: data.conversationId,
      user_id: userId,
      role: data.role,
      content: data.content,
    });
    if (error) throw new Error(error.message);
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", data.conversationId);
    return { ok: true };
  });

export const resetConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ conversationId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("chat_messages").delete().eq("conversation_id", data.conversationId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase.from("profiles").select("display_name,suitability").eq("user_id", userId).maybeSingle();
    return data ?? { display_name: null, suitability: null };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ displayName: z.string().trim().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: current } = await supabase.from("profiles").select("suitability").eq("user_id", userId).maybeSingle();
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: userId, display_name: data.displayName, suitability: current?.suitability ?? null }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true, display_name: data.displayName };
  });

export const setSuitability = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ suitability: z.enum(["Conservador", "Moderado", "Arrojado"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("profiles").update({ suitability: data.suitability }).eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });