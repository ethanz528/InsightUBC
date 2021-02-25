import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError, ResultTooLargeError} from "./IInsightFacade";
import {isIdInvalid} from "./idChecker";
import {Dataset} from "./dataset";
import {isFileValid} from "./fileValidator";
import Q = require("./Query");

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

    private addedDatasets: Dataset[] = [];
    private idList: string[] = [];
    private testIdList: string[] = ["courses", "otherCourses"];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let newDataset: Dataset;
        if (this.idList.some((item: string) => {
             return item === id;
        })) {
            return Promise.reject(new InsightError("ID already added. Dataset NOT added"));
        }
        if (isIdInvalid(id)) {
            return Promise.reject(new InsightError("ID invalid, contains underscore OR is only white space," +
                "dataset NOT added."));
        }
        return isFileValid(content).
        then((val) => {
            if (val) {
                newDataset = new Dataset(id, content);
                this.idList.push(id);
                this.addedDatasets.push(newDataset);
                return Promise.resolve(this.idList);
            } else {
                return Promise.reject(new InsightError("File invalid, not in Zip, courses folder not in root " +
                    "directory, or no course files in JSON. Dataset NOT added."));
            }
        });
        /*if (!isFileValid(content)) {
            return Promise.reject(new InsightError("File invalid, not in Zip, courses folder not in root " +
                "directory, or no course files in JSON. Dataset NOT added."));
        } else {
            newDataset = new Dataset(id, content);
            this.idList.push(id);
            this.addedDatasets.push(newDataset);
            return Promise.resolve(this.idList);
        }*/
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
