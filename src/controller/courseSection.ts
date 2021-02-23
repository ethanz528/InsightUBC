export class CourseSection {

    public dept: string;
    public id: string;
    public avg: number;
    public instructor: string;
    public titleOfCourse: string;
    public pass: number;
    public fail: number;
    public audit: number;
    public uuid: string;
    public year: number;

    constructor(dept: string, id: string, avg: number, instructor: string, titleOfCourse: string, pass: number,
                fail: number, audit: number, uuid: string, year: number) {
        this.dept = dept;
        this.id = id;
        this.avg = avg;
        this.instructor = instructor;
        this.titleOfCourse = titleOfCourse;
        this.pass = pass;
        this.fail = fail;
        this.audit = audit;
        this.uuid = uuid;
        this.year = year;
    }
}
