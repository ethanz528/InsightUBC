import {InsightError} from "./IInsightFacade";
import {Dataset} from "./Dataset";
import {type} from "os";

class QueryTestt {
    private readonly query: any;
    private datasets: { [id: string]: Dataset };
    private idList: string[];
    public columnKeys: string[] = [];
    public datasetId: string;
    public sortingKey: string;
    private FILTERS: string[] = ["AND", "OR", "LT", "GT", "EQ", "IS", "NOT"];
    private MFIELDS: string[] = ["avg", "pass", "fail", "audit", "year"];
    private SFIELDS: string[] = ["dept", "id", "instructor", "title", "uuid"];

    constructor(query: any, datasets: { [id: string]: Dataset }, idList: string[]) {
        this.query = query;
        this.datasets = datasets;
        this.idList = idList;
    }

    public performQueryTest() {
        if (this.query === null
            || this.query.constructor !== Object
            || Object.keys(this.query).length !== 2
            || !(this.query.hasOwnProperty("WHERE"))
            || !(this.query.hasOwnProperty("OPTIONS"))) {
            throw new InsightError();
        }
        this["OPTIONSTest"](this.query["OPTIONS"]);
        this["WHERETest"](this.query["WHERE"]);
    }

    public callMethod(name: string, param: any) {
        switch (name) {
            case "WHERE":
                this["WHERETest"](param);
                break;
            case "AND":
                this["ANDTest"](param);
                break;
            case "OR":
                this["ANDTest"](param);
                break;
            case "LT":
                this["LTTest"](param);
                break;
            case "GT":
                this["GTTest"](param);
                break;
            case "EQ":
                this["EQTest"](param);
                break;
            case "IS":
                this["ISTest"](param);
                break;
            case "NOT":
                this["NOTTest"](param);
                break;
            case "COLUMNS":
                this["COLUMNSTest"](param);
                break;
            case "ORDER":
                this["ORDERTest"](param);
                break;
        }
    }

    public WHERETest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length > 1
            || (Object.keys(query).length === 1 && !(this.FILTERS.includes(Object.keys(query)[0])))) {
            throw new InsightError();
        }
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                this.callMethod(key, query[key]);
                // this[(key + "Test") as keyof QueryTestt](query[key]);
            }
        }
    }

    public ANDTest(query: any) {
        this["ANDORTest"](query);
    }

    public ORTest(query: any) {
        this["ANDORTest"](query);
    }

    public ANDORTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0
            || !(this.allFilters(query))) {
            throw new InsightError();
        }
        for (const key of query) {
            this.callMethod(Object.keys(key)[0], Object.values(key)[0]);
            // this[(Object.keys(key)[0] + "Test") as keyof QueryTestt](Object.values(key)[0]);
        }
    }

    public LTTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.isMKey(Object.keys(query)[0]))
            || !(Number.isInteger(Object.values(query)[0] as number))) {
            throw new InsightError();
        }
    }

    public GTTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.isMKey(Object.keys(query)[0]))
            || !(Number.isInteger(Object.values(query)[0] as number))) {
            throw new InsightError();
        }
    }

    public EQTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.isMKey(Object.keys(query)[0]))
            || !(Number.isInteger(Object.values(query)[0] as number))) {
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
            throw new InsightError();
        }
    }

    public NOTTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.FILTERS.includes(Object.keys(query)[0]))) {
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
            throw new InsightError();
        }
        this.datasetId = query[0].split("_")[0];
        for (const key of query) {
            if (!(this.isKey(key))
                || !(this.idList.includes(key.slice(0, key.indexOf("_"))))
                || (!(this.MFIELDS.includes(key.split("_")[1])) && !(this.SFIELDS.includes(key.split("_")[1])))) {
                throw new InsightError();
            }
            this.columnKeys.push(key);
        }
    }

    public ORDERTest(query: any) {
        if (!(this.columnKeys.includes(query))) {
            throw new InsightError();
        }
        this.sortingKey = query;
    }

    private allFilters(query: any): boolean {
        for (const key of query) {
            if (!(this.FILTERS.includes(Object.keys(key)[0]))) {
                return false;
            }
        }
        return true;
    }

    private isMKey(key: any): boolean {
        return (this.isKey(key))
            && (this.MFIELDS.includes(key.split("_")[1]));
    }

    private isSKey(key: any): boolean {
        return (this.isKey(key))
            && (this.SFIELDS.includes(key.split("_")[1]));
    }

    private isKey(key: any): boolean {
        return !(key.split("_").length !== 2)
            && !(key.charAt(0) === "_")
            && (this.datasetId === key.split("_")[0]);
    }

}

export = QueryTestt;
