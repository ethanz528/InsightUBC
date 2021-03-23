import {Building} from "./Building";
import {Room} from "./Room";
import {isBuildingValid, retrieveRoomsFileInString} from "./BuildingValidator";
import {atLeastOneExplorableChildNode, loadBuildingListFromFile, stringToJsonTree} from "./BuildingRetriever";
import {setGeoLocationForList} from "./GeoLocate";


export let generateRoomList = function (file: string): Promise<any> {
    return loadBuildingListFromFile(file).
    then((value) => {
        return setGeoLocationForList(value);
    }).
    then((val) => {
        return filterInvalidBuilding(val, file);
    }).
    then((val) => {
        let result: any[] = [];
        for (const building of val) {
            let promOfRoomList = retrieveListOfRooms(building, file);
            result.push(promOfRoomList);
        }
        return Promise.all(result);
    });
};

// Mod: buildingList
// Eff: removes invalid buildings from buildingList and returns the resulting array
export let filterInvalidBuilding = function (buildingList: Building[], file: string): Building[] {
    return buildingList.filter((item) => {
        return isBuildingValid(item, file);
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
export let tbodyRecursiveRetrieval = function (node: any): JSON|boolean {
    const reqName: string = "tbody";
    if (!atLeastOneExplorableChildNode(node.childNodes)) {
        return false;
    } else if (node.nodeName === reqName) {
        return node;
    } else {
        const dfsTodo = node.childNodes;
        for (const todo of dfsTodo) {
            const resultOfTraversal = tbodyRecursiveRetrieval(todo);
            if (resultOfTraversal) {
                return resultOfTraversal;
            }
        }
    }
};

// testing
let numTriedToAssemble = 0;
let assembleListOfRooms = function (tbodyNode: any, building: Building): Room[] {
    numTriedToAssemble++;
    let result: Room[] = [];
    const fullName: string = building.fullName;
    const shortName: string = building.shortName;
    const address: string = building.address;
    const lat: number = building.lat;
    const lon: number = building.lon;
    if (tbodyNode.childNodes !== undefined) {
        for (let node of tbodyNode.childNodes) {
            if (node.name !== undefined && node.nodeName !== "#text") {
                let room: Room = constructRoomFromRow(fullName, shortName, address, lat, lon, node);
                result.push(room);
            }
        }
    }
    return result;
};

let constructRoomFromRow = function (fullname: string, shortName: string, address: string,
                                     lat: number, lon: number, row: any): Room {
    return new Room(fullname, shortName, " ", " ", address, lat, lon, 0, " ", " ",
        " ");
};
