// https://github.com/highlightjs/highlight.js/tree/main/src/styles for more code styles
import "highlight.js/styles/nord.css";
import { useEffect, useRef } from "react";
import { htmlAstToReact, markdownToReact } from "../utils/parsing";

const attachSmoothScroll = ref =>
    ref.current.querySelectorAll("a[href^='#']").forEach(anchor => {
        const link = anchor.getAttribute("href").split("#")[1];
        anchor.addEventListener("click", event => {
            console.log(link, ref.current.querySelector(`[id="${link}"]`))
            event.preventDefault();
            // This leaves behind event listeners that don't do anything so I
            // had to do a null check. React doesn't seem to clean them up.
            ref.current.querySelector(`[id="${link}"]`)?.scrollIntoView({
                behavior: "smooth"
            });
        });
    });

export default function NotePage({ note, addPane }) {
    const { htmlAst, inlinks, metadata, link: fromPane } = note;

    const pageRef = useRef();
    const scrollToTop = () =>
        pageRef.current.scroll({ top: 0, left: 0, behavior: "smooth" });

    useEffect(() => attachSmoothScroll(pageRef), [ note ]);

    return <section id={fromPane} ref={pageRef} className="note-page">
        <button onClick={scrollToTop}>Scroll to top</button>
        <section className="content">
            {/* The method below goes from content to render but takes longer */}
            {/* {markdownToReact(content, { addPane, fromPane })} */}

            {/* This method has the static generation handle everything except
                for the actual React parsing part. HOWEVER, this uses
                `JSON.stringify` and `JSON.parse`, which I'm skeptical of. */}
            {htmlAstToReact(JSON.parse(htmlAst), { addPane, fromPane })}
        </section>
        <section className="inlinks">
            <h1>Inlinks: Pages that Reference this Page</h1>
            <ul>
                {inlinks.length ? inlinks.map(({link, title}, i) => (
                    <li key={i}><span
                        className="wikilink"
                        onClick={() => addPane(link, fromPane)}
                    >
                        {title}
                    </span></li>
                )) : "No Inlinks :("}
            </ul>
        </section>
        <section className="metadata">
            <h1>Metadata</h1>
            <pre>{metadata}</pre>
        </section>
    </section>
}