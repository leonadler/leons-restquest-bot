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

    public getTileInDirection (direction: 'up' | 'down' | 'left' | 'right'): IMapTile {
        switch (direction) {
            case 'up': return this.getTileAt(this.x, this.y + 1);
            case 'down': return this.getTileAt(this.x, this.y - 1);
            case 'left': return this.getTileAt(this.x - 1, this.y + 1);
            case 'right': return this.getTileAt(this.x + 1, this.y + 1);
        }
        return null;
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

    public toString(): string {
        if (!this.tiles || Object.keys(this.tiles).length == 0) return '';

        let minX = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        Object.keys(this.tiles).forEach(key => {
            let [, x, y] = key.match(/^(-?\d+),(-?\d+)$/).map(el => Number.parseInt(el, 10));
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });

        let lines: string[] = [];
        for (let y = maxY - 1; y >= minY; y--) {
            let currentLine: string[] = [];
            for (let x = minX; x < maxX; x++) {
                let tile = this.getTileAt(x, y);
                if (x === this.x && y === this.y) {
                    currentLine.push(`(${tile.type.charAt(0)})`);
                } else if (tile) {
                    currentLine.push(` ${tile.type.charAt(0)} `);
                } else {
                    currentLine.push(' ? ');
                }
            }
            lines.push(currentLine.join(''));
        }

        return lines.join('\n');
    }
}

