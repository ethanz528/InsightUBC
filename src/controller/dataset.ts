import {CourseSection} from "./courseSection";
import {generateCourseSecList} from "./datasetHelper";

export class Dataset {

    public id: string;
    public content: string;
    public sections: Promise<CourseSection[]>;
    public listOfCourseSections: CourseSection[];
    public listOfSections: any[];

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
        this.sections = generateCourseSecList(this.content);
        this.sections.then((s) => {
            this.listOfCourseSections = s;
        });
        this.listOfSections = [];
    }

    public create() {
        this.listOfSections = [];
        for (let cs of this.listOfCourseSections) {
            this.listOfSections.push(cs.makeDict(this.id));
        }
    }
}

