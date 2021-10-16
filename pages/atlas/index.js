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
    const [ isInitialized, setIsInitialized ] = useState(false);
    const [ notePanes, setNotePanes ] = useState(["-_Index_-"]);
    const [ currentPane, setCurrentPane ] = useState(notePanes[0]);
    const { isDarkMode, setIsDarkMode } = useContext(AtlasContext);

    const addPane = (newPane, fromPane) => {
        const newIndex = notePanes.indexOf(newPane);
        const fromIndex = notePanes.indexOf(fromPane);
        if (newIndex < 0 || newIndex > fromIndex + 1) {
            const newPanes = [...notePanes.slice(0, fromIndex + 1), newPane];
            setNotePanes(newPanes);
            router.push(`?notes=${newPanes.join(";")}`,
                        undefined,
                        { shallow: true });
        }
        setCurrentPane(newPane);
    };

    useEffect(() => {
        document.getElementById(currentPane)?.scrollIntoView({
            behavior: "smooth", inline: "start"
        });
    }, [ currentPane ])

    useEffect(() => {
        if(!router.isReady || isInitialized) return;
        const { query } = router;
        const newNotePanes = query?.notes
            && decodeURIComponent(query?.notes).split(";");
        if (newNotePanes) {
            setNotePanes(newNotePanes);
            setCurrentPane(newNotePanes[newNotePanes.length - 1])
        }
        setIsInitialized(true);
    }, [ router, isInitialized ]);

    const smoothScroll = (x, y) =>
        window.scroll({top: y, left: x, behavior: "smooth"});

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
            <button onClick={() => smoothScroll(0, 0)}
                hidden={!isShowingNav}
            >
                Go to first note
            </button>
            <button
                onClick={() =>
                    smoothScroll(notePanes.length * 1000, window.outerHeight)}
                hidden={!isShowingNav}
            >
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