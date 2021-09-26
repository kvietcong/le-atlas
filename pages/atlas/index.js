import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { notes } from "../../utils/atlasManagement";
import NotePage from "../../components/NotePage";
import { useRouter } from "next/router";

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

export default function PostPage({ notes }) {
    const router = useRouter();
    const [ notePanes, setNotePanes ] = useState(["-_Index_-"]);
    const [ currentPane, setCurrentPane ] = useState(notePanes[0]);

    const addPane = (newPane, fromPane) => {
        const newIndex = notePanes.indexOf(newPane);
        const fromIndex = notePanes.indexOf(fromPane);
        if (newIndex < 0 || newIndex > fromIndex) {
            setNotePanes([
                ...notePanes.slice(0, fromIndex + 1),
                newPane]);
        }
        setCurrentPane(newPane);
    };

    useEffect(() => {
        document.getElementById(currentPane)?.scrollIntoView({
            behavior: "smooth", inline: "center", block: "center"
        });
    }, [ currentPane ]);

    useEffect(() => {
        if(!router.isReady) return;
        const { query } = router;
        const newNotePanes = query?.notes && decodeURIComponent(query?.notes).split(",");
        if (newNotePanes) {
            setNotePanes(newNotePanes);
            setCurrentPane(newNotePanes[newNotePanes.length - 1]);
        }
    }, [ router ]);

    useEffect(() => {
        if(!router.isReady) return;
        const { query } = router;
        const newQuery = encodeURIComponent(notePanes.join(","));
        if (encodeURIComponent(query.notes) === newQuery) return;
        query.notes = newQuery;
        // Causes Lag atm
        // router.push(`?notes=${query.notes}`, undefined, { shallow: true });
    }, [ router, notePanes ])

    return (<>
        <Head>
            <title>Le Atlas</title>
        </Head>
        <nav>
            <button>
                <Link href="/">Go Back</Link>
            </button>
            <button onClick={mermaidIt}>Render Mermaid</button>
            <button onClick={() => {
                navigator.clipboard.writeText(
                    document.location.origin +
                    "/atlas/?notes="
                    + decodeURIComponent(notePanes.join(",")));
            }}>
                Copy URL of current pages
            </button>
        </nav>
        <main className="atlas">
            {notePanes.map((note, i) =>
                <NotePage key={i}
                    note={notes[note]} addPane={addPane}/>)}
        </main>
    </>);
};

export const getStaticProps = async context => {
    return { props: { notes } };
};