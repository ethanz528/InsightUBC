import * as chai from "chai";
import {expect} from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import {InsightDatasetKind, InsightError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import {isIdInvalid} from "../src/controller/IdChecker";
import {atLeastOneJSON, isRootDirCourses, isValidZip} from "../src/controller/FileValidator";
import {saveToData} from "../src/controller/SaveAndLoad";
import {Dataset} from "../src/controller/Dataset";
import {loadBuildingListFromFile} from "../src/controller/BuildingRetriever";
import {Building} from "../src/controller/Building";
import {setGeoLocationForList} from "../src/controller/GeoLocate";
import {isBuildingValid} from "../src/controller/BuildingValidator";
import {Room} from "../src/controller/Room";
import {generateRoomList} from "../src/controller/RoomHelper";

// This extends chai with assertions that natively support Promises
chai.use(chaiAsPromised);

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        notZip: "./test/data/notZip.7z",
        vourses: "./test/data/vourses.zip",
        notJSON1f: "./test/data/notJSON1f.zip",
        notJSON3f: "./test/data/notJSON3f.zip",
        oneJSON2f: "./test/data/oneJSON2f.zip",
        baseCasex3: "./test/data/baseCasex3.zip",
        validDataset: "./test/data/validDataset.zip",
        coursesSmall: "./test/data/courses_small.zip",
        invalidJSON: "./test/data/invalid_JSON.zip",
        noSections: "./test/data/no_sections.zip",
        notCourses: "./test/data/not_courses.zip",
        someInvalid: "./test/data/some_invalid.zip",
        rooms: "./test/data/rooms.zip"
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });
    // ****
    // ******
    // addDataset 1 dataset FULFILL
    // ******
    // ****
    // This is a unit test. You should create more like this!

    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Should add a valid dataset", function () {
        const id: string = "coursesSmall";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Should add a valid dataset", function () {
        const id: string = "noSections";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Should add a partially valid dataset", function () {
        const id: string = "someInvalid";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Valid dataset ID, space and character mix", function () {
        const id: string = " a a ";
        const expected: string[] = [id];
        const dummy: string = "courses";
        const futureResult: Promise<string[]> =
            insightFacade.addDataset(id, datasets[dummy], InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    // ****
    // ******
    // addDataset multiple dataset FULFILL
    // ******
    // ****
    it("2 valid datasets being added", function () {
        this.timeout(0);
        const id: string = "courses";
        const id1: string = "someInvalid";
        const expected: string[] = [id, id1];
        const futureResult: Promise<string[]> =
            insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses).
            then(function () {
                return insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses);
            });
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    // ****
    // ******
    // addDataset 1 dataset REJECT
    // ******
    // ****
    it("Should not add invalid dataset, not a ZIP", function () {
        const id: string = "notZip";
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("Files not under a folder called courses", function () {
        const id: string = "vourses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("Files not under a folder called courses", function () {
        const id: string = "notCourses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("1 file in courses and not in JSON format", function () {
        const id: string = "notJSON1f";
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("3 files in courses and non in JSON format", function () {
        const id: string = "notJSON3f";
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("invalid JSON", function () {
        const id: string = "invalidJSON";
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("Invalid ID, _ at the beginning", function () {
        const id: string = "_course";
        const dummy: string = "courses";
        const futureResult: Promise<string[]> =
            insightFacade.addDataset(id, datasets[dummy], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("Invalid ID, _ at the end", function () {
        const id: string = "course_";
        const dummy: string = "courses";
        const futureResult: Promise<string[]> =
                insightFacade.addDataset(id, datasets[dummy], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("Invalid ID, _ in the middle", function () {
        const id: string = "cou_rse";
        const dummy: string = "courses";
        const futureResult: Promise<string[]> =
                insightFacade.addDataset(id, datasets[dummy], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
        }
    );
    it("Invalid ID, only blank spaces", function () {
        const id: string = "   ";
        const dummy: string = "courses";
        const futureResult: Promise<string[]> =
            insightFacade.addDataset(id, datasets[dummy], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
    // ****
    // ******
    // addDataset multiple dataset REJECT
    // ******
    // ****
    it("Add first dataset, add second with same name, reject second", function () {
        const id: string = "courses";
        const id1: string = "courses";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> =
            insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected).
        then(function () {
            futureResult = insightFacade.addDataset(id1, datasets[id1], InsightDatasetKind.Courses);
            return expect(futureResult).to.be.rejectedWith(InsightError);
        });
    });
    // ****
    // ******
    // addDataset multiple datasets REJECT and FULFILL mix
    // ******
    // ****
    it("Should try to add 2 datasets, only rejects second (not JSON format)", function () {
        const id: string = "courses";
        const id2: string = "invalidJSON";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> =
            insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected).
        then(function () {
            futureResult = insightFacade.addDataset(id2, datasets[id2], InsightDatasetKind.Courses);
            return expect(futureResult).to.be.rejectedWith(InsightError);
        });
    });
    // ****
    // ******
    // idChecker tests
    // ******
    // ****
    it("Should return false for valid IDs", function () {
        const id: string = "courses";
        const result: boolean = isIdInvalid(id);
        return expect(result).to.deep.equal(false);
    });
    it("Should return false for valid IDs", function () {
        const id: string = " abc %";
        const result: boolean = isIdInvalid(id);
        return expect(result).to.deep.equal(false);
    });
    it("Should return true for invalid IDs", function () {
        const id: string = "ubc_course";
        const result: boolean = isIdInvalid(id);
        return expect(result).to.deep.equal(true);
    });
    it("Should return true for invalid IDs", function () {
        const id: string = "  ";
        const result: boolean = isIdInvalid(id);
        return expect(result).to.deep.equal(true);
    });
    // ****
    // ******
    // fileValidator tests
    // ******
    // ****
    it("Should return false as we are adding an invalid zip", function () {
        const id: string = "notZip";
        const result: Promise<boolean> = isValidZip(datasets[id]);
        return expect(result).to.eventually.deep.equal(false);
    });
    it("Should return true as we are adding a valid zip", function () {
        const id: string = "coursesSmall";
        const result: Promise<boolean> = isValidZip(datasets[id]);
        return expect(result).to.eventually.deep.equal(true);
    });
    it("Should return true as we are adding a valid zip", function () {
        const id: string = "invalidJSON";
        const result: Promise<boolean> = isValidZip(datasets[id]);
        return expect(result).to.eventually.deep.equal(true);
    });
    it("Should return true as we are adding a valid zip", function () {
        const id: string = "noSections";
        const result: Promise<boolean> = isValidZip(datasets[id]);
        return expect(result).to.eventually.deep.equal(true);
    });
    it("Should return true as we are adding a valid zip", function () {
        const id: string = "notCourses";
        const result: Promise<boolean> = isValidZip(datasets[id]);
        return expect(result).to.eventually.deep.equal(true);
    });
    it("Should return true as we are adding a valid zip", function () {
        const id: string = "someInvalid";
        const result: Promise<boolean> = isValidZip(datasets[id]);
        return expect(result).to.eventually.deep.equal(true);
    });
    it("Should return true as root directory is courses", function () {
        const id: string = "coursesSmall";
        const result: Promise<boolean> = isRootDirCourses(datasets[id]);
        return expect(result).eventually.deep.equal(true);
    });
    it("Should return true as root directory is courses", function () {
        const id: string = "invalidJSON";
        const result: Promise<boolean> = isRootDirCourses(datasets[id]);
        return expect(result).eventually.deep.equal(true);
    });
    it("Should return false as root directory is not courses", function () {
        const id: string = "notCourses";
        const result: Promise<boolean> = isRootDirCourses(datasets[id]);
        return expect(result).to.eventually.deep.equal(false);
    });
    it("Should return true as at least 1 JSON format in courses", function () {
        const id: string = "someInvalid";
        const result: Promise<boolean> = atLeastOneJSON(datasets[id]);
        return expect(result).to.eventually.deep.equal(true);
    });
    it("Should return false as no files in JSON format in courses", function () {
        const id: string = "invalidJSON";
        const result: Promise<boolean> = atLeastOneJSON(datasets[id]);
        return expect(result).to.eventually.deep.equal(false);
    });
    // ****
    // ******
    // saveToData tests
    // ******
    // ****
    /*it("Should add a partially valid dataset, and then save the CourseSections to data", function () {
        const id: string = "someInvalid";
        const item: Dataset =  new Dataset(id, InsightDatasetKind.Courses, datasets[id]);
        const futureResult: Promise<boolean> = item.sections.
        then((val) => {
             return saveToData(id, val);
        });
        return expect(futureResult).eventually.deep.equal(true);
    });*/
    // ****
    // ******
    // createBuildingListFromFile test
    // ******
    // ****
    it("Should return a list of buildings from the given zip file", function () {
        const id: string = "rooms";
        const futureResult: Promise<Building[]> = loadBuildingListFromFile(datasets[id]);
        return expect(futureResult).eventually.deep.equal(" ");
    });
    // ****
    // ******
    // setGeoLocationForList test
    // ******
    // ****
    it("Should return a list of buildings with geoLocation", function () {
        const id: string = "rooms";
        const futureResult: Promise<Building[]> = loadBuildingListFromFile(datasets[id]).
        then((val) => {
            return setGeoLocationForList(val);
        });
        return expect(futureResult).eventually.deep.equal(" ");
    });
    // ****
    // ******
    // roomRetrieval test
    // ******
    // ****
    it("Should return a list of rooms from a given file", function () {
        this.timeout(0);
        const id: string = "rooms";
        const futureResult: Promise<any> = generateRoomList(datasets[id]);
        return expect(futureResult).eventually.deep.equal(" ");
    });
    // ****
    // ******
    // isBuildingValid test
    // ******
    // ****
    it("Should return true as building is valid", function () {
        const id: string = "rooms";
        const fn: string = "Allard Hall (LAW)";
        const sn: string = "ALRD";
        const ad: string = "1822 East Mall";
        const fp: string = "campus/discover/buildings-and-classrooms/ALRD";
        const lat: number = 49.2699;
        const lon: number = -123.25318;
        const building: Building = new Building(fn, sn, ad, fp);
        building.lat = lat;
        building.lon = lon;
        const futureResult: Promise<boolean> = isBuildingValid(building, datasets[id]);
        return expect(futureResult).to.eventually.deep.equal(true);
    });
    it("Should return false as building is invalid (no lat and lon)", function () {
        const id: string = "rooms";
        const fn: string = "Allard Hall (LAW)";
        const sn: string = "ALRD";
        const ad: string = "1822 East Mall";
        const fp: string = "campus/discover/buildings-and-classrooms/ALRD";
        const lat: number = undefined;
        const lon: number = undefined;
        const building: Building = new Building(fn, sn, ad, fp);
        building.lat = lat;
        building.lon = lon;
        const futureResult: Promise<boolean> = isBuildingValid(building, datasets[id]);
        return expect(futureResult).to.eventually.deep.equal(false);
    });
    it("Should return false as building is invalid (contains no room info)", function () {
        const id: string = "rooms";
        const fn: string = "Acute Care Unit";
        const sn: string = "ACU";
        const ad: string = "2211 Wesbrook Mall";
        const fp: string = "campus/discover/buildings-and-classrooms/ACU";
        const lat: number = 49.26408;
        const lon: number = -123.24605;
        const building: Building = new Building(fn, sn, ad, fp);
        building.lat = lat;
        building.lon = lon;
        const futureResult: Promise<boolean> = isBuildingValid(building, datasets[id]);
        return expect(futureResult).to.eventually.deep.equal(false);
    });
    // ****
    // ******
    // addDataset Room test
    // ******
    // ****
    it("Should add a valid Room dataset", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
});


/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: {path: string, kind: InsightDatasetKind} } = {
        courses: {path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
        otherCourses: {path: "./test/data/otherCourses.zip", kind: InsightDatasetKind.Courses},
        rooms: {path: "./test/data/otherCourses.zip", kind: InsightDatasetKind.Rooms}
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises); // .catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             */
            // return Promise.resolve("HACK TO LET QUERIES RUN");
        // });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<any[]> = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});
