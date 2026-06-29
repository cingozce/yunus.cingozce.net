import type { SiteConfig } from "@/types";
import type { AstroExpressiveCodeOptions } from "astro-expressive-code";

export const siteConfig: SiteConfig = {
    author: "Yunus CİNGÖZCE",
    date: {
        locale: "en-US",
        options: {
            day: "numeric",
            month: "short",
            year: "numeric",
        },
    },
    description:
        "Cybersecurity research, technical notes, and infrastructure documentation. A minimal digital workspace built for high-performance and strict security.",
    lang: "en-US",
    ogLocale: "en_US",
    sortPostsByUpdatedDate: false,
    title: "Yunus CİNGÖZCE",
    hideThemeCredit: true,
    profile: {
        name: "Yunus CİNGÖZCE",
        email: "yunus@cingozce.net",
        github: "https://github.com/cingozxe",
        linkedin: "https://tr.linkedin.com/in/xqrsolapkt",
        jobTitle: "Researcher",
        employer: "InfoSEC",
        employerUrl: "https://www.infosec.com",
        alumni: "Istanbul Bilgi University",
        avatar: "/avatar.png",
    },
};

export const menuLinks: { path: string; title: string }[] = [
    {
        path: "/",
        title: "Home",
    },
    {
        path: "/posts/",
        title: "Posts",
    },
    {
        path: "/about/",
        title: "About",
    },
];

export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
    styleOverrides: {
        borderRadius: "0px",
        codeBackground: "#000000",
        codeFontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;',
        codeFontSize: "0.875rem",
        codeLineHeight: "1.7142857rem",
        codePaddingInline: "1rem",
        frames: {
            editorActiveTabBackground: "#262626",
            editorTabBarBackground: "#000000",
            frameBoxShadowCssValue: "none",
            terminalBackground: "#000000",
            terminalTitlebarBackground: "#262626",
        },
        uiLineHeight: "inherit",
    },
    themeCssSelector(theme, { styleVariants }) {
        if (styleVariants.length >= 2) {
            const baseTheme = styleVariants[0]?.theme;
            const altTheme = styleVariants.find((v) => v.theme.type !== baseTheme?.type)?.theme;
            if (theme === baseTheme || theme === altTheme) return `[data-theme='${theme.type}']`;
        }
        return `[data-theme="${theme.name}"]`;
    },
    themes: ["github-dark"],
    useThemedScrollbars: true,
};