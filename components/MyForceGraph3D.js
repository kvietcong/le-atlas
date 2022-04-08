import Router from "next/router";
import { useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
import SpriteText from "three-spritetext";

export default function MyForceGraph3D({ data, noteDatabase }) {
    const [ repelForce, setRepelForce ] = useState(0);
    const [ linkDistance, setLinkDistance ] = useState(0);

    // For some reason, I don't get all the configuration options to customize
    // the graph :(
    const graphRef = useRef();
    useEffect(() => {
        const { current: graph } = graphRef;
        if (!graph) return;
        const defaultRepelForce = 15;
        const defaultLinkDistance = 75;
        graph.d3Force("charge").strength(-defaultRepelForce);
        graph.d3Force("link").distance(defaultLinkDistance);
        setRepelForce(-graph.d3Force("charge").strength()());
        setLinkDistance(graph.d3Force("link").distance()());
    }, [ ]);

    const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

    const refreshSim = () => {
        const { current: graph } = graphRef;
        if (!graph) return;
        const newCenterForce = clamp(repelForce, 0, 500);
        const newLinkDistance = clamp(linkDistance, 5, 1000);
        graph.d3Force("charge").strength(-newCenterForce);
        graph.d3Force("link").distance(newLinkDistance);
        graph.d3ReheatSimulation();
        setRepelForce(newCenterForce);
        setLinkDistance(newLinkDistance);
    };

    return (<>
        <div id="graph-controls" style={{
            position: "absolute",
            zIndex: 100,
            margin: "10px",
            color: "white",
        }}>
            <label htmlFor="center-force">
                Repel Force
                <input
                    style={{marginLeft: "10px"}}
                    type="number" name="center-force" id="center-force"
                    onChange={event => setRepelForce(event.target.value)}
                    value={repelForce} />
            </label>
            <br />
            <label htmlFor="link-distance">
                Link Distance
                <input
                    style={{marginLeft: "10px"}}
                    type="number" name="link-distance" id="link-distance"
                    onChange={event => setLinkDistance(event.target.value)}
                    value={linkDistance} />
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
                    const opacity = Math.min(node.value * 75, 255).toString(16);
                    sprite.color += opacity;
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