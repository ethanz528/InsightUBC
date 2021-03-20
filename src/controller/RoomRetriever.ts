import {Building} from "./Building";
import {Room} from "./Room";
import {isBuildingValid, retrieveRoomsFileInString} from "./BuildingValidator";
import {atLeastOneExplorableChildNode, keepOnlyRowElements, stringToJsonTree} from "./BuildingRetriever";

// Req: file must be a valid zip file
// Eff: returns a list of rooms from a list of buildings and the zip file where their room data resides
export let returnListOfRooms = function (buildingList: Building[], file: string): Promise<Room[]> {
    return retrieveRoomsFromBuildingList(buildingList, file).
    then((val) => {
        return makeSingleListOfRooms(val);
    });
};

// Eff: returns a single from a list of list of rooms
let makeSingleListOfRooms = function (listOfRoomList: Room[][]): Room[] {
    let result: Room[] = [];
    for (const roomList of listOfRoomList) {
        result.concat(roomList);
    }
    return result;
};

// Req: file must be a valid zip file
// Eff: returns a combined list of rooms from all valid buildings
export let retrieveRoomsFromBuildingList = function (buildingList: Building[], file: string): Promise<Room[][]> {
    let result = [];
    for (const building of buildingList) {
        if (isBuildingValid(building, file)) {
            const value: Promise<Room[]> = retrieveListOfRooms(building, file);
            result.push(value);
        }
    }
    return Promise.all(result);
};

// Req: all building's filepath for rooms must exist in the given file, file must be a valid zip file
// Eff: retrieves the list of rooms from a given building
export let retrieveListOfRooms = function (building: Building, file: string): Promise<Room[]> {
    return retrieveRoomsFileInString(file, building.filePath).
    then((val) => {
        return stringToJsonTree(val);
    }).
    then((val) => {
        return tbodyRecursiveRetrieval(val);
    }).
    then((val) => {
        return assembleListOfRooms(val, building);
    });
};

// helper
// Req: node must contain tbody some where in its tree structure
let tbodyRecursiveRetrieval = function (node: any): JSON|boolean {
    const reqName: string = "tbody";
    let tbody;
    if (!atLeastOneExplorableChildNode(node.childNodes)) {
        return false;
    } else if (node.nodeName === reqName) {
        tbody = node;
    } else {
        const dfsTodo = node.childNodes;
        for (const todo of dfsTodo) {
            const resultOfTraversal = tbodyRecursiveRetrieval(todo);
            if (resultOfTraversal) {
                tbody = resultOfTraversal;
            }
        }
    }
    return tbody;
};

let assembleListOfRooms = function (tbodyNode: any, building: Building): Room[] {
    let result: Room[] = [];
    const fullName: string = building.fullName;
    const shortName: string = building.shortName;
    const address: string = building.address;
    const lat: number = building.lat;
    const lon: number = building.lon;
    const onlyRows = keepOnlyRowElements(tbodyNode);
    for (const row of onlyRows) {
        const room: Room = constructRoomFromRow(fullName, shortName, address, lat, lon, row);
        result.push(room);
    }
    return result;
};

let constructRoomFromRow = function (fullname: string, shortName: string, address: string,
                                     lat: number, lon: number, row: any): Room {
    return new Room(fullname, shortName, " ", " ", address, lat, lon, 0, " ", " ",
        " ");
};
