import Head from "next/head";
import { notes } from "../../../utils/atlasManagement";
import dynamic from "next/dynamic";
import Router from "next/router";
import SpriteText from "three-spritetext";
import { useEffect, useRef } from "react";
// Open issue on Next
const ForceGraph3D = dynamic(
    () => import("react-force-graph").then(module => module.ForceGraph3D),
    {ssr: false}
);

export default function Graph3DPage({ notes, data }) {
    const graphRef = useRef();
    useEffect(() => {
        // TODO: Find out why this doesn't work
        console.log(graphRef.current)
        graphRef && graphRef.current && graphRef.current.d3Force && graphRef.current.d3Force("link", link => 1000);
    }, []);

    return <>
        <Head>
            <title>Le Atlas: 3D Graph</title>
        </Head>
        <ForceGraph3D
            ref={graphRef}
            graphData={data}
            nodeLabel={node => notes[node.id].title}
            nodeAutoColorBy="id"
            controlType="fly"
            nodeThreeObjectExtend={true}
            linkWidth={2}
            nodeVal={({value}) => value}
            linkDirectionalParticles={10}
            linkDirectionalParticleWidth={1}
            linkDirectionalParticleSpeed={0.006}
            linkResolution={2}
            linkOpacity={0.25}
            linkColor={({ source }) => source.color }
            linkDirectionalParticleColor={({ source }) => source.color}
            nodeThreeObject={node => {
                const sprite = new SpriteText(notes[node.id].title);
                sprite.color = "#FFFFFF";
                sprite.material.depthWrite = false;
                sprite.color += Math.min(node.value * 75, 255).toString(16);
                sprite.textHeight = node.value / 2;
                sprite.padding = 5;
                return node.value > 0 ? sprite : null;
            }}
            onNodeClick={node => {
                console.log(node.id)
                Router.push(`/atlas/?notes=${node.id}`)
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
            data,
        }
    };
};