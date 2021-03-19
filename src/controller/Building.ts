export class Building {

    public fullName: string;
    public shortName: string;
    public address: string;
    public filePath: string;
    public lat: number;
    public lon: number;
    public roomsNode: any;


    constructor(fullName: string, shortName: string, address: string, filePath: string) {
        this.fullName = fullName;
        this.shortName = shortName;
        this.address = address;
        this.filePath = filePath;
        this.lat = -1;
        this.lon = -1;
        this.roomsNode = -1;
    }
}
