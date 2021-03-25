import {ResultTooLargeError} from "./IInsightFacade";
import {Dataset} from "./Dataset";
import Decimal from "decimal.js";
import QT = require("./QueryTest");

class Query {
    private readonly datasets: { [id: string]: Dataset };
    private columnKeys: string[] = [];
    private dataset: Dataset;
    private sortingKeys: string[];
    private sortingUP: boolean;
    private GROUPKeys: string[];
    private APPLYS: any[];
    private listOfData: any[];
    private data: any[];

    constructor(datasets: { [id: string]: Dataset }) {
        this.datasets = datasets;
    }

    public performQuery(query: any) {
        let qt = new QT(this.datasets);
        qt.performQueryTest(query);
        this.dataset = qt.dataset;
        this.columnKeys = qt.columnKeys;
        this.sortingKeys = qt.sortingKeys;
        this.sortingUP = qt.sortingUP;
        this.GROUPKeys = qt.GROUPKeys;
        this.APPLYS = qt.APPLYS;
        this.performQueryHelper(query);
        return this.data;
    }

    private performQueryHelper(query: any) {
        this.dataset.create();
        this.listOfData = this.dataset.listOfSections;
        this.data = this.WHERE(query["WHERE"]);
        if (query.hasOwnProperty("TRANSFORMATIONS")) {
            this.TRANSFORMATIONS(query["TRANSFORMATIONS"]);
        }
        if (this.data.length > 5000) {
            throw new ResultTooLargeError();
        } else {
            this.OPTIONS(query["OPTIONS"]);
        }
    }

    public WHERE(query: any): any[] {
        if (Object.keys(query).length === 0) {
            return this.listOfData;
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
        return listOfLoS[0].filter((dataset: any) => listOfLoS.every((los) => los.includes(dataset)));
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
        return this.listOfData.filter((dataset: any) => dataset[key] < constraint);
    }

    public GT(query: any) {
        let key: string = Object.keys(query)[0];
        let constraint: any = Object.values(query)[0];
        return this.listOfData.filter((dataset: any) => dataset[key] > constraint);
    }

    public EQ(query: any) {
        let key: string = Object.keys(query)[0];
        let constraint: any = Object.values(query)[0];
        return this.listOfData.filter((dataset: any) => dataset[key] === constraint);
    }

    public IS(query: any) {
        let key: string = Object.keys(query)[0];
        let constraint: any = Object.values(query)[0];
        if (constraint.charAt(0) === "*" && constraint.charAt(constraint.length - 1) === "*") {
            constraint = constraint.slice(1, -1);
            return this.listOfData.filter((dataset: any) => dataset[key].includes(constraint));
        } else if (constraint.charAt(0) === "*") {
            constraint = constraint.slice(1);
            let s: any = constraint.length;
            return this.listOfData.filter((dataset: any) => dataset[key].slice(-s) === constraint);
        } else if (constraint.charAt(constraint.length - 1) === "*") {
            constraint = constraint.slice(0, -1);
            let s: any = constraint.length;
            return this.listOfData.filter((dataset: any) => dataset[key].slice(0, s) === constraint);
        } else {
            return this.listOfData.filter((dataset: any) => dataset[key] === constraint);
        }
    }

    public NOT(query: any) {
        let listOfSections: any[];
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                listOfSections = this[key as keyof Query](query[key]);
            }
        }
        return this.listOfData.filter((section: any) => !(listOfSections.includes(section)));
    }

    public OPTIONS(query: any) {
        this.COLUMNS(query["COLUMNS"]);
        if (query.hasOwnProperty("ORDER")) {
            this.ORDER(query["ORDER"]);
        }
    }

    public COLUMNS(query: any) {
        this.data.map((data: any) => {
            Object.keys(data).map((key) => {
                if (!(this.columnKeys.includes(key))) {
                    delete data[key];
                }
            });
            return data;
        });
    }

    public ORDER(query: any) {
        this.data.sort((a, b) => {
            for (const key of this.sortingKeys) {
                if (a[key] !== b[key]) {
                    return ((a[key] < b[key]) === this.sortingUP) ? -1 : 1;
                }
            }
            return this.sortingUP ? -1 : 1;
        });
    }

    public TRANSFORMATIONS(query: any) {
        this.GROUP(query["GROUP"]);
        this.APPLY(query["APPLY"]);
    }

    public GROUP(query: any) {
        let newData: any[] = [];
        for (const dataset of this.data) {
            if (!(newData.some((group) => {
                if (this.GROUPKeys.every((groupKey) => group[groupKey] === dataset[groupKey])) {
                    group["data"].push(dataset);
                    return true;
                }
            }))) {
                let newGroup: { [id: string]: any } = { data: [dataset] };
                this.GROUPKeys.map((e) => newGroup[e] = dataset[e]);
                newData.push(newGroup);
            }
        }
        this.data = newData;
    }

    public APPLY(query: any) {
        for (const applyKey of this.APPLYS) {
            for (const group of this.data) {
                group[Object.keys(applyKey)[0]] = this[Object.keys(Object.values(applyKey)[0])[0] as keyof Query]
                (group["data"].map((e: any) =>  e[Object.values(Object.values(applyKey)[0])[0]]));
            }
        }
    }

    public MAX(query: any): number {
        return Math.max.apply(null, query);
    }

    public MIN(query: any): number {
        return Math.min.apply(null, query);
    }

    public AVG(query: any): number {
        let total: Decimal = new Decimal(0);
        query.every((e: number) => total = Decimal.add(total, new Decimal(e)));
        return Number((total.toNumber() / query.length).toFixed(2));
    }

    public COUNT(query: any): number {
        return (new Set(query)).size;
    }

    public SUM(query: any): number {
        let total: Decimal = new Decimal(0);
        query.every((e: number) => total = Decimal.add(total, new Decimal(e)));
        return Number(total.toFixed(2));
    }
}

export = Query;
