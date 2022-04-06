import Head from "next/head";
import { notes } from "../../../utils/atlasManagement";
import dynamic from "next/dynamic";
import Router from "next/router";
import SpriteText from "three-spritetext";
import { useEffect, useRef } from "react";

const ForceGraph3D = dynamic(
    () => import("react-force-graph").then(module => module.ForceGraph3D),
    {ssr: false}
);

export default function Graph3DPage({ notes, data }) {
    const graphRef = useRef();
    useEffect(() => {
        // TODO: Find out why this doesn't work
        //       (Supposedly b/c of Next's dynamic importing)
        console.log(graphRef.current);
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