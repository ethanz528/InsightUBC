import {CourseSection} from "./CourseSection";
import * as fs from "fs";

const cacheDir = "data";

// TODO

export let saveToData = function (fileId: string, item: CourseSection[]): boolean {
    try {
        fs.writeFileSync(cacheDir + "/" + fileId, JSON.stringify(item));
        return true;
    } catch (Error) {
        return false;
    }
};
