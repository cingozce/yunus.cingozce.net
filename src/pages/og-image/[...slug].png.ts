import JetBrainsMono from "@/assets/fonts/jetbrainsmono-regular.ttf";
import NewsreaderItalic from "@/assets/fonts/newsreader-italic.ttf";
import NewsreaderRegular from "@/assets/fonts/newsreader-regular.ttf";
import NewsreaderSemiBold from "@/assets/fonts/newsreader-semibold.ttf";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site-config";
import { formatBylineDate } from "@/utils/date";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import { render } from "astro:content";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

function sanitizeForSatori(input: string): string {
    return input
        .replace(/<[^>]*>/g, '')           
        .replace(/&[a-z]+;/gi, ' ')        
        .replace(/[<>"'`]/g, '')           
        .trim()
        .slice(0, 120);                    
}

const ogOptions: SatoriOptions = {
    fonts: [
        { data: Buffer.from(NewsreaderRegular), name: "Newsreader", style: "normal", weight: 400 },
        { data: Buffer.from(NewsreaderSemiBold), name: "Newsreader", style: "normal", weight: 600 },
        { data: Buffer.from(NewsreaderItalic), name: "Newsreader", style: "italic", weight: 400 },
        { data: Buffer.from(JetBrainsMono), name: "JetBrains Mono", style: "normal", weight: 400 },
    ],
    height: 630,
    width: 1200,
    loadAdditionalAsset: async (code: string, segment: string) => {
        if (code === 'emoji') {
            return '';
        }
        throw new Error(`[SECURITY] satori blocked external asset load: ${segment}`);
    },
};

const SEP = " // ";

const titleClass = (title: string) =>
    title.length > 60
        ? "text-6xl leading-tight m-0"
        : title.length > 40
            ? "text-7xl leading-tight m-0"
            : "text-8xl leading-tight m-0";

const markup = (props: {
    eyebrow: string;
    title: string;
    byline: string;
    host: string;
    brand: string;
}) =>
    html`<div tw="flex flex-col w-full h-full p-16" style="background-color: #0c0a0a; font-family: 'JetBrains Mono';">
        
        <div tw="flex justify-between items-center w-full mb-16">
            <div tw="flex">
                <p tw="text-3xl font-bold tracking-widest m-0" style="color: #f5f5f5;">
                    <span style="color: #dc2626;">YUNUS</span>${props.brand}
                </p>
            </div>
            <div tw="flex">
                <p tw="text-lg tracking-widest uppercase m-0 px-5 py-2 border rounded-full" style="border-color: #dc2626; color: #dc2626;">
                    POWERED BY CINGOZCE.NET
                </p>
            </div>
        </div>

        <div tw="flex flex-col w-full flex-1 justify-center">
            <div tw="flex mb-4">
                <p tw="text-2xl font-bold tracking-widest uppercase m-0" style="color: #737373;">
                    ${props.eyebrow}
                </p>
            </div>
            
            <div tw="flex w-full">
                <h1 tw="${titleClass(props.title)} font-bold tracking-tighter" style="color: #f5f5f5; font-family: 'Newsreader';">
                    ${props.title}
                </h1>
            </div>
            
            <div tw="flex w-3/4 h-2 mt-8 mb-6" style="background-color: #dc2626;"></div>
            
            <div tw="flex">
                <p tw="text-2xl italic m-0" style="color: #a3a3a3; font-family: 'Newsreader';">
                    Security research, analysis, and operational field logs.
                </p>
            </div>
        </div>

        <div tw="flex flex-col w-full mt-8">
            <div tw="flex mb-4">
                <p tw="text-xl tracking-widest m-0" style="color: #737373;">
                    ${props.byline} ${SEP} ${props.host}
                </p>
            </div>
            <div tw="flex w-16 h-1" style="background-color: #dc2626;"></div>
        </div>

    </div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
    const { pubDate, title, tags, readingTime } = context.props as Props;

    const date = new Date(pubDate);
    
    const bylineParts = [
        formatBylineDate(date),
        readingTime,
    ].filter(Boolean) as string[];

    const host = context.site ? new URL(context.site).host : siteConfig.title;

    const formattedTags = tags.length > 0 
        ? tags.map(t => t.toUpperCase()).join(" / ") 
        : "SECURITY RESEARCH DIGEST";

    const svg = await satori(
        markup({
            eyebrow: sanitizeForSatori(formattedTags),
            title: sanitizeForSatori(title),
            byline: sanitizeForSatori(bylineParts.join(SEP)),
            host: sanitizeForSatori(host),
            brand: "CINGOZCE",
        }),
        ogOptions,
    );
    
    const png = new Resvg(svg).render().asPng();
    return new Response(new Uint8Array(png), {
        headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Type": "image/png",
        },
    });
}

export async function getStaticPaths() {
    const posts = await getAllPosts();
    const filtered = posts.filter(({ data }) => !data.ogImage);
    const items = await Promise.all(
        filtered.map(async (post) => {
            const { remarkPluginFrontmatter } = await render(post);
            const readingTime =
                (remarkPluginFrontmatter as { minutesRead?: string })?.minutesRead ?? "";
            return {
                params: { slug: post.id },
                props: {
                    pubDate: (post.data.updatedDate ?? post.data.publishDate).toISOString(),
                    title: post.data.title,
                    tags: post.data.tags ?? [],
                    readingTime,
                },
            };
        }),
    );
    return items;
}