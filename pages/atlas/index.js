import Head from "next/head";
import Link from "next/link";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import { useContext, useEffect, useState } from "react";
import { notes } from "../../utils/atlasManagement";
import NotePage from "../../components/NotePage";
import { useRouter } from "next/router";
import { AtlasContext } from "../_app";

const mermaidIt = () => {
    document.querySelectorAll("div.mermaid") .forEach(el => {
        if (el.firstChild.nodeName === "svg") return;
        mermaid && mermaid.render(
            `mermaid-${Math.round(Math.random() * 100)}`, el.innerText,
            svg => {
                const newEl = document.createElement("div");
                newEl.innerHTML = svg;
                el.parentElement.replaceChild(newEl, el);
            })
    });
};

export default function PostPage({ notes }) {
    const router = useRouter();
    const [ isShowingNav, setIsShowingNav ] = useState(true);
    const [ notePanes, setNotePanes ] = useState(["-_Index_-"]);
    const [ currentPane, setCurrentPane ] = useState(notePanes[0]);
    const [ isDeletingMany, setIsDeletingMany ] = useState(false);
    const { isDarkMode, setIsDarkMode } = useContext(AtlasContext);

    const addPane = (newPane, fromPane) => {
        const newIndex = notePanes.indexOf(newPane);
        const fromIndex = notePanes.indexOf(fromPane);
        setIsDeletingMany(notePanes.length - fromIndex > 4);
        if (newIndex < 0 || newIndex > fromIndex + 1) {
            setNotePanes([
                ...notePanes.slice(0, fromIndex + 1),
                newPane]);
        }
        setCurrentPane(newPane);
    };

    useEffect(() => {
        setTimeout(() =>
            document.getElementById(currentPane)?.scrollIntoView({
                behavior: "smooth", inline: "start"
            }), isDeletingMany ? 1500 : 0)
    }, [ currentPane, isDeletingMany ])

    useEffect(() => {
        if(!router.isReady) return;
        const { query } = router;
        const newNotePanes = query?.notes
            && decodeURIComponent(query?.notes).split(",");
        if (newNotePanes) {
            setIsDeletingMany(true);
            setNotePanes(newNotePanes);
            setCurrentPane(newNotePanes[newNotePanes.length - 1])
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
        <main className="atlas">
            {/* NGL Pretty janky at times but it looks Epic XD */}
            <TransitionGroup component={null}>
                {notePanes.map(note =>
                    <CSSTransition classNames="page" key={note} timeout={1000}>
                        <NotePage note={notes[note]} addPane={addPane} />
                    </CSSTransition>)}
            </TransitionGroup>
        </main>
        <nav>
            <button onClick={() => setIsShowingNav(!isShowingNav)}>
                Toggle Navigation
            </button>
            <button hidden={!isShowingNav}>
                <Link href="/">Go Back</Link>
            </button>
            <button onClick={mermaidIt} hidden={!isShowingNav}>Render Mermaid</button>
            <button onClick={() => {
                navigator.clipboard.writeText(
                    document.location.origin +
                    "/atlas/?notes="
                    + decodeURIComponent(notePanes.join(",")));
            }} hidden={!isShowingNav}>
                Copy URL of current pages
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} hidden={!isShowingNav}>
                {`Switch to ${isDarkMode ? "Light" : "Dark"} Mode`}
            </button>
        </nav>
    </>);
};

export const getStaticProps = async context => {
    return { props: { notes } };
};