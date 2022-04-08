import { noteDatabase } from "../../../utils/atlasManagement";
import dynamic from "next/dynamic";
const ForceGraph3D = dynamic(
    () => import("react-force-graph").then(module => module.ForceGraph3D),
    {ssr: false}
);


export default function Graph2DPage({ noteDatabase, data }) {
    return (<h1>Yeah not yet :(</h1>)
};

export const getStaticProps = async () => {
    const data = { nodes: [], links: [] };
    for (const noteInfo of Object.values(noteDatabase)) {
        data.nodes.push({
            id: noteInfo.slug,
            value: Math.round((noteInfo.outlinks.length / 2 + noteInfo.inlinks.length) / 2),
        });
        for (const inlinkSlug of noteInfo.inlinks) {
            data.links.push({
                source: inlinkSlug,
                target: noteInfo.slug,
                value: 10
            });
        }
    };

    return {
        props: {
            noteDatabase,
            data,
        }
    };
};