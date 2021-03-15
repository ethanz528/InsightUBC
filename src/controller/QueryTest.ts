import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import {Dataset} from "./Dataset";

class QueryTest {
    private readonly datasets: { [id: string]: Dataset };
    public dataset: Dataset;
    public columnKeys: string[] = [];
    public sortingKeys: string[];
    public sortingUP: number = 1;
    private FILTERS: string[] = ["AND", "OR", "LT", "GT", "EQ", "IS", "NOT"];
    private MFIELDS: { [id: string]: string[] } = {courses: ["avg", "pass", "fail", "audit", "year"],
        rooms: ["lat", "lon", "seats"]};

    private SFIELDS: { [id: string]: string[] } = {courses: ["dept", "id", "instructor", "title", "uuid"],
        rooms: ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"]};

    public GROUPPresent: boolean;
    public GROUPKeys: string[];
    public APPLYS: any[];
    private APPLYKEYS: string[] = [];
    private APPLYTOKENS: any[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

    constructor(datasets: { [id: string]: Dataset }) {
        this.datasets = datasets;
    }

    public performQueryTest(query: any) {
        if (query === null
            || query.constructor !== Object
            || !(Object.keys(query).length === 2 || Object.keys(query).length === 3)
            || !(query.hasOwnProperty("WHERE"))
            || !(query.hasOwnProperty("OPTIONS"))
            || (Object.keys(query).length === 3 && !(query.hasOwnProperty("TRANSFORMATIONS")))) {
            throw new InsightError();
        }
        this.GROUPPresent = query.hasOwnProperty("TRANSFORMATIONS");
        try {
            if (this.GROUPPresent) {
                this.dataset = this.datasets[query["TRANSFORMATIONS"]["GROUP"][0].split("_")[0]];
            } else {
                this.dataset = this.datasets[query["OPTIONS"]["COLUMNS"][0].split("_")[0]];
            }
        } catch (e) {
                throw new InsightError();
        }
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
        if (query === null
            || query.constructor !== Object
            || Object.keys(query).length > 1
            || !(Object.keys(query).every((e) => this.FILTERS.includes(e)))) {
            throw new InsightError();
        }
        Object.keys(query).map((e) => this.callMethod(e, query[e]));
    }

    public ANDORTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0
            || !(query.every((e) => this.FILTERS.includes(Object.keys(e)[0])))) {
            throw new InsightError();
        }
        query.map((e) => this.callMethod(Object.keys(e)[0], Object.values(e)[0]));
    }

    public LTGTEQTest(query: any) {
        if (query === null
            || query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.isMKey(Object.keys(query)[0]))
            || typeof Object.values(query)[0] !== "number") {
            throw new InsightError();
        }
    }

    public ISTest(query: any) {
        if (query === null
            || query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.isSKey(Object.keys(query)[0]))
            || typeof Object.values(query)[0] !== "string"
            || (Object.values(query)[0] as string).split("*").length > 3
            || (Object.values(query)[0] as string).substring(1,
                (Object.values(query)[0] as string).length - 1).split("*").length !== 1) {
            throw new InsightError();
        }
    }

    public NOTTest(query: any) {
        if (query === null
            || query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(Object.keys(query).every((e) => this.FILTERS.includes(e)))) {
            throw new InsightError();
        }
        Object.keys(query).map((e) => this.callMethod(e, query[e]));
    }

    public OPTIONSTest(query: any) {
        if (query === null
            || query.constructor !== Object
            || Object.keys(query).length > 2
            || !(query.hasOwnProperty("COLUMNS"))
            || (Object.keys(query).length === 2 && !(query.hasOwnProperty("ORDER")))) {
            throw new InsightError();
        }
        Object.keys(query).map((e) => this.callMethod(e, query[e]));
    }

    public COLUMNSTest(query: any) {
        if (this.GROUPPresent) {
            if (!(query instanceof Array)
                || query.length === 0
                || !(query.every((e) => this.GROUPKeys.includes(e) || this.APPLYKEYS.includes(e)))) {
                throw new InsightError();
            }
        } else {
            if (!(query instanceof Array)
                || query.length === 0
                || !query.every((e) => this.isKey(e))) {
                throw new InsightError();
            }
        }
        this.columnKeys = query;
    }

    public ORDERTest(query: any) {
        if (typeof query === "string") {
            if (!(this.columnKeys.includes(query))) {
                throw new InsightError();
            }
            this.sortingKeys = [query];
        } else {
            if (query === null
                || query.constructor !== Object
                || Object.keys(query).length !== 2
                || !(query.hasOwnProperty("dir"))
                || !(query["dir"] === "UP" || query["dir"] === "DOWN")
                || !(query.hasOwnProperty("keys"))
                || !(query["keys"] instanceof Array)
                || query["keys"].length === 0
                || !(query["keys"].every((e) => this.columnKeys.includes(e)))) {
                    throw new InsightError();
            }
            this.sortingKeys = query["keys"];
            if (query["dir"] === "DOWN") {
                this.sortingUP = -1;
            }
        }
    }

    public TRANSFORMATIONSTest(query: any) {
        if (query === null
            || query.constructor !== Object
            || Object.keys(query).length !== 2
            || !(query.hasOwnProperty("GROUP"))
            || !(query.hasOwnProperty("APPLY"))) {
            throw new InsightError();
        }
        Object.keys(query).map((e) => this.callMethod(e, query[e]));
    }

    public GROUPTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0
            || !(query.every((e) => this.isKey(e)))) {
            throw new InsightError();
        }
        this.GROUPKeys = query;
    }

    public APPLYTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0
            || !(query.every((e) => this.isApplyRule(e)))) {
            throw new InsightError();
        }
        this.APPLYS = query;
    }

    private isMKey(key: any): boolean {
        return typeof key === "string"
            && key.split("_").length === 2
            && key.charAt(0) !== "_"
            && this.dataset.id === key.split("_")[0]
            && this.MFIELDS[this.dataset.kind].includes(key.split("_")[1]);
    }

    private isSKey(key: any): boolean {
        return typeof key === "string"
            && key.split("_").length === 2
            && key.charAt(0) !== "_"
            && this.dataset.id === key.split("_")[0]
            && this.SFIELDS[this.dataset.kind].includes(key.split("_")[1]);
    }

    private isKey(key: any): boolean {
        return this.isMKey(key) || this.isSKey(key);
    }

    private isApplyRule(e: any) {
        return e !== null
            && e.constructor === Object
            && Object.keys(e).length === 1
            && this.isApplyKey(Object.keys(e)[0])
            && this.isApplyRuleValue(Object.values(e)[0]);
    }

    private isApplyRuleValue(e: any) {
        return e !== null
            && e.constructor === Object
            && Object.keys(e).length === 1
            && ((this.isMKey(Object.values(e)[0]) && this.APPLYTOKENS.includes(Object.keys(e)[0]))
                || (this.isSKey(Object.values(e)[0]) && Object.keys(e)[0] === "COUNT"));
    }

    private isApplyKey(e: any): boolean {
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
