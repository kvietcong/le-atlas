// https://github.com/highlightjs/highlight.js/tree/main/src/styles for more code styles
import "highlight.js/styles/nord.css";
import { useEffect, useRef } from "react";
import { mdToReact } from "../utils/parsers";

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
    const { content, inlinks, metadata } = note;

    const pageRef = useRef();
    const scrollToTop = () =>
        pageRef.current.scroll({ top: 0, left: 0, behavior: "smooth" });

    useEffect(() => attachSmoothScroll(pageRef), [ note ]);

    return <section id={note.link} ref={pageRef} className="note-page">
        <section className="content">
            {mdToReact(content, addPane, note.link)}
        </section>
        <section className="inlinks">
            <h1>Inlinks: Pages that Reference this Page</h1>
            <ul>
                {inlinks.length ? inlinks.map(({link, title}, i) => (
                    <li key={i}><span
                        className="wikilink"
                        onClick={() => addPane(link, note.link)}
                    >
                        {title}
                    </span></li>
                )) : "No Inlinks :("}
            </ul>
            <button onClick={scrollToTop}>Scroll To Top</button>
        </section>
        <section className="metadata">
            <h1>Metadata</h1>
            <pre className="language-json">{metadata}</pre>
            <button onClick={scrollToTop}>Scroll To Top</button>
        </section>
    </section>
}