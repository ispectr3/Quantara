import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      email: z.string().email().max(320),
      source: z.string().max(64).optional(),
      lang: z.enum(["pt", "en"]).default("pt"),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await sb
      .from("newsletter_subscribers")
      .upsert(
        { email: data.email.toLowerCase(), source: data.source ?? null, lang: data.lang },
        { onConflict: "email", ignoreDuplicates: true },
      );
    if (error && !/duplicate/i.test(error.message)) {
      throw new Error(error.message);
    }
    return { ok: true };
  });