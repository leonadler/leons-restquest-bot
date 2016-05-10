export interface IMapTile {
    type: 'grass' | 'mountain' | 'water',
    castle?: string,
    treasure?: boolean
}

export interface TileImplementation {
    new(tile: IMapTile): IMapTile;
}

export class MapTile implements IMapTile {
    private _type: 'grass' | 'mountain' | 'water';
    private _castle: string;
    private _treasure: boolean;

    constructor(data: {
            type: 'grass' | 'mountain' | 'water',
            castle?: string,
            treasure?: boolean
        }) {

        this._type = data.type;
        this._castle = data.castle;
        this._treasure = data.treasure;
    }

    get type() { return this._type; }
    get castle() { return this._castle; }
    get treasure() { return this._treasure; }
}

export class GameMap {
    protected tiles: { [k: string]: IMapTile } = {};
    private x: number = 0;
    private y: number = 0;

    public constructor (private mapTileClass: TileImplementation = MapTile) {
    }

    get position():  { x: number, y: number } {
        return { x: this.x, y: this.y };
    }

    public hasSeen (x: number, y: number): boolean {
        return this.tiles[x + ',' + y] !== undefined;
    }

    public getTileAt (x: number, y: number): IMapTile {
        return this.tiles[x + ',' + y];
    }

    public getAllDiscoveredTiles(): ArrayLike<IMapTile> {
        let list: IMapTile[] = Object.keys(this.tiles).map(key => this.tiles[key]);
        return list;
    }

    public playerMoved (direction: 'up' | 'down' | 'left' | 'right') {
        switch (direction) {
            case 'up': this.y += 1; break;
            case 'down': this.y -= 1; break;
            case 'left': this.x -= 1; break;
            case 'right': this.x += 1; break;
        }
    }

    public discover (view: IMapTile[][]): void {
        let viewSize = view.length;
        let offset = (viewSize - 1) / 2;

        for (let y = 0; y < viewSize; y++) {
            for (let x = 0; x < viewSize; x++) {
                if (!this.hasSeen(this.x + x - offset, this.y - y + offset)) {
                    this.tiles[x + ',' + y] = new this.mapTileClass(view[y][x]);
                }
            }
        }
    }
}

