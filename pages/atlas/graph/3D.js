import Head from "next/head";
import { notes } from "../../../utils/atlasManagement";
import dynamic from "next/dynamic";
import Router from "next/router";
import SpriteText from "three-spritetext";
const ForceGraph3D = dynamic(() =>
    import("../../../utils/forceGraph3DNoSSR"), {ssr: false})


export default function Graph3DPage({ notes, data }) {
    return <>
        <Head>
            <title>Le Atlas: 3D Graph</title>
        </Head>
        <ForceGraph3D
            controlType="fly"
            graphData={data}
            nodeThreeObjectExtend={true}
            nodeAutoColorBy="id"
            linkWidth={2}
            nodeVal={({value}) => value}
            linkDirectionalParticleResolution={2}
            linkDirectionalParticles={8}
            linkDirectionalParticleWidth={1}
            linkDirectionalParticleSpeed={0.005}
            nodeLabel={node => notes[node.id].title}
            nodeThreeObject={node => {
                const sprite = new SpriteText(notes[node.id].title);
                sprite.color = "#FFFFFF";
                sprite.material.depthWrite = false;
                sprite.color += Math.min(node.value * 50, 255).toString(16);
                sprite.textHeight = node.value / 2;
                sprite.padding = 5;
                return node.value > 1 ? sprite : null;
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