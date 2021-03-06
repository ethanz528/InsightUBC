import * as JSZip from "jszip";
import {loadFromContent} from "./DatasetHelper";

export let isFileValid = function (content: string): Promise<boolean> {
    return isValidZip(content).then((val) => {
        if (val) {
            return isRootDirCourses(content);
        } else {
            return false;
        }
    }).then((val) => {
        if (val) {
            return atLeastOneJSON(content);
        } else {
            return false;
        }
    }).then((val) => {
        if (val) {
            return true;
        } else {
            return false;
        }
    });
};

export let isValidZip = function (content: string): Promise<boolean> {
    let zip = new JSZip();
    return zip.loadAsync(content, {base64: true}).
    then(() => {
        return true;
    }).
    catch((val: any) => {
        return false;
    });
};

export let isRootDirCourses = function (content: string): Promise<boolean> {
   let zip = new JSZip();
   const regEx = /^courses?/;
   return zip.loadAsync(content, {base64: true}).
   then((val) => {
       return val.folder(regEx).length === 1;
   });
};

export let atLeastOneJSON = function (content: string): Promise<boolean> {
    return loadFromContent(content).
    then((val) => {
        return foundOneInJSON(val);
    });
};

let foundOneInJSON = function (list: string[]): boolean {
    for (const item of list) {
        if (isJSON(item)) {
            return true;
        }
    }
    return false;
};

export let isJSON = function (item: string): boolean {
    try {
        JSON.parse(item);
        return true;
    } catch (SyntaxError) {
        return false;
    }
};
