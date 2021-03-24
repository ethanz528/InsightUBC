import {Building} from "./Building";
import {Room} from "./Room";
import {isBuildingValid, retrieveRoomsFileInString} from "./BuildingValidator";
import {atLeastOneExplorableChildNode, stringToJsonTree} from "./BuildingRetriever";


export let filterAndGetRoomList = function (buildingList: Building[], file: string): Promise<any> {
    return returnInvalidIndices(buildingList, file).
    then((val) => {
        return removeInvalidRooms(buildingList, val);
    }).
    then((val) => {
        return listOfRoomsFromBuildingList(val, file);
    }).
    then((val) => {
        return makeSingleListOfRooms(val);
    });
};

// Req: file must contain all filePaths from Buildings in buildingList
// Eff: returns an array signifying invalid building indices in the building list
export let returnInvalidIndices = function (buildingList: Building[], file: string): Promise<boolean[]> {
    let promArray: Array<Promise<boolean>> = [];
    for (let building of buildingList ) {
        let prom = isBuildingValid(building, file);
        promArray.push(prom);
    }
    return Promise.all(promArray);
};

export let removeInvalidRooms = function (buildingList: Building[], invalidIndices: boolean[]): Building[] {
    let index: number = 0;
    return buildingList.filter(() => {
        const result: boolean = invalidIndices[index];
        index++;
        return result;
    });
};

export let listOfRoomsFromBuildingList = function (buildingList: Building[], file: string): Promise<Room[][]> {
    let promArray: any[] = [];
    for (const building of buildingList) {
        let promise = retrieveListOfRooms(building, file);
        promArray.push(promise);
    }
    return Promise.all(promArray);
};

// Eff: returns a single from a list of list of rooms
let makeSingleListOfRooms = function (listOfRoomList: Room[][]): Room[] {
    let result: Room[] = [];
    for (const roomList of listOfRoomList) {
        for (const room of roomList) {
            result.push(room);
        }
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

let assembleListOfRooms = function (tbodyNode: any, building: Building): Room[] {
    let result: Room[] = [];
    const fullName: string = building.fullName;
    const shortName: string = building.shortName;
    const address: string = building.address;
    const lat: number = building.lat;
    const lon: number = building.lon;
    for (let node of tbodyNode.childNodes) {
        if (node.nodeName !== "#text") {
            let room: Room = constructRoomFromRow(fullName, shortName, address, lat, lon, node);
            result.push(room);
        }
    }
    return result;
};

let constructRoomFromRow = function (fullname: string, shortName: string, address: string,
                                     lat: number, lon: number, row: any): Room {
    const roomsHref: string = row.childNodes[1].childNodes[1].attrs[0].value;
    const seatsString: string = row.childNodes[3].childNodes[0].value;
    const seats: number = Number.parseInt(seatsString, 10);
    const furniture: string = row.childNodes[5].childNodes[0].value.trim();
    const type: string = row.childNodes[7].childNodes[0].value.trim();
    const index: number = roomsHref.lastIndexOf("-") + 1;
    const num: string = roomsHref.slice(index);
    const name: string = shortName + " " + num;
    return new Room(fullname, shortName, num, name, address, lat, lon, seats, type, furniture,
        roomsHref);
};
