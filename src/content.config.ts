import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

function removeDupsAndLowerCase(array: string[]) {
    if (!array.length) return array;
    const lowercaseItems = array.map((str) => str.toLowerCase());
    const distinctItems = new Set(lowercaseItems);
    return Array.from(distinctItems);
}

// Güvenlik Katmanı: Tüm HTML etiketlerini ve tehlikeli karakterleri temizleyen transformatör
const sanitizeString = z.string().transform((s) =>
    s.replace(/<[^>]*>/g, '').replace(/[<>"'`]/g, '').trim()
);

const post = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/post" }),
    schema: ({ image }) =>
        z.object({
            coverImage: z
                .object({
                    alt: z.string(),
                    src: image(),
                })
                .optional(),
            description: sanitizeString.pipe(z.string().min(10).max(160)),
            draft: z.boolean().default(false),
            
            // Zafiyet Kapatıldı & Uyarı Giderildi: Sadece güvenli şemalar ve göreceli yollar kabul ediliyor
            ogImage: z.string()
                .refine(
                    (val) => val.startsWith('https://') || val.startsWith('/'),
                    { message: "ogImage HTTPS protokolü veya kök göreceli bir yol kullanmalıdır" }
                )
                .optional(),
                
            publishDate: z
                .string()
                .or(z.date())
                .transform((val) => new Date(val)),
                
            tags: z.array(sanitizeString).default([]).transform(removeDupsAndLowerCase),
            
            title: sanitizeString.pipe(z.string().max(120)),
            updatedDate: z
                .string()
                .optional()
                .transform((str) => (str ? new Date(str) : undefined)),
        }),
});

const page = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/page" }),
    schema: () =>
        z.object({
            title: sanitizeString.pipe(z.string().max(120)),
            description: sanitizeString.pipe(z.string().max(160)).optional(),
        }),
});

export const collections = { post, page };