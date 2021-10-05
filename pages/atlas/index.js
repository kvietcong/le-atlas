import Head from "next/head";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { notes } from "../../utils/atlasManagement";
import NotePage from "../../components/NotePage";
import { useRouter } from "next/router";
import { AtlasContext } from "../_app";

export default function PostPage({ notes }) {
    const router = useRouter();
    const [ isShowingNav, setIsShowingNav ] = useState(false);
    const [ notePanes, setNotePanes ] = useState(["-_Index_-"]);
    const [ currentPane, setCurrentPane ] = useState(notePanes[0]);
    const { isDarkMode, setIsDarkMode } = useContext(AtlasContext);

    const addPane = (newPane, fromPane) => {
        const newIndex = notePanes.indexOf(newPane);
        const fromIndex = notePanes.indexOf(fromPane);
        if (newIndex < 0 || newIndex > fromIndex + 1) {
            setNotePanes([
                ...notePanes.slice(0, fromIndex + 1),
                newPane]);
        }
        setCurrentPane(newPane);
    };

    useEffect(() => {
        document.getElementById(currentPane)?.scrollIntoView({
            behavior: "smooth", inline: "start"
        });
    }, [ currentPane ])

    useEffect(() => {
        if(!router.isReady) return;
        const { query } = router;
        const newNotePanes = query?.notes
            && decodeURIComponent(query?.notes).split(";");
        if (newNotePanes) {
            setNotePanes(newNotePanes);
            setCurrentPane(newNotePanes[newNotePanes.length - 1])
        }
    }, [ router ]);

    useEffect(() => {
        if(!router.isReady) return;
        const { query } = router;
        const newQuery = encodeURIComponent(notePanes.join(";"));
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
            {notePanes.map(notePane =>
                <NotePage
                    key={notePane}
                    note={notes[notePane]}
                    addPane={addPane}
                />
            )}
        </main>
        <nav
            onMouseEnter={() => setIsShowingNav(true)}
            onMouseLeave={() => setIsShowingNav(false)}
        >
            <button hidden={isShowingNav}>▶️</button>
            <button onClick={() => setCurrentPane(notePanes[0])} hidden={!isShowingNav}>
                Go to first note
            </button>
            <button onClick={() => setCurrentPane(notePanes.at(-1))} hidden={!isShowingNav}>
                Go to last note
            </button>
            <button onClick={() => {
                navigator.clipboard.writeText(
                    document.location.origin +
                    "/atlas/?notes="
                    + decodeURIComponent(notePanes.join(";")));
            }} hidden={!isShowingNav}>
                Copy URL of current pages
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} hidden={!isShowingNav}>
                {`Switch to ${isDarkMode ? "Light" : "Dark"} Mode`}
            </button>
            <button hidden={!isShowingNav}>
                <Link href="/">Go To Main Page</Link>
            </button>
        </nav>
    </>);
};

export const getStaticProps = async context => {
    return { props: { notes } };
};