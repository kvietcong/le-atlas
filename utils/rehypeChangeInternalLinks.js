import { visit } from "unist-util-visit";

export const rehypeChangeInternalLinks = options => {
    return ast => {
        visit(ast, node => node.tagName === "a", node => {
            const { href } = node.properties
            if (href.includes("/atlas/page/")) {
                const parts = href.split("/");
                const slug = parts[parts.length - 2]
                node.tagName = "span";
                node.properties.href = undefined;
                node.properties.link = slug;
                node.properties.className = ["wikilink"]
            } else if (href.includes("http", "://")) {
                node.properties.className
                    ? node.properties.className += " external"
                    : node.properties.className = "external"
            }
            return node;
        });
    }
}

export default rehypeChangeInternalLinks;