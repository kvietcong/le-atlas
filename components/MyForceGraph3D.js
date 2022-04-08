import { ForceGraph3D } from "react-force-graph";
import Router from "next/router";
import { useEffect, useRef, useState } from "react";
import SpriteText from "three-spritetext";

export default function MyForceGraph3D({ data, noteDatabase }) {
    const [centerForce, setCenterForce] = useState();
    const [linkDistance, setLinkDistance] = useState();

    // For some reason, I don't get all the configuration options to customize
    // the graph :(
    const graphRef = useRef();
    useEffect(() => {
        const { current: graph } = graphRef;
        if (!graph) return;
        graph.d3Force("charge").strength(-15);
        graph.d3Force("link").distance(100);
        setCenterForce(graph.d3Force("charge").strength());
        setLinkDistance(graph.d3Force("link").distance());
    }, [ ]);

    const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

    const refreshSim = () => {
        const { current: graph } = graphRef;
        if (!graph) return;
        const newCenterForce = clamp(centerForce, -500, 0);
        const newLinkDistance = clamp(linkDistance, 5, 1000);
        graph.d3Force("charge").strength(newCenterForce);
        graph.d3Force("link").distance(newLinkDistance);
        graph.d3ReheatSimulation();
        setCenterForce(newCenterForce);
        setLinkDistance(newLinkDistance);
    };

    return (<>
        <div id="graph-controls" style={{
            position: "absolute",
            zIndex: 100,
            margin: "10px",
        }}>
            <label htmlFor="center-force">
                Center Force
                <input style={{marginLeft: "10px"}} type="number" name="center-force" id="center-force" min={-500} max={0} onChange={event => setCenterForce(event.target.value)} value={centerForce} />
            </label>
            <br />
            <label htmlFor="link-distance">
                Link Distance
                <input style={{marginLeft: "10px"}} type="number" name="link-distance" id="link-distance" min={5} max={1000} onChange={event => setLinkDistance(event.target.value)} value={linkDistance} />
            </label>
            <button onClick={refreshSim}>Refresh Visual</button>
        </div>
        <main style={{
            margin: "auto"
        }}>
            <ForceGraph3D
                ref={graphRef}
                graphData={data}
                nodeLabel={node => noteDatabase[node.id].title}
                nodeAutoColorBy="id"
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
                    const sprite = new SpriteText(noteDatabase[node.id].title);
                    sprite.color = "#FFFFFF";
                    sprite.material.depthWrite = false;
                    sprite.color += Math.min(node.value * 75, 255).toString(16);
                    sprite.textHeight = node.value / 2;
                    sprite.padding = 5;
                    return node.value > 0 ? sprite : null;
                }}
                onNodeClick={node => {
                    Router.push(`/atlas/?notes=${node.id}`)
                }}
            />
        </main>
    </>);
};