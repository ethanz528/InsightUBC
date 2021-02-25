import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import {Dataset} from "./Dataset";

class Query {
    private readonly query: any;
    private datasets: { [id: string]: Dataset };
    private idList: string[];
    private columnKeys: string[] = [];
    private datasetId: string;
    private sortingKey: string;
    private listOfSections: any[];
    private data: any[];
    private FILTERS: string[] = ["AND", "OR", "LT", "GT", "EQ", "IS", "NOT"];
    private MFIELDS: string[] = ["avg", "pass", "fail", "audit", "year"];
    private SFIELDS: string[] = ["dept", "id", "instructor", "title", "uuid"];

    constructor(query: any, datasets: { [id: string]: Dataset }, idList: string[]) {
        this.query = query;
        this.datasets = datasets;
        this.idList = idList;
    }

    public performQuery() {
        this.performQueryTest();
        this.performQueryHelper();
        return this.data;
    }

    private performQueryHelper() {
        this.datasets[this.datasetId].create();
        this.listOfSections = this.datasets[this.datasetId].listOfSections;
        this.data = this["WHERE"](this.query["WHERE"]);
        if (this.data.length > 5000) {
            throw new ResultTooLargeError();
        } else {
            this["OPTIONS"](this.query["OPTIONS"]);
        }
    }

    public WHERE(query: any): any[] {
        if (Object.keys(query).length === 0) {
            return this.listOfSections;
        } else {
            for (const key in query) {
                if (query.hasOwnProperty(key)) {
                    return this[key as keyof Query](query[key]);
                }
            }
        }
    }

    public AND(query: any) {
        let listOfLoS: any[] = [];
        for (const key of query) {
            listOfLoS.push(this[Object.keys(key)[0] as keyof Query](Object.values(key)[0]));
        }
        return listOfLoS[0].filter((section: any) => {
            return listOfLoS.every((listOfSections) => listOfSections.includes(section));
        });
    }

    public OR(query: any) {
        let listOfLoS: any[] = [];
        for (const key of query) {
            listOfLoS.push(this[Object.keys(key)[0] as keyof Query](Object.values(key)[0]));
        }
        return Array.from(new Set([].concat(...listOfLoS)).values());
    }

    public LT(query: any) {
        let key: string = Object.keys(query)[0];
        let constraint: any = Object.values(query)[0];
        return this.listOfSections.filter((section: any) => {
            return section[key] < constraint;
        });
    }

    public GT(query: any) {
        let key: string = Object.keys(query)[0];
        let constraint: any = Object.values(query)[0];
        return this.listOfSections.filter((section: any) => {
            return section[key] > constraint;
        });
    }

    public EQ(query: any) {
        let key: string = Object.keys(query)[0];
        let constraint: any = Object.values(query)[0];
        return this.listOfSections.filter((section: any) => {
            return section[key] === constraint;
        });
    }

    public IS(query: any) {
        let key: string = Object.keys(query)[0];
        let constraint: any = Object.values(query)[0];
        return this.listOfSections.filter((section: any) => {
            return section[key] === constraint;
        });
    }

    public NOT(query: any) {
        let listOfSections: any[];
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                listOfSections = this[key as keyof Query](query[key]);
            }
        }
        return this.listOfSections.filter((section: any) => {
            return !(listOfSections.includes(section));
        });
    }

    public OPTIONS(query: any) {
        this["COLUMNS"](query["COLUMNS"]);
        if (Object.keys(query).length === 2) {
            this["ORDER"](query["ORDER"]);
        }
    }

    public COLUMNS(query: any) {
        this.data = this.data.map((section: any) => {
            for (let key of Object.keys(section)) {
                if (!(this.columnKeys.includes(key))) {
                    delete section[key];
                }
            }
            return section;
        });
    }

    public ORDER(query: any) {
        this.data = this.data.sort((a, b) => (a[this.sortingKey] > b[this.sortingKey]) ? 1 : -1);
    }

    public performQueryTest() {
        if (this.query.constructor !== Object
            || Object.keys(this.query).length !== 2
            || !(this.query.hasOwnProperty("WHERE"))
            || !(this.query.hasOwnProperty("OPTIONS"))) {
            throw new InsightError();
        }
        this["OPTIONSTest"](this.query["OPTIONS"]);
        this["WHERETest"](this.query["WHERE"]);
    }

    public WHERETest(query: any) {
        if (query.constructor !== Object
            || Object.keys(query).length > 1
            || (Object.keys(query).length === 1 && !(this.FILTERS.includes(Object.keys(query)[0])))) {
            throw new InsightError();
        }
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                this[(key + "Test") as keyof Query](query[key]);
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
            this[(Object.keys(key)[0] + "Test") as keyof Query](Object.values(key)[0]);
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
                this[(key + "Test") as keyof Query](query[key]);
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
                this[(key + "Test") as keyof Query](query[key]);
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

export = Query;
