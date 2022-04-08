import React from "react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFormat from "rehype-format";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeReact from "rehype-react";
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
            if (href.includes("/atlas/")) {
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

const parseMarkdown = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkFootnotes, { inlineNotes: true })
    .parse;

const applyMarkdownAstExtensions = unified()
    .use(remarkSlug)
    .runSync;

const markdownAstToHtmlAst = unified().use(remarkRehype).runSync;

const applyHtmlAstExtensions = (ast, options) => {
    const pipeline = unified()
        .use(rehypeExternalLinks)
        .use(rehypeFixMermaid)
        .use(rehypeHighlight,
            {
                ignoreMissing: true,
                aliases: {
                    javascript: [ "js", "dataviewjs" ],
                    sql: [ "dataview" ]
                }
            }
        )
        .use(toc, { nav: false })
        .use(rehypeKatex)
        .use(rehypeFormat);
    if (options?.onClick) pipeline.use(rehypeChangeInternalLinks);
    return pipeline.runSync(ast);
};

export const htmlAstToReact = (htmlAst, options) => unified()
    .use(rehypeReact, {
        createElement: React.createElement,
        components: {
            span: span => {
                let newSpan;
                if (span.link && options?.onClick) {
                    newSpan = <span
                        onClick={() => options.onClick(span.link)}
                        {...span} />;
                }
                return newSpan || <span {...span}></span>;
            },
            a: a => {
                let newA;
                if (options?.onEnter && options?.onLeave && a.href.contains("/atlas/")) {
                    newA = <a onMouseEnter={() => {}} onMouseLeave={() => {}} {...a} />;
                }
                return newA || <a {...a}></a>;
            },
        },
    })
    .stringify(htmlAst);

export const markdownToHtmlAst = markdown => {
    try {
        const markdownAst = parseMarkdown(markdown);
        const modifiedMarkdownAst = applyMarkdownAstExtensions(markdownAst);

        const htmlAst = markdownAstToHtmlAst(modifiedMarkdownAst);
        return applyHtmlAstExtensions(htmlAst);
    } catch (error) {
        console.error("Error in Parsing and Processing");
        console.error(error);
    }
};

export const markdownToReact = (markdown, options) => {
    try {
        const markdownAst = parseMarkdown(markdown);
        const modifiedMarkdownAst = applyMarkdownAstExtensions(markdownAst);

        const htmlAst = markdownAstToHtmlAst(modifiedMarkdownAst);
        const modifiedHTMLAst = applyHtmlAstExtensions(htmlAst, options);

        const react = htmlAstToReact(modifiedHTMLAst, options);
        return react;
    } catch (error) {
        console.error("Error in Parsing and Processing");
        console.error(error);
    }
};