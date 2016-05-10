export interface ITile {
    type: 'grass' | 'mountain' | 'water',
    castle?: string,
    treasure?: boolean
}

export class MapTile implements ITile {
    private _type: 'grass' | 'mountain' | 'water';
    private _castle: string;
    private _treasure: boolean;

    static fromJSON(tile: ITile): MapTile {
        return new MapTile(tile);
    }

    constructor(data: ITile) {
        this._type = data.type;
        this._castle = data.castle;
        this._treasure = data.treasure;
    }

    get type() { return this._type; }
    get castle() { return this._castle; }
    get treasure() { return this._treasure; }
}

export class GameMap {
    private tiles: { [k: string]: MapTile } = {};
    private x: number = 0;
    private y: number = 0;

    public constructor () {
    }

    get position():  { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    public hasSeen (x: number, y: number): boolean {
        return this.tiles[x + ',' + y] !== undefined;
    }

    public discover (position: { x: number, y: number }, view: ITile[][]): void {
        let viewSize = view.length;
        let offset = (viewSize - 1) / 2;

        for (let y = 0; y < viewSize; y++) {
            for (let x = 0; x < viewSize; x++) {
                if (!this.hasSeen(x - offset, y - offset)) {
                    this.tiles[x + ',' + y] = MapTile.fromJSON(view[y][x]);
                }
            }
        }
    }
}

