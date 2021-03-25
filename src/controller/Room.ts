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

    constructor(fullname: string, shortname: string, num: string, name: string, address: string, lat: number,
                lon: number, seats: number, type: string, furniture: string, href: string) {
        this.fullname = fullname;
        this.shortname = shortname;
        this.number = num;
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
        dict[id + "_fullname"] = this.fullname;
        dict[id + "_shortname"] = this.shortname;
        dict[id + "_number"] = this.number;
        dict[id + "_name"] = this.name;
        dict[id + "_address"] = this.address;
        dict[id + "_lat"] = this.lat;
        dict[id + "_lon"] = this.lon;
        dict[id + "_seats"] = this.seats;
        dict[id + "_type"] = this.type;
        dict[id + "_furniture"] = this.furniture;
        dict[id + "_href"] = this.href;
        return dict;
    }
}
