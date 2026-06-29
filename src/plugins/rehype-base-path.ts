import type { Element, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

interface Options {
	base: string;
}

const URL_ATTR: Record<string, "href" | "src"> = {
	a: "href",
	img: "src",
};


export const rehypeBasePath: Plugin<[Options], Root> = ({ base }) => {
	const prefix = base.replace(/\/+$/, "");
	if (!prefix) return () => {}; // root deploy: nothing to do

	return (tree) => {
		visit(tree, "element", (node: Element) => {
			const attr = URL_ATTR[node.tagName];
			if (!attr) return;
			const value = node.properties?.[attr];
			if (typeof value !== "string") return;
			if (
				value.startsWith("/") &&
				!value.startsWith("//") &&
				!value.startsWith(`${prefix}/`)
			) {
				node.properties[attr] = `${prefix}${value}`;
			}
		});
	};
};
