import {CourseSection} from "./courseSection";
import * as JSZip from "jszip";

export let generateCourseSecList = function (content: string): Promise<CourseSection[]> {
    return loadFromContent(content).
    then((val) => {
       return createParsedList(val);
    }).then((val) => {
        return transformToCourseObj(val);
    });
};

export let loadFromContent = function (c: string): Promise<string[]> {
    let zip = new JSZip();
    return zip.loadAsync(c, {base64: true}).then((updatedZip): Promise<string[]> => {
        let promiseArray: any[] = [];
        updatedZip.folder("courses").forEach((relativePath, file) => {
            let contentPromise = file.async("string");
            promiseArray.push(contentPromise);
        });
        return Promise.all(promiseArray);
    });
};

let createParsedList = function (list: string[]): JSON[] {
    let parsedList: JSON[] = [];
    for (const item of list) {
        const obj = JSON.parse(item);
        parsedList.push(obj);
    }
    return parsedList;
};

let transformToCourseObj = function (list: any): CourseSection[] {
    let assembledList: CourseSection[] = [];
    for (let item of list) {
        let sectionList = item.result;
        for (let section of sectionList) {
            const dept: string = section.Subject;
            const id: string = section.Course;
            const avg: number = section.Avg;
            const instructor: string = section.Professor;
            const title: string = section.Title;
            const pass: number = section.Pass;
            const fail: number = section.Fail;
            const audit: number = section.Audit;
            const uuid: number = section["id"];
            const sec: string = section.Section;
            let year: number;
            if (sec !== "overall") {
                const tempYear: string = section.Year;
                year = Number(tempYear);
            } else if (sec === "overall") {
                year = 1900;
            }
            if (!shouldBeSkipped(dept, id, avg, instructor, title, pass, fail, audit, uuid, year)) {
                const changedUuid: string = uuid.toString();
                let courseObj: CourseSection = new CourseSection(dept, id, avg, instructor, title, pass,
                    fail, audit, changedUuid, year);
                assembledList.push(courseObj);
            }
        }
    }
    return assembledList;
};


let shouldBeSkipped = function (dept: string, id: string, avg: number, ins: string, title: string,
                                pass: number, fail: number, audit: number, uuid: number, year: number):
    boolean {
    return checkKey(dept) || checkKey(id) || checkKey(avg) || checkKey(ins) || checkKey(title) || checkKey(pass) ||
        checkKey(fail) || checkKey(audit) || checkKey(uuid) || checkKey(year);
};

let checkKey = function (key: string | number): boolean {
    return key === undefined || key === null; // || key === "";
};
