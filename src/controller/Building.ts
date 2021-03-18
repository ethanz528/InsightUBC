import * as http from "http";
export class Building {

    public fullName: string;
    public shortName: string;
    public address: string;
    public filePath: string;
    public lat: number;
    public lon: number;
    public roomNode: any;


    constructor(fullName: string, shortName: string, address: string, filePath: string) {
        this.fullName = fullName;
        this.shortName = shortName;
        this.address = address;
        this.filePath = filePath;
        this.lat = -1;
        this.lon = -1;
        this.roomNode = -1;
    }

    public setLatAndLon() {
        const h = require("http");
        const latAndLon = h.get();
    }
}
