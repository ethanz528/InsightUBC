import {InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {Dataset} from "./Dataset";
import Decimal from "decimal.js";
import QT = require("./QueryTest");

class Query {
    private datasets: { [id: string]: Dataset };
    private columnKeys: string[] = [];
    private dataset: Dataset;
    private sortingKeys: string[];
    private sortingUP: number;
    private GROUPPresent: boolean;
    private GROUPKeys: string[];
    private APPLYS: any[];
    private listOfSections: any[];
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
        this.GROUPPresent = qt.GROUPPresent;
        this.GROUPKeys = qt.GROUPKeys;
        this.APPLYS = qt.APPLYS;
        if (this.dataset.kind === InsightDatasetKind.Rooms) {
            return [];
        }
        this.performQueryHelper(query);
        return this.data;
    }

    private performQueryHelper(query: any) {
        this.dataset.create();
        this.listOfSections = this.dataset.listOfSections;
        this.data = this["WHERE"](query["WHERE"]);
        if (this.GROUPPresent) {
            this["TRANSFORMATIONS"](query["TRANSFORMATIONS"]);
        }
        if (this.data.length > 5000) {
            throw new ResultTooLargeError();
        } else {
            this["OPTIONS"](query["OPTIONS"]);
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
        this.data.sort((a, b) => this.sortHelper([a, b]));
    }

    public sortHelper(ab: any) {
        for (const key of this.sortingKeys) {
            if (ab[0][key] === ab[1][key]) {
                // pass
            } else if (ab[0][key] < ab[1][key]) {
                return -this.sortingUP;
            } else {
                return this.sortingUP;
            }
        }
        return -this.sortingUP;
    }

    public TRANSFORMATIONS(query: any) {
        this["GROUP"](query["GROUP"]);
        this["APPLY"](query["APPLY"]);
    }

    public GROUP(query: any) {
        let newData: any[] = [];
        let flag: boolean;
        for (const section of this.data) {
            flag = false;
            for (const nd of newData) {
                if (this.GROUPKeys.every((e) => nd[e] === section[e])) {
                    nd["data"].push(section);
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                let ndd: { [id: string]: any } = { };
                this.GROUPKeys.map((e) => ndd[e] = section[e]);
                ndd["data"] = [section];
                newData.push(ndd);
            }
        }
        this.data = newData;
    }

    public APPLY(query: any) {
        for (const applyKey of this.APPLYS) {
            for (const data of this.data) {
                data[Object.keys(applyKey)[0]] = this[Object.keys(Object.values(applyKey)[0])[0] as keyof Query]
                (data["data"].map((e: any) =>  e[Object.values(Object.values(applyKey)[0])[0]]));
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
