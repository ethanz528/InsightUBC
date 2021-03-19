import {Building} from "./Building";
import {Room} from "./Room";

// Req: all building's filepath for rooms must exist in the given file, file must be a valid zip file
// Eff: retrieves the list of rooms from a given building
export let retrieveListOfRooms = function (building: Building, file: string): Promise<Room[]> {
    return Promise.reject("not implemented");
};
