import {loadBuildingListFromFile} from "./BuildingRetriever";
import {setGeoLocationForList} from "./GeoLocate";
import {filterAndGetRoomList} from "./RoomRetriever";

export let generateRoomList = function (file: string): Promise<any> {
    return loadBuildingListFromFile(file).
    then((value) => {
        return setGeoLocationForList(value);
    }).
    then((value) => {
        return filterAndGetRoomList(value, file);
    });
};
