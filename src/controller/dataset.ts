import {CourseSection} from "./courseSection";
import {generateCourseSecList} from "./datasetHelper";

export class Dataset {

    public id: string;
    public content: string;
    public sections: Promise<CourseSection[]>;
    public listOfSections: any[];

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
        this.sections = generateCourseSecList(this.content);
        this.sections.then((s) => {
            let listOfSections: any[] = [];
            for (let cs of s) {
                listOfSections.push(cs.makeDict(this.id));
            }
            this.listOfSections = listOfSections;
        });
    }
}

