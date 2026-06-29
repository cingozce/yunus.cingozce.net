export interface ProfileConfig {
    name: string;
    email?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    mastodon?: string;
    jobTitle?: string;
    employer?: string;
    employerUrl?: string;
    alumni?: string;
    avatar?: string;
}

export interface AnalyticsConfig {
    googleAnalyticsId?: string;
    goatcounterUrl?: string;
}

export interface SiteConfig {
    author: string;
    date: {
        locale: string | string[] | undefined;
        options: Intl.DateTimeFormatOptions;
    };
    description: string;
    lang: string;
    ogLocale: string;
    sortPostsByUpdatedDate: boolean;
    title: string;
    profile?: ProfileConfig;
    analytics?: AnalyticsConfig;
    hideThemeCredit?: boolean;
}

export interface SiteMeta {
    articleDate?: string | undefined;
    description?: string;
    ogImage?: string | undefined;
    title: string;
}

export type AdmonitionType = "tip" | "note" | "important" | "caution" | "warning";