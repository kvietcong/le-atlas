import { visit } from "unist-util-visit";

export const rehypeFixMermaid = options => {
    return ast => {
        visit(ast, node => node.tagName === "code", node => {
            if (node.properties?.className?.includes("language-mermaid")) {
                node.properties.className = [ "mermaid" ];
                node.tagName = "div";
            }
            return node;
        });
    }
}

export default rehypeFixMermaid;