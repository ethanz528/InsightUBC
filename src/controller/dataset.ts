import {CourseSection} from "./courseSection";
import {generateCourseSecList} from "./datasetHelper";

export class Dataset {

    public id: string;
    public content: string;
    public sections: Promise<CourseSection[]>;

    constructor(id: string, content: string) {
        this.id = id;
        this.content = content;
        this.sections = generateCourseSecList(this.content);
    }
}

