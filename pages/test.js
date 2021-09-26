import { test, testInput } from "../utils/atlasManagement"

export default function TestPage({ input, content }) {
    return <>
        <main>
            <h1>Testing Grounds</h1>
            <h2>Input</h2>
            <pre>{input}</pre>
            <h2>Output</h2>
            <pre>{content}</pre>
        </main>
    </>
};

export const getStaticProps = async () => {
    return {
        props: {
            input: testInput,
            content: JSON.stringify(test, null, 4)
        }
    };
};