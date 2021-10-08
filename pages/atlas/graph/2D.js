import Head from "next/head";
import { notes } from "../../../utils/atlasManagement";
import dynamic from "next/dynamic";
import Router from "next/router";
import SpriteText from "three-spritetext";
import { useMemo } from "react";
const ForceGraph3D = dynamic(
    () => import("react-force-graph").then(module => module.ForceGraph3D),
    {ssr: false}
);


export default function Graph2DPage({ notes, data }) {
    useMemo(() => notes, [notes]);
    useMemo(() => data, [data]);
    return <>
        <Head>
            <title>Le Atlas: 3D Graph</title>
        </Head>
        <ForceGraph3D
            controlType="orbit"
            graphData={data}
            nodeThreeObjectExtend={true}
            nodeAutoColorBy="group"
            linkWidth={2}
            nodeVal={({value}) => value}
            linkDirectionalParticleResolution={2}
            linkDirectionalParticles={8}
            linkDirectionalParticleWidth={1}
            linkDirectionalParticleSpeed={0.005}
            nodeLabel={node => notes[node.id].title}
            nodeThreeObject={node => {
                const sprite = new SpriteText(notes[node.id].title);
                sprite.color = node.color;
                sprite.textHeight = node.value;
                sprite.padding = 5;
                return node.value >= 6 ? sprite : null;
            }}
            onNodeClick={node => {
                console.log(node.id)
                Router.push(`/atlas/page/${node.id}`)
            }}
        />
    </>;
};

export const getStaticProps = async () => {
    const data = { nodes: [], links: [] };
    for (const note of Object.values(notes)) {
        data.nodes.push({
            id: note.link,
            value: Math.round((note.outlinks.length / 2 + note.inlinks.length) / 2),
            group: note.link,
        });
        for (const inlink of note.inlinks) {
            data.links.push({
                source: inlink.link,
                target: note.link,
                value: 10
            });
        }
    }
    return {
        props: {
            notes,
            data
        }
    };
};