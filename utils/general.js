export const wait1Second = callback => setTimeout(callback, 1000);

export const time = (...args) => {
    const times = [ 1000, 60, 60, 24, 365 ];
    return args.reduceRight(
        ([ result, i ], c) =>
            [result + c * times.slice(0, i+1).reduce((a, b) => a * b) , i + 1],
            [ 0, 0 ]
        )[0];
};

export const escapeRegExp = string =>
    string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getDistinct = (items, change = x => x) =>
    [...new Set(items?.map(change))];

export const noteSearch = (search, searchData) => {
    const searchDataEntries = Object.entries(searchData);
    if (!search) return searchDataEntries;

    const scores = searchDataEntries.reduce((scores, [slug, data]) => {
        const searchTerms = escapeRegExp(search).split(" ");
        const regexString = `(${searchTerms.join("|")})`;
        const regex = new RegExp(regexString, "gi");

        // My code be unreadable XD
        const { title, aliases } = data;
        const getMatches = toMatch => toMatch.match(regex) || [];
        const titleMatches = getMatches(title);
        const aliasMatches = aliases?.reduce(
            (aliasMatches, alias) =>
                [...aliasMatches, ...getMatches(alias)], []) || [];
        titleMatches.sort((a, b) => b.length - a.length);
        aliasMatches.sort((a, b) => b.length - a.length);

        scores[slug] = titleMatches.reduce(
            (accumulated, item, i) => item.length / (i+1) + accumulated, 0);
        scores[slug] += aliasMatches.reduce(
            (accumulated, item, i) => item.length / (i+1) + accumulated, 0);
        scores[slug] /= title.length;
        return scores;
    }, {});
    const result = searchDataEntries.filter(([slug, _]) => scores[slug]);
    result.sort(([a, _a], [b, _b]) =>
        scores[b] - scores[a]
        || a.length - b.length
        || a.localeCompare(b));
    return result;
};