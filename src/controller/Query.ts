import {InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {Dataset} from "./Dataset";
import QTT = require("./QueryTest");

class Query {
    private readonly query: any;
    private datasets: { [id: string]: Dataset };
    private idList: string[];
    private columnKeys: string[] = [];
    private dataset: Dataset;
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
        let qtt = new QTT(this.datasets, this.idList);
        qtt.performQueryTest(this.query);
        this.columnKeys = qtt.columnKeys;
        this.dataset = qtt.dataset;
        this.sortingKey = qtt.sortingKey;
        if (this.dataset.kind === InsightDatasetKind.Rooms) {
            return [];
        }
        this.performQueryHelper();
        return this.data;
    }

    private performQueryHelper() {
        this.dataset.create();
        this.listOfSections = this.dataset.listOfSections;
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
        if (constraint.charAt(0) === "*" && constraint.charAt(constraint.length - 1) === "*") {
            constraint = constraint.slice(1, -1);
            return this.listOfSections.filter((section: any) => {
                return section[key].includes(constraint);
            });
        } else if (constraint.charAt(0) === "*") {
            constraint = constraint.slice(1);
            let s: any = constraint.length;
            return this.listOfSections.filter((section: any) => {
                return section[key].slice(-s) === constraint;
            });
        } else if (constraint.charAt(constraint.length - 1) === "*") {
            constraint = constraint.slice(0, -1);
            let s: any = constraint.length;
            return this.listOfSections.filter((section: any) => {
                return section[key].slice(0, s) === constraint;
            });
        } else {
            return this.listOfSections.filter((section: any) => {
                return section[key] === constraint;
            });
        }
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
        this.data.sort((a, b) => (a[this.sortingKey] > b[this.sortingKey]) ? 1 : -1);
    }

}

export = Query;
