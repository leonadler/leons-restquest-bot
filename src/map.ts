export interface IMapTile {
    type: 'grass' | 'forest' | 'mountain' | 'water',
    castle?: string,
    treasure?: boolean
}

export interface TileImplementation {
    new(x: number, y: number, tile: IMapTile): MapTile;
}

export class MapTile implements IMapTile {
    private _type: 'grass' | 'forest' | 'mountain' | 'water';
    private _castle: string;
    private _treasure: boolean;
    private _x: number;
    private _y: number;

    constructor(
        x: number,
        y: number,
        data: {
            type: 'grass' | 'forest' | 'mountain' | 'water',
            castle?: string,
            treasure?: boolean
        }) {

        this._x = x;
        this._y = y;
        this._type = data.type;
        this._castle = data.castle;
        this._treasure = data.treasure;
    }

    get type() { return this._type; }
    get castle() { return this._castle; }
    get treasure() { return this._treasure; }
    set treasure(val: boolean) { this._treasure = val; }
    get x() { return this._x; }
    get y() { return this._y; }
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
        return this.tiles[`${x},${y}`] !== undefined;
    }

    public getTileAt (x: number, y: number): IMapTile {
        return this.tiles[`${x},${y}`];
    }

    public getTileInDirection (direction: 'up' | 'down' | 'left' | 'right'): IMapTile {
        return this.getTileInDirectionOf(this.position.x, this.position.y, direction);
    }

    public getTileInDirectionOf (x: number, y: number, direction: 'up' | 'down' | 'left' | 'right'): IMapTile {
        switch (direction) {
            case 'up': return this.getTileAt(x, y + 1);
            case 'down': return this.getTileAt(x, y - 1);
            case 'left': return this.getTileAt(x - 1, y);
            case 'right': return this.getTileAt(x + 1, y);
        }
        return null;
    }

    public getAllDiscoveredTiles(): IMapTile[] {
        return Object.keys(this.tiles).map(key => this.tiles[key]);
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
                let absX = this.x + x - offset;
                let absY = this.y - y + offset;
                let tileData: IMapTile = view[y][x];
                let key = `${absX},${absY}`;
                if (!this.hasSeen(absX, absY)) {
                    this.tiles[key] = new this.mapTileClass(absX, absY, tileData);
                } else if (this.tiles[key].treasure && tileData.treasure !== true) {
                    // Treasure taken by enemy
                    this.tiles[key].treasure = false;
                }
            }
        }
    }

    public shortestPathBetweenPoints (
        startX: number, startY: number,
        endX: number, endY: number
        ) : ('up' | 'down' | 'left' | 'right')[] {

        // TODO
        return null;
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
        for (let y = maxY; y >= minY; y--) {
            let currentLine: string[] = [];
            for (let x = minX; x <= maxX; x++) {
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

