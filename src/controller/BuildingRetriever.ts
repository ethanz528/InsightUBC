
import * as JSZip from "jszip";
import {Building} from "./Building";


// Req: file must be the path of a valid file in string form
// Eff: returns a list of buildings from the index.htm file in the rooms folder
export let loadBuildingListFromFile = function (file: string): Promise<Building[]> {
    return loadIndexInString(file).
    then((val) => {
        return stringToJsonTree(val);
    }).
    then((val) => {
        return retrieveBuildingTable(val);
    }).
    then((val) => {
        return createListOfBuildings(val);
    });
};

// Req: the file be available in given path
// Eff: loads all of index.htm in string form
let loadIndexInString = function (file: string): Promise<string> {
    let zip = new JSZip();
    return zip.loadAsync(file, {base64: true}).
    then((zipObj): Promise<string> => {
        return zipObj.folder("rooms").file("index.htm").async("string");
    });
};

// Req: htmlString be valid html code in string form
// Eff: transforms htmlString into a JSON tree object
export let stringToJsonTree = function (htmlString: string): JSON {
    const parse5 = require("parse5");
    return parse5.parse(htmlString);
};

// Req: htmlJsonTree be a valid html JSON tree
// Eff: traverses the JSON tree to locate and return the table containing building indices
let retrieveBuildingTable = function (htmlJsonTreeNode: any): JSON | boolean {
    let tableNode;
    if (!atLeastOneExplorableChildNode(htmlJsonTreeNode.childNodes)) {
        return false;
    } else if (isThisTheBuildingTableNode(htmlJsonTreeNode)) {
        tableNode = htmlJsonTreeNode;
    } else {
        const dfsTodo = htmlJsonTreeNode.childNodes;
        for (const node of dfsTodo) {
            const tempVal = retrieveBuildingTable(node);
            if (tempVal) {
                tableNode = tempVal;
            }
        }
    }
    return tableNode;
};

// Req: table must be valid html json tree, containing building information
// Eff: from the json tree, constructs a list buildings.
let createListOfBuildings = function (table: any): Building[] {
    const buildingList: Building[] = [];
    const tbody = retrieveTbody(table.childNodes);
    const onlyRows = keepOnlyRowElements(tbody);
    for (const row of onlyRows) {
        const dataColumns = row.childNodes;
        const sn: string = dataColumns[3].childNodes[0].value.trim();
        const fn: string = dataColumns[5].childNodes[1].childNodes[0].value;
        const fp: string = dataColumns[5].childNodes[1].attrs[0].value;
        const ad: string = dataColumns[7].childNodes[0].value.trim();
        const start = 2;
        const end = fp.length;
        const path = fp.slice(start, end);
        const building = new Building(fn, sn, ad, path);
        buildingList.push(building);
    }

    return buildingList;
};

// helper
// Req: treeNode must be in JSON
// Eff: returns true if we are at the node in the JSON tree which contains our building table
let isThisTheBuildingTableNode = function (treeNode: any): boolean {
    const reqName: string = "table";
    return treeNode.nodeName === reqName && verifyTbodyContainsBuildingInfo(treeNode.childNodes);
};

// helper
// Req: children must be in JSON tree format
// Eff: verifies that the body of the table contains information about buildings
let verifyTbodyContainsBuildingInfo = function (children: any): boolean {
    const tbody = retrieveTbody(children);
    return containsDataAboutBuildings(tbody);

};

// helper
// Req: listOfChildNodes must be children of a table node found in JSON tree
// Eff: returns only the tbody portion of the html table in a JSON tree format
let retrieveTbody = function (listOfChildNodes: any): any {
    const targetName: string = "tbody";
    for (const child of listOfChildNodes) {
        if (child.nodeName === targetName) {
            return child;
        }
    }
};

// can be removed entirely
// helper
// Req: tbody must be in JSON tree format
// Eff: returns true if the tbody contains at least one row which houses information about buildings, false otherwise
let containsDataAboutBuildings = function (tbody: any): boolean {
    const tbodyContent = tbody.childNodes;
    for (const item of tbodyContent) {
        if (atARowAndContainsBuildingInfo(item)) {
            return true;
        }
    }
    return false;
};

// helper
// Req: tableItem must be in JSON tree format
// Eff: returns true if we are at a row, and the given row contains building data, false otherwise
let atARowAndContainsBuildingInfo = function (tableItem: any): boolean {
    const rowIndicator: string = "tr";
    return tableItem.nodeName === rowIndicator && foundBuildingDataInRow(tableItem);
};

// helper
// Req: rowItem must be in JSON tree format
// Eff: returns true if the row contains building info, false otherwise
let foundBuildingDataInRow = function (rowItem: any): boolean {
    if (verifyRowItem(rowItem)) {
        return true;
    } else if (atLeastOneExplorableChildNode(rowItem.childNodes)) {
        const dfsTodo = rowItem.childNodes;
        const pathResults: boolean[] = [];
        for (const node of dfsTodo) {
            let result = foundBuildingDataInRow(node);
            pathResults.push(result);
        }
        if (containsValue(pathResults, true)) {
            return true;
        }
    }
    return false;
};

// helper
// Req: rowItem must be in JSON
// Eff: returns true if the given node found in a table row contains building data, false otherwise
let verifyRowItem = function (rowItem: any): boolean {
    const targetNode = "a";
    const targetAttrName: string = "title";
    const targetAttrValue: string = "Building Details and Map";
    let attributesInterestedIn;
    if (rowItem.attrs && rowItem.attrs[1]) {
        attributesInterestedIn = rowItem.attrs[1];
        return rowItem.nodeName === targetNode && attributesInterestedIn.name === targetAttrName &&
            attributesInterestedIn.value === targetAttrValue;
    } else {
        return false;
    }
};

// helper
// Eff: returns true if the given array contains value, false otherwise.
export let containsValue = function (list: any[], value: any): boolean {
    const val: number = list.indexOf(value);
    const notFoundVal = -1;
    return val !== notFoundVal;
};

// helper
// Req: tbody param must be a html json tree tbody of a table
// Eff: returns only the tbody child nodes that are rows
export let keepOnlyRowElements = function (tbody: any): any {
    return tbody.childNodes.filter((val: any) => {
        const forbiddenText: string = "#text";
        return val.nodeName !== forbiddenText;
    });
};

// helper
// Req: childNodes must be in JSON, and be a valid list of additional nodes
// Eff: returns true of child nodes exist and can be explored, false otherwise
export let atLeastOneExplorableChildNode = function (childNodes: any): boolean {
    return childNodes && childNodes.length > 0;
};

