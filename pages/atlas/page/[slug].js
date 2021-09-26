// https://github.com/highlightjs/highlight.js/tree/main/src/styles for more code styles
import "highlight.js/styles/nord.css";
import Head from "next/head";
import Link from "next/link";
import { useEffect } from "react";
import { notes, staticPaths } from "../../../utils/atlasManagement";

const scrollTop = () => window.scroll({ top: 0, left: 0, behavior: "smooth" });

const attachSmoothScroll = () =>
    document.querySelectorAll("a[href*='#']").forEach(anchor => {
        anchor.addEventListener("click", event => {
            event.preventDefault();
            document.getElementById(
                anchor.getAttribute("href").split("#")[1]
            ).scrollIntoView({
                behavior: "smooth"
            });
        })
    });

const mermaidIt = () => document.querySelectorAll("div.mermaid")
    .forEach(el => {
        if (el.firstChild.nodeName === "svg") return;
        mermaid && mermaid.render(
            `mermaid-${Math.round(Math.random() * 100)}`, el.innerText,
            svg => {
                const newEl = document.createElement("div");
                newEl.innerHTML = svg;
                el.parentElement.replaceChild(newEl, el);
            })
    });

export default function PostPage({ slug, metadata, content, inlinks }) {
    useEffect(attachSmoothScroll, []);

    return (<>
        <Head>
            <title>Le Atlas: {slug.replaceAll("_", " ")}</title>
        </Head>
        <nav>
            <button>
                <Link href="/">Go Back</Link>
            </button>
            <button onClick={mermaidIt}>Render Mermaid</button>
            <button>
                <Link href="#metadata">Go to Metadata</Link>
            </button>
            <button>
                <Link href="#inlinks">Go to Inlinks</Link>
            </button>
        </nav>
        <main className="atlas">
            <div dangerouslySetInnerHTML={{__html: content}}></div>
            <section id="inlinks">
                <h1>Inlinks: Pages that Reference this Page</h1>
                <ul>
                    {inlinks.length ? inlinks.map(({link, title}, i) => (
                        <li key={i}><Link href={`/atlas/page/${link}`}>
                            {title}
                        </Link></li>
                    )) : "No Inlinks :("}
                </ul>
                <button onClick={scrollTop}>Go Back Up</button>
            </section>
            <section id="metadata">
                <h1>Metadata</h1>
                <pre className="language-json">{metadata}</pre>
                <button onClick={scrollTop}>Go Back Up</button>
            </section>

        </main>
    </>);
};

export const getStaticPaths = async _context => {
    return { paths: staticPaths, fallback: false };
};

export const getStaticProps = async ({ params: { slug } }) => {
    const note = notes[slug];
    return {
        props: {
            slug,
            content: note.html || note.getHTML(),
            metadata: note.metadata,
            inlinks: note.inlinks,
            notes
        }
    };
};