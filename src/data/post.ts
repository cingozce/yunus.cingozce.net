import { type CollectionEntry, getCollection } from "astro:content";
import { siteConfig } from "@/site-config";

export async function getAllPosts(): Promise<CollectionEntry<"post">[]> {
	return await getCollection("post", ({ data }) => {
		return import.meta.env.PROD ? !data.draft : true;
	});
}

export function getPostSortDate(post: CollectionEntry<"post">): Date {
	return siteConfig.sortPostsByUpdatedDate && post.data.updatedDate !== undefined
		? new Date(post.data.updatedDate)
		: new Date(post.data.publishDate);
}

export function sortMDByDate(posts: CollectionEntry<"post">[]): CollectionEntry<"post">[] {
	return posts.sort((a, b) => {
		const aDate = getPostSortDate(a).valueOf();
		const bDate = getPostSortDate(b).valueOf();
		return bDate - aDate;
	});
}
