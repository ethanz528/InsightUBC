
import * as JSZip from "jszip";
import has = Reflect.has;

// Req: the file be available in given path
// Eff: loads all of index.htm in string form
export let loadIndexInString = function (file: string): Promise<string> {
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
export let retrieveBuildingTable = function (htmlJsonTreeNode: any): JSON | boolean {
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

// TODO
// Req: buildingTree must be in JSON form
// Eff: traverses the buildingTree, extracting all file paths in string form, and returning them in a list
export let extractFilePaths = function (buildingTree: any): string[] {
    let filePaths: string[] = [];
    return filePaths;
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
    if (containsDataAboutBuildings(tbody)) {
        return true;
    } else {
        return false;
    }

};

// helper
// Req: listOfChildNodes must be children of a table node found in JSON tree
// Eff: returns only the tbody portion of the html table in a JSON tree format
let retrieveTbody = function (listOfChildNodes: any): JSON {
    const targetName: string = "tbody";
    for (const child of listOfChildNodes) {
        if (child.nodeName === targetName) {
            return child;
        }
    }
};

// helper
// Req: tbody must be in JSON tree format
// Eff: returns true if the tbody contains at least one row which houses information about buildings, false otherwise
function containsDataAboutBuildings(tbody: any): boolean {
    const tbodyContent = tbody.childNodes;
    for (const item of tbodyContent) {
        if (atARowAndContainsBuildingInfo(item)) {
            return true;
        }
    }
    return false;
}

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
        if (pathResults.indexOf(true)) {
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
// Req: childNodes must be in JSON, and be a valid list of additional nodes
// Eff: returns true of child nodes exist and can be explored, false otherwise
let atLeastOneExplorableChildNode = function (childNodes: any): boolean {
    return childNodes && childNodes.length > 0;
};

