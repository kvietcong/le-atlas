import React from "react";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFormat from "rehype-format";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeMeta from "rehype-meta";
import rehypeReact from "rehype-react/lib";
import rehypeStringify from "rehype-stringify";
import toc from "rehype-toc";
import remarkFootnotes from "remark-footnotes";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSlug from "remark-slug";
import { unified } from "unified";
import rehypeChangeInternalLinks from "./rehypeChangeInternalLinks";
import rehypeFixMermaid from "./rehypeFixMermaid";

export const mdToHTML = (content, metadata) =>
    unified()
        .use(remarkParse)
        .use(remarkFootnotes, { inlineNotes: true })
        .use(remarkMath)
        .use(remarkSlug)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeExternalLinks)
        .use(rehypeFormat)
        .use(rehypeHighlight, { ignoreMissing: true })
        .use(rehypeMeta, metadata)
        .use(toc, { nav: false })
        .use(rehypeFixMermaid)
        .use(rehypeChangeInternalLinks)
        .use(rehypeStringify)
        .processSync(content)
        .toString()

export const mdToReact = (content, addPane, fromPane) =>
    unified()
        .use(remarkParse)
        .use(remarkFootnotes, { inlineNotes: true })
        .use(remarkMath)
        .use(remarkSlug)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeKatex)
        .use(rehypeExternalLinks)
        .use(rehypeFormat)
        .use(rehypeHighlight, { ignoreMissing: true })
        .use(toc, { nav: false })
        .use(rehypeFixMermaid)
        .use(rehypeChangeInternalLinks)
        // SO WACK XD. This couples the code so much.
        // Bad software engineering at its finest.
        .use(rehypeReact, {
            createElement: React.createElement,
            components: {
                span: span => {
                    let newSpan;
                    if (span.link) {
                        newSpan = <span
                            onClick={() =>
                                addPane(span.link, fromPane)}
                            {...span} />
                    }
                    return newSpan || <span {...span}></span>;
                }
            },
        })
        .processSync(content).result;