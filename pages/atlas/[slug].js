import "highlight.js/styles/base16/hardcore.css";
import dynamic from "next/dynamic";
import { noteDatabase } from "../../utils/atlasManagement";
import { markdownToReact } from "../../utils/parsing";
import Navigation from "../../components/Navigation";
const ReactJson = dynamic(() => import("react-json-view"), {ssr: false});

export default function Page({ localNoteDatabase, slug }) {
    const noteInfo = localNoteDatabase[slug];
    const { content, inlinks } = noteInfo;

    return (<>
        <Navigation></Navigation>
        <main className="page">
            <h2>Table of Contents</h2>
            {markdownToReact(content)}
            <section className="inlinks">
                <h2>Inlinks</h2>
                <ul>
                    {inlinks.length ? inlinks.map((slug, i) => (
                        <li key={i}><span
                            className="wikilink"
                            onClick={() => addPane(slug, fromPane)}
                        >{localNoteDatabase[slug].title}</span></li>
                    )) : "No Inlinks :("}
                </ul>
            </section>
        </main>
    </>);
};

export const getStaticProps = async ({ params }) => {
    const { slug } = params;

    const { inlinks, outlinks } = noteDatabase[slug];
    const localNoteSlugs = inlinks.concat(outlinks).concat([slug]);

    const localNoteDatabase = localNoteSlugs.reduce((accumulated, slug) => {
        accumulated[slug] = noteDatabase[slug];
        return accumulated;
    }, {});

    return { props: { localNoteDatabase, slug } };
}

export const getStaticPaths = async _context => {
    const paths =
        Object.keys(noteDatabase).map(slug => ({ params: { slug } }));
    return {
        paths,
        fallback: false
    };
};