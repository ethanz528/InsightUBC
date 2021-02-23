import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError, ResultTooLargeError} from "./IInsightFacade";
import Q = require("./Query");

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

    private addedDatasets: any[] = [];
    private idList: string[] = [];
    private testIdList: string[] = ["courses", "otherCourses"];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        return Promise.reject("Not implemented.");
    }

    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise<any[]> {
        let q = new Q(query, this.addedDatasets, this.testIdList);
        try {
            q.performQuery();
        } catch (error) {
            if ((error instanceof InsightError) || (error instanceof ResultTooLargeError)) {
                return Promise.reject(error);
            }
        }
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
