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

export interface IDiscoverResult {
    foundCastle?: IMapTile,
    foundTreasure?: IMapTile,
    treasureTaken?: IMapTile
}

export type Direction = 'up' | 'down' | 'left' | 'right';

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

    public getTileInDirection (direction: Direction): IMapTile {
        return this.getTileInDirectionOf(this.position.x, this.position.y, direction);
    }

    public getTileInDirectionOf (x: number, y: number, direction: Direction): IMapTile {
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

    public playerMoved (direction: Direction) {
        switch (direction) {
            case 'up': this.y += 1; break;
            case 'down': this.y -= 1; break;
            case 'left': this.x -= 1; break;
            case 'right': this.x += 1; break;
        }
    }

    public discover (view: IMapTile[][]): IDiscoverResult {
        let viewSize = view.length;
        let offset = (viewSize - 1) / 2;

        let result: IDiscoverResult = { };

        for (let y = 0; y < viewSize; y++) {
            for (let x = 0; x < viewSize; x++) {
                let absX = this.x + x - offset;
                let absY = this.y - y + offset;
                let tileData: IMapTile = view[y][x];
                let key = `${absX},${absY}`;
                if (!this.hasSeen(absX, absY)) {
                    this.tiles[key] = new this.mapTileClass(absX, absY, tileData);
                    if (tileData.treasure) {
                        result.foundTreasure = this.tiles[key];
                    } else if (tileData.castle) {
                        result.foundCastle = this.tiles[key];
                    }
                } else if (this.tiles[key].treasure && tileData.treasure !== true) {
                    // Treasure taken by enemy
                    this.tiles[key].treasure = false;
                    result.treasureTaken = this.tiles[key];
                }
            }
        }

        return result;
    }

    public shortestPathTo(x: number, y: number): Direction[] {
        return this.shortestPathBetweenPoints(this.x, this.y, x, y);
    }

    public shortestPathBetweenPoints (
        startX: number, startY: number,
        endX: number, endY: number
        ): Direction[] {

        if (!this.hasSeen(startX, startY)) return null;
        if (!this.hasSeen(endX, endY)) return null;

        let scores = new WeakMap<IMapTile, number>();
        let waysHome = new WeakMap<IMapTile, Direction[]>();
        let tilesToSearch = this.getAllDiscoveredTiles().filter(t => t.type != 'water');

        tilesToSearch.forEach(tile => {
            scores.set(tile, 9999);
            waysHome.set(tile, []);
        });
        scores.set(this.getTileAt(startX, startY), 0);

        // console.log('Calculating shortest path...');

        do {
            // Sort by lowest score
            tilesToSearch.sort( (a, b) => scores.get(a) - scores.get(b));

            let currentTile = <MapTile> tilesToSearch.shift();
            let currentScore = scores.get(currentTile);
            let currentWayHome = waysHome.get(currentTile);

            // console.log(`Looking at tile ${currentTile.x}, ${currentTile.y} (${currentTile.type})`);

            let neighbors = this.getNeighborsOfTile(currentTile).filter(t => t.tile.type != 'water');
            neighbors.forEach(neighbor => {
                let isMountain = (neighbor.tile.type === 'mountain');
                let neighborScore = currentScore + (isMountain ? 2 : 1);
                if (neighborScore < scores.get(neighbor.tile)) {
                    scores.set(neighbor.tile, neighborScore);
                    waysHome.set(neighbor.tile, currentWayHome.concat(
                        neighbor.at
                        // isMountain ? [neighbor.at, neighbor.at] : [neighbor.at]
                    ));
                }
            });

        } while (tilesToSearch.length > 0);

        return waysHome.get(this.getTileAt(endX, endY));
    }

    private oppositeDirectionOf (direction: Direction): Direction {
        switch (direction) {
            case 'up': return 'down';
            case 'down': return 'up';
            case 'left': return 'right';
            case 'right': return 'left';
        }
    }

    public getNeighborsOfTile (tile: MapTile): { at: Direction, tile: IMapTile }[] {
        return this.getNeighborsOfPosition(tile.x, tile.y);
    }

    public getNeighborsOfPosition (tileX: number, tileY: number): { at: Direction, tile: IMapTile }[] {
        return <{ at: Direction, tile: IMapTile }[]> ([
            { at: 'up', tile: this.getTileAt(tileX, tileY + 1) },
            { at: 'down', tile: this.getTileAt(tileX, tileY - 1) },
            { at: 'left', tile: this.getTileAt(tileX - 1, tileY) },
            { at: 'right', tile: this.getTileAt(tileX + 1, tileY) }
        ].filter(t => t.tile != null));
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
                } else if (tile && tile.castle) {
                    currentLine.push(' C ');
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

