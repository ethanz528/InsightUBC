import {CourseSection} from "./CourseSection";
import * as fs from "fs";

const cacheDir = process.cwd() + "/data";

export let saveToData = function (fileId: string, item: CourseSection[]): boolean {
    try {
        fs.writeFileSync(cacheDir + "/" + fileId, JSON.stringify(item));
        return true;
    } catch (Error) {
        return false;
    }
};
