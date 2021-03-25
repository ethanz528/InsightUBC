import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import {InsightError, NotFoundError, ResultTooLargeError} from "./IInsightFacade";
import {isIdInvalid} from "./IdChecker";
import {Dataset} from "./Dataset";
import {isFileValid} from "./FileValidator";
import Q = require("./Query");

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {

    private addedDatasets: { [id: string]: Dataset } = { };
    private idList: string[] = [];

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
        if (kind === "courses") {
            return isFileValid(content).
            then((val) => {
                if (val) {
                    newDataset = new Dataset(id, kind, content);
                    this.idList.push(id);
                    this.addedDatasets[id] = newDataset;
                    return Promise.resolve(this.idList);
                } else {
                    return Promise.reject(new InsightError("File invalid, not in Zip, courses folder not in root " +
                        "directory, or no course files in JSON. Dataset NOT added."));
                }
            });
        } else if (kind === "rooms") {
            newDataset = new Dataset(id, kind, content);
            this.idList.push(id);
            this.addedDatasets[id] = newDataset;
            return Promise.resolve(this.idList);
        }
    }

    public removeDataset(id: string): Promise<string> {
        if (isIdInvalid(id)) {
            return Promise.reject(new InsightError("ID invalid, contains underscore OR is only white space."));
        }
        if (!this.idList.some((item: string) => {
            return item === id;
        })) {
            return Promise.reject(new NotFoundError("ID doesn't exist."));
        } else {
            this.idList.splice(this.idList.indexOf(id), 1);
            delete this.addedDatasets[id];
            return Promise.resolve(id);
        }
    }

    public performQuery(query: any): Promise<any[]> {
        let q = new Q(this.addedDatasets);
        try {
            return Promise.resolve(q.performQuery(query));
        } catch (error) {
            if ((error instanceof InsightError) || (error instanceof ResultTooLargeError)) {
                return Promise.reject(error);
            }
        }
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.resolve(Object.values(this.addedDatasets).map((e: Dataset) => {
            return {
                id: e.id,
                kind: e.kind,
                numRows: (e.listOfCourseSectionsOrRooms).length
            };
        }));
        // return Promise.reject("Not implemented.");
    }
}
