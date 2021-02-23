const containsAnything = /\w/;
const underscore = /\_/;

export let isIdInvalid = function (name: string): boolean {
    return isWhiteSpaceOnly(name) || containsUnderscore(name);
};

let isWhiteSpaceOnly = function (name: string): boolean {
    return !containsAnything.test(name);
};

let containsUnderscore = function (name: string): boolean {
    return underscore.test(name);
};

