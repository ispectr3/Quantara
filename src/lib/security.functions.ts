import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type IpApiResponse = {
  status?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
  isp?: string;
  org?: string;
  lat?: number;
  lon?: number;
  query?: string;
  message?: string;
};

function pickIp(): string | null {
  const candidates = [
    getRequestHeader("cf-connecting-ip"),
    getRequestHeader("x-real-ip"),
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim(),
  ];
  for (const c of candidates) if (c && c !== "::1" && c !== "127.0.0.1") return c;
  return null;
}

export const logAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        event: z
          .string()
          .max(64)
          .regex(/^[a-z_]+$/)
          .optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const ip = pickIp();
    const userAgent = getRequestHeader("user-agent") ?? null;
    let enriched: IpApiResponse = {};
    if (ip) {
      try {
        const res = await fetch(
          `https://ipwho.is/${encodeURIComponent(ip)}`
        );
        if (res.ok) enriched = (await res.json()) as IpApiResponse;
      } catch (e) {
        console.error("ip-api error", e);
      }
    }
    const { error } = await supabase.from("access_logs").insert({
      user_id: userId,
      event: data.event ?? "login",
      ip,
      country: enriched.country ?? null,
      country_code: enriched.countryCode ?? null,
      region: enriched.regionName ?? null,
      city: enriched.city ?? null,
      isp: enriched.isp ?? null,
      org: enriched.org ?? null,
      lat: enriched.lat ?? null,
      lon: enriched.lon ?? null,
      user_agent: userAgent,
    });
    if (error) {
      console.error("access_logs insert error", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, ip, country: enriched.country ?? null, city: enriched.city ?? null };
  });