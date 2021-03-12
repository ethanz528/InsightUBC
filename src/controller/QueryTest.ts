import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Dataset} from "./Dataset";

class QueryTest {
    private datasets: { [id: string]: Dataset };
    private idList: string[];
    public columnKeys: string[] = [];
    public sortingKey: string;
    public dataset: Dataset;
    public GROUPPresent: boolean;
    public GROUPKeys: string[];
    private FILTERS: string[] = ["AND", "OR", "LT", "GT", "EQ", "IS", "NOT"];
    private APPLYTOKENS: any[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
    private APPLYKEYS: string[] = [];
    private MFIELDS: { [id: string]: string[] } = {courses: ["avg", "pass", "fail", "audit", "year"],
        rooms: ["lat", "lon", "seats"]};

    private SFIELDS: { [id: string]: string[] } = {courses: ["dept", "id", "instructor", "title", "uuid"],
        rooms: ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"]};

    constructor(datasets: { [id: string]: Dataset }, idList: string[]) {
        this.datasets = datasets;
        this.idList = idList;
    }

    public performQueryTest(query: any) {
        if (query === null
            || query.constructor !== Object
            || !(Object.keys(query).length === 2 || Object.keys(query).length === 3)
            || !(query.hasOwnProperty("WHERE"))
            || !(query.hasOwnProperty("OPTIONS"))
            || (Object.keys(query).length === 3 && !(query.hasOwnProperty("TRANSFORMATIONS")))) {
            // console.log("QUERY");
            throw new InsightError();
        }
        this.GROUPPresent = query.hasOwnProperty("TRANSFORMATIONS");
        if (this.GROUPPresent) {
            this.callMethod("TRANSFORMATIONS", query["TRANSFORMATIONS"]);
        }
        this.callMethod("OPTIONS", query["OPTIONS"]);
        this.callMethod("WHERE", query["WHERE"]);
    }

    public callMethod(name: string, param: any) {
        // console.log("RUN " + name);
        switch (name) {
            case "WHERE":
                this["WHERETest"](param);
                break;
            case "AND":
            case "OR":
                this["ANDORTest"](param);
                break;
            case "LT":
            case "GT":
            case "EQ":
                this["LTGTEQTest"](param);
                break;
            case "IS":
                this["ISTest"](param);
                break;
            case "NOT":
                this["NOTTest"](param);
                break;
            case "OPTIONS":
                this["OPTIONSTest"](param);
                break;
            case "COLUMNS":
                this["COLUMNSTest"](param);
                break;
            case "ORDER":
                this["ORDERTest"](param);
                break;
            case "TRANSFORMATIONS":
                this["TRANSFORMATIONSTest"](param);
                break;
            case "GROUP":
                this["GROUPTest"](param);
                break;
            case "APPLY":
                this["APPLYTest"](param);
                break;
        }
    }

    public WHERETest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length > 1
            || (Object.keys(query).length === 1 && !(this.FILTERS.includes(Object.keys(query)[0])))) {
            // console.log("WHERE");
            throw new InsightError();
        }
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                this.callMethod(key, query[key]);
                // this[(key + "Test") as keyof QueryTestt](query[key]);
            }
        }
    }

    public ANDORTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0
            || query.some((e) => !(this.FILTERS.includes(Object.keys(e)[0])))) {
            // console.log("AND OR");
            throw new InsightError();
        }
        for (const key of query) {
            this.callMethod(Object.keys(key)[0], Object.values(key)[0]);
            // this[(Object.keys(key)[0] + "Test") as keyof QueryTestt](Object.values(key)[0]);
        }
    }

    public LTGTEQTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.isMKey(Object.keys(query)[0]))
            || !(Number.isInteger(Object.values(query)[0] as number))) {
            // console.log("LT GT EQ");
            throw new InsightError();
        }
    }

    public ISTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.isSKey(Object.keys(query)[0]))
            || !(typeof Object.values(query)[0] === "string")
            || (Object.values(query)[0] as string).split("*").length > 3
            || (((((Object.values(query)[0] as string).charAt(0) === "*") as unknown) as number)
                + ((((Object.values(query)[0] as string).charAt(
                    (Object.values(query)[0] as any[]).length - 1) === "*") as unknown) as number)
                < (Object.values(query)[0] as string).split("*").length - 1)) {
            // console.log("IS");
            throw new InsightError();
        }
    }

    public NOTTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.FILTERS.includes(Object.keys(query)[0]))) {
            // console.log("NOT");
            throw new InsightError();
        }
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                this.callMethod(key, query[key]);
                // this[(key + "Test") as keyof QueryTestt](query[key]);
            }
        }
    }

    public OPTIONSTest(query: any) {
        if (query.constructor !== Object ||
            Object.keys(query).length > 2 ||
            !(query.hasOwnProperty("COLUMNS")) ||
            (Object.keys(query).length === 2 && !(query.hasOwnProperty("ORDER")))) {
            // console.log("OPTIONS");
            throw new InsightError();
        }
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                this.callMethod(key, query[key]);
                // this[(key + "Test") as keyof QueryTestt](query[key]);
            }
        }
    }

    public COLUMNSTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0) {
            // console.log("COLUMNS");
            throw new InsightError();
        }
        if (!(this.GROUPPresent)) {
            if (!(this.datasets.hasOwnProperty(query[0].split("_")[0]))) {
                // console.log("COLUMNS");
                throw new InsightError();
            }
            this.dataset = this.datasets[query[0].split("_")[0]];
        }
        this.columnKeys = query;
        if (!(this.GROUPPresent)) {
            for (const key of query) {
                if (!(this.isKey(key))) {
                    // console.log("COLUMNS");
                    throw new InsightError();
                }
            }
        }
    }

    public ORDERTest(query: any) {
        if (typeof query === "string") {
            if (!(this.columnKeys.includes(query))) {
                // console.log("ORDER");
                throw new InsightError();
            }
            this.sortingKey = query;
        } else {
            if (query.constructor !== Object
                || Object.keys(query).length !== 2
                || !(query.hasOwnProperty("dir"))
                || !(query["dir"] === "UP" || query["dir"] === "DOWN")
                || !(query.hasOwnProperty("keys"))
                || !(query["keys"] instanceof Array)
                || query["keys"].length === 0
                || query["keys"].some((e) => !(this.columnKeys.includes(e)))) {
                    // console.log("ORDER");
                    throw new InsightError();
            }
            this.sortingKey = "not implemented :P";
        }
    }

    public TRANSFORMATIONSTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 2
            || !(query.hasOwnProperty("GROUP"))
            || !(query.hasOwnProperty("APPLY"))) {
            // console.log("TRANSFORMATIONS");
            throw new InsightError();
        }
        this.callMethod("GROUP", query["GROUP"]);
        this.callMethod("APPLY", query["APPLY"]);
    }

    public GROUPTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0) {
            // console.log("GROUP");
            throw new InsightError();
        }
        this.dataset = this.datasets[query[0].split("_")[0]];
        if (query.some((e) => !(this.isKey(e)))) {
            // console.log("GROUP");
            throw new InsightError();
        }
        this.GROUPKeys = query;
    }

    public APPLYTest(query: any) {
        // console.log(query[0]);
        if (!(query instanceof Array)
            || query.length === 0
            || query.some((e) => !(this.isApplyRule(e)))) {
            // console.log("APPLY");
            throw new InsightError();
        }
    }

    private isMKey(key: any): boolean {
        return key.split("_").length === 2
            && key.charAt(0) !== "_"
            && this.dataset.id === key.split("_")[0]
            && this.MFIELDS[this.dataset.kind].includes(key.split("_")[1]);
    }

    private isSKey(key: any): boolean {
        return key.split("_").length === 2
            && key.charAt(0) !== "_"
            && this.dataset.id === key.split("_")[0]
            && (this.SFIELDS[this.dataset.kind].includes(key.split("_")[1]));
    }

    private isKey(key: any): boolean {
        return this.isMKey(key) || this.isSKey(key);
    }

    private isApplyRule(e: any) {
        return e.constructor === Object
            && Object.keys(e).length === 1
            && this.isApplyKey(Object.keys(e)[0])
            && this.isApplyRuleValue(Object.values(e)[0]);
    }

    private isApplyRuleValue(e: any) {
        return e.constructor === Object
            && Object.keys(e).length === 1
            && ((this.isMKey(Object.values(e)[0]) && this.APPLYTOKENS.includes(Object.keys(e)[0]))
                || (this.isSKey(Object.values(e)[0]) && Object.keys(e)[0] === "COUNT"));
    }

    private isApplyKey(e: any) {
        if (this.APPLYKEYS.includes(e)) {
            return false;
        }
        this.APPLYKEYS.push(e);
        return typeof e === "string"
            && e.length >= 1
            && !(e.includes("_"));
    }

}

export = QueryTest;
