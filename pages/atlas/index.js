import "highlight.js/styles/base16/hardcore.css";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import Navigation from "../../components/Navigation";
import NotePage from "../../components/NotePage";
import { noteDatabase } from "../../utils/atlasManagement";

export default function PostPage({ noteDatabase }) {
    const router = useRouter();
    const [ isInitialized, setIsInitialized ] = useState(false);
    const [ notePanes, setNotePanes ] = useState([]);
    const [ currentPane, setCurrentPane ] = useState(notePanes[0]);

    const addPane = useCallback((newPane, fromPane) => {
        const newIndex = notePanes.indexOf(newPane);
        const fromIndex = notePanes.indexOf(fromPane);
        if ((newIndex < 0) || (newIndex > (fromIndex + 1))) {
            const newPanes = [...notePanes.slice(0, fromIndex + 1), newPane];
            setNotePanes(newPanes);
            router.push(`?notes=${newPanes.join(";")}`,
                        undefined,
                        { shallow: true });
        }
        setCurrentPane(newPane);
    }, [ notePanes, router ]);

    useEffect(() => {
        isInitialized && notePanes.length === 0 && addPane("-_Index_-")
    }, [ addPane, notePanes, isInitialized ]);

    useEffect(() => {
        document.getElementById(currentPane)?.scrollIntoView({
            behavior: "smooth", inline: "start"
        });
    }, [ currentPane ]);

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
    }, [ router, isInitialized, notePanes ]);

    return (<>
        <Head>
            <title>Le Atlas</title>
        </Head>
        <Navigation notePanes={notePanes} reset={() => setNotePanes([])}/>
        <main id="atlas-pages">
            {notePanes.map(notePane =>
                <NotePage
                    key={notePane}
                    note={noteDatabase[notePane]}
                    addPane={addPane}
                    getTitle={slug => noteDatabase[slug]?.title}
                />
            )}
        </main>
    </>);
};

export const getStaticProps = async _context => {
    return { props: { noteDatabase } };
};