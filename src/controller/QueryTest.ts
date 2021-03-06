import {InsightError, InsightDatasetKind} from "./IInsightFacade";
import {Dataset} from "./Dataset";

class QueryTest {
    /* private datasets: { [id: string]: Dataset };
    private idList: string[];
    public columnKeys: string[] = [];
    public datasetId: string;
    public datasetKind: InsightDatasetKind;
    public sortingKeys: string;
    private containsGROUP: boolean;
    private GROUPkeys: string[];
    private APPLYKEYs: string[];
    private FILTERS: string[] = ["AND", "OR", "LT", "GT", "EQ", "IS", "NOT"];
    private mfields: { [id: string]: string[] } = {
        courses: ["avg", "pass", "fail", "audit", "year"],
        rooms: ["lat", "lon", "seats"]
    };

    private sfields: { [id: string]: string[] } = {
        courses: ["dept", "id", "instructor", "title", "uuid"],
        rooms: ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"]
    };

    private APPLYTOKENS: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

    constructor(datasets: { [id: string]: Dataset }, idList: string[]) {
        this.datasets = datasets;
        this.idList = idList;
    }

    public performQueryTest(query: any) {
        if (query.constructor !== Object
            || !(Object.keys(query).length === 2 || Object.keys(query).length === 3)
            || !(query.hasOwnProperty("WHERE"))
            || !(query.hasOwnProperty("OPTIONS"))
            || (Object.keys(query).length === 3 && !(query.hasOwnProperty("TRANSFORMATIONS")))) {
            throw new InsightError();
        }
        this.containsGROUP = query.hasOwnProperty("TRANSFORMATIONS");
        if (this.containsGROUP) {
            this["TRANSFORMATIONSTest"](query["TRANSFORMATIONS"]);
        }
        this["OPTIONSTest"](query["OPTIONS"]);
        this["WHERETest"](query["WHERE"]);
    }

    public WHERETest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length > 1) {
            throw new InsightError();
        }
        for (const key in query) {
            if (!(this.FILTERS.includes(key))) {
                throw new InsightError();
            }
            this[(key + "Test") as keyof QueryTest](query[key]);
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
            || query.some((e) => !(this.FILTERS.includes(Object.keys(e)[0])))) {
            throw new InsightError();
        }
        for (const key of query) {
            this[(Object.keys(key)[0] + "Test") as keyof QueryTest](Object.values(key)[0]);
        }
    }

    public LTTest(query: any) {
        this["LTGTEQTest"](query);
    }

    public GTTest(query: any) {
        this["LTGTEQTest"](query);
    }

    public EQTest(query: any) {
        this["LTGTEQTest"](query);
    }

    public LTGTEQTest(query: any) {
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
            || Object.keys(query).length !== 1) {
            throw new InsightError();
        }
        for (const key in query) {
            if (!(this.FILTERS.includes(key))) {
                throw new InsightError();
            }
            this[(key + "Test") as keyof QueryTest](query[key]);
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
                this[(key + "Test") as keyof QueryTest](query[key]);
            }
        }
    }

    public COLUMNSTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0) {
            throw new InsightError();
        }
        this.datasetId = query[0].split("_")[0];
        this.datasetKind = this.datasets[this.datasetId].kind;
        for (const key of query) {
            if (!(this.isKey(key))
                || !(this.idList.includes(key.slice(0, key.indexOf("_"))))
                || (!(this.mfields[this.datasetKind].includes(key.split("_")[1])) &&
                    !(this.sfields[this.datasetKind].includes(key.split("_")[1])))) {
                throw new InsightError();
            }
            this.columnKeys.push(key);
        }
    }

    public ORDERTest(query: any) {
        if (query.constructor === Object) {
            if (Object.keys(query).length !== 2
                || !(query.hasOwnProperty("dir"))
                || !(query["dir"] === "UP" || query["dir"] === "DOWN")
                || !(query.hasOwnProperty("keys"))
                || !(query["keys"] instanceof Array)
                || query["keys"].length === 0
                || !(query["keys"].some((e) => !(this.isAnyKey(e))))
                || !(query["keys"].some((e) => !(this.columnKeys.includes(e))))) {
                throw new InsightError();
            } else {
                this.sortingKeys = ""; // query["keys"];
            }
        } else if (typeof query === "string") {
            if (!(this.isAnyKey(query))
                || !(this.columnKeys.includes(query))) {
                throw new InsightError();
            } else {
                this.sortingKeys = query;
            }
        } else {
            throw new InsightError();
        }
    }

    public TRANSFORMATIONSTest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 2
            || !(query.hasOwnProperty("GROUP"))
            || !(query.hasOwnProperty("APPLY"))) {
            throw new InsightError();
        }
        this["GROUPTest"](query["GROUP"]);
        this["APPLYTest"](query["APPLY"]);
    }

    public GROUPTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0
            || query.some((e) => !(this.isKey(e)))) {
            throw new InsightError();
        }
        this.GROUPkeys = query;
    }

    public APPLYTest(query: any) {
        if (!(query instanceof Array)
            || query.length === 0) {
            throw new InsightError();
        }
        for (const element in query) {
            this["APPLYRULETest"](query[element]);
        }
        this.GROUPkeys = query;
    }

    public APPLYRULETest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.isApplyKey(Object.keys(query)[0]))) {
            throw new InsightError();
        }
        for (const key in query) {
            this.APPLYKEYs.push(key);
            this["APPLYRULETestHelper"](query[key]);
        }
    }

    public APPLYRULETestHelper(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !(this.APPLYTOKENS.includes(Object.keys(query)[0]))
            || !(this.isKey(Object.values(query)[0]))
            || (this.isSKey(Object.values(query)[0]) && Object.values(query)[0] !== "COUNT")) {
            throw new InsightError();
        }
        for (const key in query) {
            this["APPLYRULETestHelper"](query[key]);
        }
    }

    private isMKey(key: any): boolean {
        return !(key.split("_").length !== 2)
            && !(key.charAt(0) === "_")
            && (this.datasetId === key.split("_")[0])
            && (this.mfields[this.datasetKind].includes(key.split("_")[1]));
    }

    private isSKey(key: any): boolean {
        return !(key.split("_").length !== 2)
            && !(key.charAt(0) === "_")
            && (this.datasetId === key.split("_")[0])
            && (this.sfields[this.datasetKind].includes(key.split("_")[1]));
    }

    private isKey(key: any): boolean {
        return this.isMKey(key) || this.isSKey(key);
    }

    private isApplyKey(key: any): boolean {
        return key.length > 0
            && key.split("_").length !== 1
            && !(this.APPLYKEYs.includes(key));
    }

    private isAnyKey(key: any): boolean {
        return this.isKey(key) || this.isApplyKey(key);
    } */

}

export = QueryTest;
