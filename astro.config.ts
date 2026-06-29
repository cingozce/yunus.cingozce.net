import { openSync, fstatSync, readSync, closeSync } from "node:fs";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import { defineConfig } from "astro/config";
import partytown from "@astrojs/partytown";

import { expressiveCodeOptions, siteConfig } from "./src/site.config";
import { rehypeBasePath } from "./src/plugins/rehype-base-path";
import { remarkAdmonitions } from "./src/plugins/remark-admonitions";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";

import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import rehypeUnwrapImages from "rehype-unwrap-images";

const BASE_PATH = process.env.BASE_PATH || "/";
const START_URL = BASE_PATH.endsWith("/") ? BASE_PATH : `${BASE_PATH}/`;

// Güvenlik Katmanı: rawFonts için güvenli dizin çözümü (CWD yerine dosya tabanlı)
const CONFIG_DIR = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    site: "https://yunus.cingozce.net",
    base: BASE_PATH,
    image: { domains: [] },
    output: "static",
    build: { inlineStylesheets: "always" },
    integrations: [
        partytown({ config: { forward: ["dataLayer.push"] } }),
        expressiveCode(expressiveCodeOptions),
        icon(),
        tailwind({ applyBaseStyles: false }),
        sitemap({ changefreq: "weekly", priority: 0.7, lastmod: new Date() }),
        mdx(),
        robotsTxt(),
        webmanifest({
            name: siteConfig.title,
            description: siteConfig.description,
            lang: siteConfig.lang,
            icon: "public/icon.png",
            icons: [
                { src: "icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
                { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
                { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
            ],
            start_url: START_URL,
            background_color: "#000000",
            theme_color: "#262626",
            display: "standalone",
            config: { insertFaviconLinks: false, insertThemeColorMeta: false, insertManifestLink: false },
        }),
        (await import("@playform/compress")).default(),
    ],
    markdown: {
        rehypePlugins: [
            rehypeUnwrapImages,
            [rehypeBasePath, { base: BASE_PATH }],
            rehypeKatex,
            [
                rehypeExternalLinks,
                { rel: ["nofollow", "noreferrer"], target: "_blank" },
            ],
        ],
        remarkPlugins: [remarkReadingTime, remarkDirective, remarkAdmonitions, remarkMath],
        remarkRehype: { footnoteLabelProperties: { className: [""] } },
    },
    prefetch: true,
    vite: {
        optimizeDeps: { exclude: ["@resvg/resvg-js"] },
        plugins: [rawFonts([".ttf", ".woff"])],
    },
});

function rawFonts(ext: string[]) {
    const FONTS_DIR = path.resolve(CONFIG_DIR, "src/assets/fonts");

    return {
        name: "vite-plugin-raw-fonts",
        transform(_: unknown, id: string) {
            if (!ext.some((e) => id.endsWith(e))) return;

            try {
                const resolved = path.resolve(id);
                const real = fs.realpathSync(resolved);
                
                if (!real.startsWith(FONTS_DIR + path.sep)) {
                    throw new Error(`[SECURITY] Path traversal blocked: ${real}`);
                }

                // Zafiyet Kapatıldı (Finding #7): TOCTOU engellemek için Atomik okuma
                const fd = openSync(real, 'r');
                try {
                    const { size } = fstatSync(fd);
                    if (size > 5 * 1024 * 1024) throw new Error("Font file too large");
                    const buffer = Buffer.alloc(size);
                    readSync(fd, buffer, 0, size, 0);
                    return {
                        code: `export default ${JSON.stringify(buffer)}`,
                        map: null,
                    };
                } finally {
                    closeSync(fd);
                }
            } catch (error) {
                console.warn(`[rawFonts] Rejected: ${id}`);
                return;
            }
        },
    };
}