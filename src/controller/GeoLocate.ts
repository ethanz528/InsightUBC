import * as http from "http";
import {Building} from "./Building";

// Mod: building
// Eff: returns a building object with values assigned to the lat and lon fields through async call to http.get
export let setBuildingGeoLocation = function (building: Building): Promise<Building> {
    const webAddress: string = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team246/";
    const fullAddress: string = webAddress.concat(building.address);
    return new Promise<Building>((resolve, reject) => {
        http.get(fullAddress, (res) => {
            res.setEncoding("utf8");
            let data: string = " ";
            res.on("data", (value) => {
                data += value;
            });
            res.on("end", () => {
                try {
                    const parsedData = JSON.parse(data);
                    building.lat = parsedData.lat;
                    building.lon = parsedData.lon;
                    resolve(building);
                } catch (e) {
                    reject(e);
                }
            });
        });
    });
};

