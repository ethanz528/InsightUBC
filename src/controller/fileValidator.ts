import * as JSZip from "jszip";
import {loadFromContent} from "./datasetHelper";

export let isFileValid = function (content: string): Promise<boolean> {
    let validZip = isValidZip(content);
    let rootCourse = isRootDirCourses(content);
    let oneJSON = atLeastOneJSON(content);
    const promArr = [validZip, rootCourse, oneJSON];
    return Promise.all(promArr).then((val) => {
        return val[1] && val[2] && val[3];
    });
};

export let isValidZip = function (content: string): Promise<boolean> {
    let zip = new JSZip();
    return zip.loadAsync(content, {base64: true}).then(() => {return true; }, () => {return false; });
};

export let isRootDirCourses = function (content: string): Promise<boolean> {
   let zip = new JSZip();
   const regEx = /courses/;
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

let isJSON = function (item: string): boolean {
    try {
        JSON.parse(item);
        return true;
    } catch (SyntaxError) {
        return false;
    }
};
