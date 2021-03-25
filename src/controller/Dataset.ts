import {CourseSection} from "./CourseSection";
import {generateCourseSecList} from "./CourseHelper";
import {InsightDatasetKind} from "./IInsightFacade";
import {Room} from "./Room";
import {generateRoomList} from "./RoomHelper";

export class Dataset {

    public id: string;
    public kind: InsightDatasetKind;
    public content: string;
    public sections: Promise<CourseSection[] | Room[]>;
    public listOfCourseSectionsOrRooms: CourseSection[] | Room[];
    public listOfSections: any[];

    constructor(id: string, kind: InsightDatasetKind, content: string) {
        this.id = id;
        this.kind = kind;
        this.content = content;
        if (kind === "courses") {
            this.sections = generateCourseSecList(this.content);
            this.sections.then((val) => {
                this.listOfCourseSectionsOrRooms = val;
            });
        } else if (kind === "rooms") {
            this.sections = generateRoomList(this.content);
            this.sections.then((val) => {
                this.listOfCourseSectionsOrRooms = val;
            });
        }
        this.listOfSections = [];
    }

    public create() {
        this.listOfSections = [];
        for (let cs of this.listOfCourseSectionsOrRooms) {
            this.listOfSections.push(cs.makeDict(this.id));
        }
    }
}

