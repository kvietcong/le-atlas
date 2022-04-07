import { useEffect, useRef, useContext } from "react";
import { htmlAstToReact } from "../utils/parsing";
import { useSpring, animated } from "react-spring";
import dynamic from "next/dynamic";
import { AtlasContext } from "../pages/_app";

const ReactJson = dynamic(() => import("react-json-view"), {ssr: false});

const renderMermaid = ref =>
    ref.current.querySelectorAll("div.mermaid") .forEach(el => {
        if (el.firstChild.nodeName === "svg") return;
        mermaid && mermaid.render(
            `mermaid-${Math.round(Math.random() * 100)}`, el.innerText,
            svg => {
                const newEl = document.createElement("div");
                newEl.innerHTML = svg;
                el.parentElement.replaceChild(newEl, el);
            })
    });

const attachSmoothScroll = ref =>
    ref.current.querySelectorAll("a[href^='#']").forEach(anchor => {
        const link = anchor.getAttribute("href").split("#")[1];
        anchor.addEventListener("click", event => {
            event.preventDefault();
            // This leaves behind event listeners that don't do anything so I
            // had to do a null check. React doesn't seem to clean them up.
            ref.current.querySelector(`[id="${link}"]`)?.scrollIntoView({
                behavior: "smooth"
            });
        });
    });

export default function NotePage({ note, addPane, getTitle }) {
    const pageRef = useRef();
    const { htmlAst, inlinks, metadata, slug: fromPane } = note;
    const spring = useSpring({
        from: { opacity: 0, x: "-75%" },
        to: { opacity: 1, x: "0" }
    });

    const { isDarkMode } = useContext(AtlasContext);

    const scrollToTop = () =>
        pageRef.current.scroll({ top: 0, left: 0, behavior: "smooth" });

    const scrollToBottom = () =>
        pageRef.current.scroll({
            top: pageRef.current.scrollHeight, left: 0, behavior: "smooth"
        });

    useEffect(() => attachSmoothScroll(pageRef), [ note ]);
    useEffect(() => renderMermaid(pageRef), [ note ]);

    const stickyRight = { position: "sticky", float: "right", zIndex: 10 };
    const scrollTopStyle = {...stickyRight, top: "15px" };
    const scrollBotStyle = {...stickyRight, bottom: "15px" };

    return <animated.section
        style={spring}
        id={fromPane}
        ref={pageRef}
        className="atlas-page"
    >
        <button style={scrollTopStyle} onClick={scrollToTop}>
            Scroll to top
        </button>
        <section className="content">
            <ReactJson
                name={"Metadata"} collapsed={true} displayDataTypes={false}
                quotesOnKeys={false} displayArrayKey={false} indentWidth={2}
                theme={isDarkMode ? "greenscreen" : "bespin"}
                style={{
                    borderRadius: "5px",
                    padding: "10px",
                }}
                src={(() => {
                    const parsedMetadata = JSON.parse(metadata)
                    return parsedMetadata;
                })()}
            />
            {/* The method below goes from content to render but takes longer */}
            {/* {markdownToReact(content, { addPane, fromPane })} */}

            {/* This method has the static generation handle everything except
                for the actual React transformation part. HOWEVER, this uses
                `JSON.stringify` and `JSON.parse`, which I'm skeptical of for
                complex data structure situations like this. */}
            {htmlAstToReact(JSON.parse(htmlAst), { addPane, fromPane })}
        </section>
        <section className="inlinks">
            <h2>Inlinks</h2>
            <ul>
                {inlinks.length ? inlinks.map((slug, i) => (
                    <li key={i}><span
                        className="wikilink"
                        onClick={() => addPane(slug, fromPane)}
                    >
                        {getTitle(slug)}
                    </span></li>
                )) : "No Inlinks :("}
            </ul>
        </section>
        <button style={scrollBotStyle} onClick={scrollToBottom}>
            Scroll to bottom
        </button>
    </animated.section>
};