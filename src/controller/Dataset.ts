import {CourseSection} from "./CourseSection";
import {Room} from "./Room";
import {generateCourseSecList} from "./DatasetHelper";
import {InsightDatasetKind} from "./IInsightFacade";

export class Dataset {

    public id: string;
    public kind: InsightDatasetKind;
    public content: string;
    public sections: Promise<CourseSection[]> | Promise<Room[]>;
    public listOfCourseSections: CourseSection[] | Room[];
    public listOfSections: any[];

    constructor(id: string, kind: InsightDatasetKind, content: string) {
        this.id = id;
        this.kind = kind;
        this.content = content;
        this.sections = generateCourseSecList(this.content, this.kind);
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

