import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://quantarainvest.lovable.app";

const ROUTES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/noticias", priority: "0.9", changefreq: "hourly" },
  { path: "/carteiras", priority: "0.9", changefreq: "weekly" },
  { path: "/comparador", priority: "0.8", changefreq: "weekly" },
  { path: "/internacional", priority: "0.8", changefreq: "daily" },
  { path: "/cripto", priority: "0.8", changefreq: "hourly" },
  { path: "/seguros", priority: "0.6", changefreq: "monthly" },
  { path: "/advisor", priority: "0.7", changefreq: "monthly" },
  { path: "/contato", priority: "0.5", changefreq: "monthly" },
  { path: "/privacidade", priority: "0.3", changefreq: "yearly" },
  { path: "/termos", priority: "0.3", changefreq: "yearly" },
] as const;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = ROUTES.map(
          (r) =>
            `  <url>\n    <loc>${BASE_URL}${r.path}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});