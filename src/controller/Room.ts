export class Room {

    public fullname: string;
    public shortname: string;
    public number: string;
    public name: string;
    public address: string;
    public lat: number;
    public lon: number;
    public seats: number;
    public type: string;
    public furniture: string;
    public href: string;

    constructor(fullname: string, shortname: string, nnumber: string, name: string, address: string, lat: number,
                lon: number, seats: number, type: string, furniture: string, href: string) {
        this.fullname = fullname;
        this.shortname = shortname;
        this.number = nnumber;
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.lon = lon;
        this.seats = seats;
        this.type = type;
        this.furniture = furniture;
        this.href = href;
    }

    public makeDict(id: string) {
        let dict: { [id: string]: string | number } = {};
        dict[id + "_dept"] = this.fullname;
        dict[id + "_id"] = this.shortname;
        dict[id + "_avg"] = this.number;
        dict[id + "_instructor"] = this.name;
        dict[id + "_title"] = this.address;
        dict[id + "_pass"] = this.lat;
        dict[id + "_fail"] = this.lon;
        dict[id + "_audit"] = this.seats;
        dict[id + "_uuid"] = this.type;
        dict[id + "_year"] = this.furniture;
        dict[id + "_year"] = this.href;
        return dict;
    }
}
