import Head from "next/head";
import { notes } from "../../../utils/atlasManagement";
import dynamic from "next/dynamic";

const MyForceGraph3D = dynamic(
    () => import("../../../components/MyForceGraph3D"),
    {ssr: false}
);

export default function Graph3DPage({ data, notes }) {
    return <>
        <Head>
            <title>Le Atlas: 3D Graph</title>
        </Head>
        <MyForceGraph3D data={data} notes={notes} />
    </>;
};

export const getStaticProps = async () => {
    const data = { nodes: [], links: [] };
    for (const noteInfo of Object.values(notes)) {
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
            notes,
            data,
        }
    };
};