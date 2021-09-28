import React from "react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFormat from "rehype-format";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeReact from "rehype-react";
import rehypeStringify from "rehype-stringify/lib";
import toc from "rehype-toc";
import remarkFootnotes from "remark-footnotes";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSlug from "remark-slug";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const rehypeChangeInternalLinks = options => {
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
            } else if (["http", "://"].every(type => href.includes(type))) {
                node.properties.className
                    ? node.properties.className += " external"
                    : node.properties.className = "external"
            }
            return node;
        });
    }
}

const rehypeFixMermaid = options => {
    return ast => {
        visit(ast, node => node.tagName === "code", node => {
            if (node.properties?.className?.includes("language-mermaid")) {
                node.properties.className = [ "mermaid" ];
                node.tagName = "div";
            }
            return node;
        });
    }
};

const parseMarkdown = unified().use(remarkParse).parse;

const applyMarkdownAstExtensions = unified()
    .use(remarkFootnotes, { inlineNotes: true })
    .use(remarkMath)
    .use(remarkSlug)
    .use(remarkGfm)
    .runSync;

const markdownAstToHtmlAst = unified().use(remarkRehype).runSync;

const applyHtmlAstExtensions = unified()
    .use(rehypeExternalLinks)
    .use(rehypeFixMermaid)
    .use(rehypeHighlight,
        {
            ignoreMissing: true,
            aliases: {
                javascript: [ "js", "dataviewjs"],
                sql: [ "dataview" ]
            }
        }
    )
    .use(toc, { nav: false })
    .use(rehypeKatex)
    .use(rehypeFormat)
    .use(rehypeChangeInternalLinks)
    .runSync

export const htmlAstToReact = (htmlAST, options) => unified()
    .use(rehypeReact, {
        createElement: React.createElement,
        components: {
            span: span => {
                let newSpan;
                if (span.link) {
                    const { addPane, fromPane } = options;
                    newSpan = <span
                        onClick={() =>
                            addPane(span.link, fromPane)}
                        {...span} />;
                }
                return newSpan || <span {...span}></span>;
            }
        },
    })
    .stringify(htmlAST);

export const markdownToHtmlAst = markdown => {
    try {
        const markdownAST = parseMarkdown(markdown);
        const modifiedMarkdownAST = applyMarkdownAstExtensions(markdownAST);

        const htmlAST = markdownAstToHtmlAst(modifiedMarkdownAST);
        return applyHtmlAstExtensions(htmlAST);
    } catch (error) {
        console.error("Error in Parsing and Processing");
        console.error(error);
    }
};

export const markdownToReact = (markdown, options) => {
    try {
        const markdownAST = parseMarkdown(markdown);
        const modifiedMarkdownAST = applyMarkdownAstExtensions(markdownAST);

        const htmlAST = markdownAstToHtmlAst(modifiedMarkdownAST);
        const modifiedHTMLAST = applyHtmlAstExtensions(htmlAST);

        const react = htmlAstToReact(modifiedHTMLAST, options);
        return react;
    } catch (error) {
        console.error("Error in Parsing and Processing");
        console.error(error);
    }
};