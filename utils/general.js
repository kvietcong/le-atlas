export const wait1Second = callback => setTimeout(callback, 1000);

export const time = (...args) => {
    const times = [ 1000, 60, 60, 24, 365 ];
    return args.reduceRight(
        ([ result, i ], c) =>
            [result + c * times.slice(0, i+1).reduce((a, b) => a * b) , i + 1],
            [ 0, 0 ]
        )[0];
};