import {CourseSection} from "./CourseSection";
import {generateCourseSecList} from "./CourseHelper";
import {InsightDatasetKind} from "./IInsightFacade";

export class Dataset {

    public id: string;
    public kind: InsightDatasetKind;
    public content: string;
    public sections: Promise<CourseSection[]>;
    public listOfCourseSections: CourseSection[];
    public listOfSections: any[];

    constructor(id: string, kind: InsightDatasetKind, content: string) {
        this.id = id;
        this.kind = kind;
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

