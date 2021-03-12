
import * as JSZip from "jszip";

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
    const reqName: string = "div";
    return treeNode.nodeName === reqName && verifyAttrForBuildingTable(treeNode.attrs);
};

// helper
// Req: attrList must be in JSON, and be a valid list of attributes (name & value pairs)
// Eff: goes through attrList from given node, and returns true if they match those of the building table, false
// otherwise
let verifyAttrForBuildingTable = function (attrList: any): boolean {
    for (const attr of attrList) {
        if (nameAndValueMatch(attr)) {
            return true;
        }
    }
    return false;
};

// helper
// Req: attr must be in JSON form with name and value
// Eff: returns true if the attribute name and value match, false otherwise
let nameAndValueMatch = function (attr: any): boolean {
    const targetName: string = "class";
    const targetValue: string = "view view-buildings-and-classrooms view-id-buildings_and_classrooms " +
        "view-display-id-page container view-dom-id-9211a3b29ecac7eefe0218f60b62b795";
    return attr.name === targetName && attr.value === targetValue;
};

// helper
// Req: childNodes must be in JSON, and be a valid list of additional nodes
// Eff: returns true of child nodes exist and can be explored, false otherwise
let atLeastOneExplorableChildNode = function (childNodes: any): boolean {
    return childNodes && childNodes.length > 0;
};

