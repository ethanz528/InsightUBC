import {Building} from "./Building";
import * as JSZip from "jszip";
import {atLeastOneExplorableChildNode, containsValue, stringToJsonTree} from "./BuildingRetriever";

// Req: Building must have it's lat and lon set already
// Eff: returns true if building is valid, false otherwise
export let isBuildingValid = function (building: Building, file: string): Promise<boolean> {
    return wasAbleToGeoLocateBuilding(building).
    then((val) => {
        if (val) {
            return buildingContainsRoomInfo(building, file);
        } else {
            return false;
        }
    });
};

// Req: Building must have it's lat and lon set
// Eff: returns true if building contains lat and lon, false otherwise
let wasAbleToGeoLocateBuilding = function (building: Building): Promise<boolean> {
    if (building.lat && building.lon) {
        return Promise.resolve(true);
    } else {
        return Promise.resolve(false);
    }
};

// Req: building's file path field must be a valid address in file, file must be a valid zip file
// Eff: return true if building's file path contains room information, false otherwise
let buildingContainsRoomInfo = function (building: Building, file: string): Promise<boolean> {
    return retrieveRoomsFileInString(file, building.filePath).
    then((val) => {
        return stringToJsonTree(val);
    }).
    then((val) => {
        return containsRoomInfo(val);
    });
};

// helper
export let retrieveRoomsFileInString = function (file: string, path: string): Promise<string> {
    let zip = new JSZip();
    return zip.loadAsync(file, {base64: true}).
    then((zipObj): Promise<string> => {
            return zipObj.folder("rooms").file(path).async("string");
    });
};

// helper
let containsRoomInfo = function (treeNode: any): boolean {
    const reqName: string = "table";
    let resultArray: boolean[] = [];
    if (!atLeastOneExplorableChildNode(treeNode.childNodes)) {
        return false;
    } else if (treeNode.nodeName === reqName) {
        return true;
    } else {
        const dfsTodo = treeNode.childNodes;
        for (const todo of dfsTodo) {
            let resultOfSearch: boolean = containsRoomInfo(todo);
            resultArray.push(resultOfSearch);
        }
        return containsValue(resultArray, true);
    }
};

