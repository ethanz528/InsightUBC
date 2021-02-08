import {InsightError} from "./IInsightFacade";

class Query {
    public query: any;
    public datasets: {[id: string]: Dataset};
    public FILTERS: string[] = ["AND", "OR", "LT", "GT", "EQ", "IS", "NOT"];
    public MFIELDS: string[] = ["avg", "pass", "fail", "audit", "year"];
    public SFIELDS: string[] = ["dept", "id", "instructor", "title", "uuid"];
    public columnKeys: string[] = [];
    public datasetId: string;

    constructor(query: any, datasets: {[id: string]: Dataset}) {
        this.query = query;
        this.datasets = datasets;
    }

    public performQueryTest(query: any) {
        // console.log("performQueryTest");
        if (query.constructor !== Object
            || Object.keys(query).length !== 2
            || !query.hasOwnProperty("WHERE")
            || !query.hasOwnProperty("OPTIONS")) {
            // console.log("performQueryTest Error");
            throw new InsightError();
        }
        this["OPTIONS"](query["OPTIONS"]);
        this["WHERE"](query["WHERE"]);
    }

    public WHERE(query: any) {
        // console.log("WHERE");
        if (query.constructor !== Object
            || Object.keys(query).length > 1
            || (Object.keys(query).length === 1 && !this.FILTERS.includes(Object.keys(query)[0]))) {
            // console.log("WHERE Error");
            throw new InsightError();
        }
        for (let key in query) {
            // @ts-ignore
            this[key](query[key]);
        }
    }

    public AND(query: any) {
        // console.log("AND");
        if (!(query instanceof Array)
            || query.length === 0) {
            // console.log("AND Error");
            throw new InsightError();
        }
        for (let key of query) {
            if (!(this.FILTERS.includes(Object.keys(key)[0]))) {
                // console.log("AND Error");
                throw new InsightError();
            }
            // @ts-ignore
            this[Object.keys(key)[0]](Object.values(key)[0]);
        }
    }

    public OR(query: any) {
        // console.log("OR");
        if (!(query instanceof Array)
            || query.length === 0) {
            // console.log("OR Error");
            throw new InsightError();
        }
        for (let key of query) {
            if (!(this.FILTERS.includes(Object.keys(key)[0]))) {
                // console.log("OR Error");
                throw new InsightError();
            }
            // @ts-ignore
            this[Object.keys(key)[0]](Object.values(key)[0]);
        }
    }

    public LT(query: any) {
        // console.log("LT");
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || Object.keys(query)[0].split("_").length !== 2
            || Object.keys(query)[0].charAt(0) === "_"
            || !(this.datasets.hasOwnProperty(Object.keys(query)[0].slice(0, Object.keys(query)[0].indexOf("_"))))
            || !(this.datasetId === Object.keys(query)[0].split("_")[0])
            || !(this.MFIELDS.includes(Object.keys(query)[0].split("_")[1]))
            // @ts-ignore
            || !(Number.isInteger(Object.values(query)[0]))) {
            // console.log("LT Error");
            throw new InsightError();
        }
    }

    public GT(query: any) {
        // console.log("GT");
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || Object.keys(query)[0].split("_").length !== 2
            || Object.keys(query)[0].charAt(0) === "_"
            || !(this.datasets.hasOwnProperty(Object.keys(query)[0].slice(0, Object.keys(query)[0].indexOf("_"))))
            || !(this.datasetId === Object.keys(query)[0].split("_")[0])
            || !(this.MFIELDS.includes(Object.keys(query)[0].split("_")[1]))
            // @ts-ignore
            || !(Number.isInteger(Object.values(query)[0]))) {
            // console.log("GT Error");
            throw new InsightError();
        }
    }

    public EQ(query: any) {
        // console.log("EQ");
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || Object.keys(query)[0].split("_").length !== 2
            || Object.keys(query)[0].charAt(0) === "_"
            || !(this.datasets.hasOwnProperty(Object.keys(query)[0].slice(0, Object.keys(query)[0].indexOf("_"))))
            || !(this.datasetId === Object.keys(query)[0].split("_")[0])
            || !(this.MFIELDS.includes(Object.keys(query)[0].split("_")[1]))
            // @ts-ignore
            || !(Number.isInteger(Object.values(query)[0]))) {
            // console.log("EQ Error");
            throw new InsightError();
        }
    }

    public IS(query: any) {
        // console.log("IS");
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || Object.keys(query)[0].split("_").length !== 2
            || Object.keys(query)[0].charAt(0) === "_"
            || !(this.datasets.hasOwnProperty(Object.keys(query)[0].slice(0, Object.keys(query)[0].indexOf("_"))))
            || !(this.datasetId === Object.keys(query)[0].split("_")[0])
            || !(this.SFIELDS.includes(Object.keys(query)[0].split("_")[1]))
            || !(typeof Object.values(query)[0] === "string")
            // @ts-ignore
            || Object.values(query)[0].split("*").length > 3
            // @ts-ignore
            || ((Object.values(query)[0].charAt(0) === "*")
                // @ts-ignore
                + (Object.values(query)[0].charAt(Object.values(query)[0].length - 1) === "*")
                // @ts-ignore
                < Object.values(query)[0].split("*").length - 1)) {
            // console.log("IS Error");
            throw new InsightError();
        }
    }

    public NOT(query: any) {
        // console.log("NOT");
        if (query.constructor !== Object
            || Object.keys(query).length !== 1
            || !this.FILTERS.includes(Object.keys(query)[0])) {
            // console.log("WHERE Error");
            throw new InsightError();
        }
        for (let key in query) {
            // console.log(query[key]);
            // @ts-ignore
            this[key](query[key]);
        }
    }

    public OPTIONS(query: any) {
        // console.log("OPTIONS");
        if (query.constructor !== Object ||
            Object.keys(query).length > 2 ||
            !(query.hasOwnProperty("COLUMNS")) ||
            (Object.keys(query).length === 2 && !(query.hasOwnProperty("ORDER")))) {
            // console.log("OPTIONS Error");
            throw new InsightError();
        }
        for (let key in query) {
            // @ts-ignore
            this[key](query[key]);
        }
    }

    public COLUMNS(query: any) {
        // console.log("COLUMNS");
        if (!(query instanceof Array)
            || query.length === 0) {
            throw new InsightError();
        }
        this.datasetId = query[0].split("_")[0];
        for (let key of query) {
            if (key.split("_").length !== 2
                || key.charAt(0) === "_"
                || !(this.datasets.hasOwnProperty(key.slice(0, key.indexOf("_"))))
                || !(this.datasetId === key.split("_")[0])
                || (!(this.MFIELDS.includes(key.split("_")[1])) && !(this.SFIELDS.includes(key.split("_")[1])))) {
                // console.log("COLUMNS Error");
                throw new InsightError();
            }
            this.columnKeys.push(key);
        }
    }

    public ORDER(query: any) {
        // console.log("ORDER");
        if (!(typeof query === "string")
            || query.split("_").length !== 2
            || query.charAt(0) === "_"
            || !(this.datasets.hasOwnProperty(query.slice(0, query.indexOf("_"))))
            || (!(this.MFIELDS.includes(query.split("_")[1])) && !(this.SFIELDS.includes(query.split("_")[1])))
            || !(this.columnKeys.includes(query))) {
            // console.log("ORDER Error");
            throw new InsightError();
        }
    }

}

export = Query;
