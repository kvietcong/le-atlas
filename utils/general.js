export const wait1Second = callback => setTimeout(callback, 1000);

export const time = (...args) => {
    const times = [ 1000, 60, 60, 24, 365 ];
    return args.reduceRight(
        ([ result, i ], c) =>
            [result + c * times.slice(0, i+1).reduce((a, b) => a * b) , i + 1],
            [ 0, 0 ]
        )[0];
};

export const noteSearch = (search, notes) => {
    if (!search) return notes;

    const scores = notes.reduce((accumulated, [slug, note]) => {
        const toSearch = note.title.toLowerCase();
        const searchTerms = search.toLowerCase().split(" ");
        const regexString = `(${searchTerms.join("|")})`;
        const matches = [...new Set(toSearch.match(new RegExp(regexString, "g")))];
        matches.sort((a, b) => b.length - a.length);
        accumulated[slug] = matches.reduce(
            (accumulated, item, i) => item.length / (i+1) + accumulated, 0);
        return accumulated;
    }, {});
    console.log(scores)

    const result = notes.filter(([slug, _]) => scores[slug])
    result.sort(([a, _a], [b, _b]) => {
        const scoring = scores[b] - scores[a];
        return (scoring === 0) ? a.length - b.length : scoring;
    });
    return result;
}