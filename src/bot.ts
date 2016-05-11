import { BotBase } from './bot-base';
import { MapTile, GameMap } from './map';

type Direction = 'up' | 'down' | 'left' | 'right';

class WeightedTile extends MapTile {
    public weight = 0;
    public timesPassed = 0;
    public wayHome: Direction = null;
    public wayHomeMountain: boolean = false;
    public shortestHomeDistance: number = null;
}

export class Bot extends BotBase {
    protected map: GameMap;
    private climbingMountain: Direction = null;
    private routeHome: Direction[] = [];

    constructor (client: any) {
        super(client, new GameMap(WeightedTile));
    }

    protected nextMove (): Direction {

        if (this.climbingMountain) {
            console.log('Climbing mountain ', this.climbingMountain);
            this.map.playerMoved(this.climbingMountain);
            let direction = this.climbingMountain;
            this.climbingMountain = null;
            return direction;
        }

        if (this.hasTreasure) {
            console.log('Trying to bring the treasure home...');
            if (this.routeHome.length > 0) {
                return this.routeHome.pop();
            }
        } else {
            this.weightAllTiles();
            this.weighCurrentNeighbors();

            console.info('=== weighed ===');
            // console.info(this.visualize());
            console.info(this.map.toString());

            let neighborTiles: {at: Direction, tile: WeightedTile}[] = <any>[
                { at: 'up', tile: this.map.getTileInDirection('up') },
                { at: 'down', tile: this.map.getTileInDirection('down') },
                { at: 'left', tile: this.map.getTileInDirection('left') },
                { at: 'right', tile: this.map.getTileInDirection('right') }
            ];

            neighborTiles.sort(
                (a, b) => b.tile.weight - a.tile.weight
            );
            let bestNeighbor = neighborTiles[0];
            bestNeighbor.tile.timesPassed += 1;

            if (bestNeighbor.tile.type === 'mountain') {
                this.climbingMountain = bestNeighbor.at;
            } else {
                this.map.playerMoved(bestNeighbor.at);
            }

            let prettyTiles = neighborTiles.map( (t: any) => [t.at, t.tile.weight]);
            console.info('Neighbor tiles: ', prettyTiles, ', going ', bestNeighbor.at);

            return bestNeighbor.at;
        }

        console.info('out of ideas!');

        let rnd = Math.random() * 4 | 0;
        switch (rnd) {
            case 0: return 'up';
            case 1: return 'down';
            case 2: return 'left';
            default: return 'right';
        }
    }

    private weightAllTiles () {
        this.map.getAllDiscoveredTiles().forEach(
            (tile: WeightedTile) => this.weightTile(tile)
        );
    }

    private weightTile (tile: WeightedTile) {
        if (!tile) return;

        if (tile.castle && tile.castle != this.playerName) {
            console.info('enemy castle found');
            tile.weight = -100; return;
        }

        let radius: number;

        switch (tile.type) {
            case 'water': tile.weight = -999; return;
            case 'grass': radius = 5; break;
            case 'mountain': radius = 7; break;
            case 'forest': radius = 3; break;
        }

        tile.weight = (radius * radius) - this.numDiscoveredTilesAround(tile.x, tile.y, radius);
        if (tile.type === 'mountain') {
            // Mountains need 2 steps to climb, so they are less important
            tile.weight = tile.weight / 2;
        }

        if (tile.treasure) {
            // Handle treasure
            tile.weight += 200;
        } else {
            tile.weight *= ( 2 - Math.pow(1.3, tile.timesPassed) );
            tile.weight -= tile.timesPassed * 0.5 * radius;
        }
    }

    private weighCurrentNeighbors() {
        let x = this.map.position.x;
        let y = this.map.position.y;
        this.weighTilesAroundCurrent(neighbor => {
            let neighborWeightSum = 0;
            let neighborWeightCount = 0;
            this.tilesAroundTile(neighbor.x, neighbor.y).forEach(tile => {
                if ( (tile.x - x > 1 || tile.x - x < -1 ) &&
                     (tile.y - y > 1 || tile.y - y < -1 ) ) {
                    neighborWeightSum += tile.weight;
                    neighborWeightCount += 1;
                }
            });
            neighbor.weight += neighborWeightSum / (neighborWeightCount + 1);
        });
    }

    private numDiscoveredTilesAround (tileX: number, tileY: number, radius: number): number {
        let offset = (radius - 1) / 2;
        let seen = 0;
        for (let y = 0; y < radius; y++) {
            for (let x = 0; x < radius; x++) {
                if (this.map.hasSeen(tileX + x - offset, tileY - y + offset)) {
                    seen += 1;
                }
            }
        }
        return seen;
    }

    private tilesAroundTile (tileX: number, tileY: number): WeightedTile[] {
        let tiles: WeightedTile[] = [];
        for (let y = -1; y <= 1; y++) {
            for (let x = -1; x <= 1; x++) {
                if (y != 0 || x != 0) {
                    let tile = this.map.getTileAt(tileX + x, tileY + y);
                    if (tile) {
                        tiles.push(<WeightedTile> tile);
                    }
                }
            }
        }
        return tiles;
    }

    private weighTilesAroundCurrent (weighCallback: (t: WeightedTile) => void): void {
        this.tilesAroundTile(this.map.position.x, this.map.position.y).forEach(
            tile => weighCallback(tile)
        );
    }

    protected pickedUpTreasure (): void {
        console.info(`Bot ${this.playerName} has picked up a treasure!`);
        this.calculateFastesRouteHome();
    }

    private tilesNextToTile (tileX: number, tileY: number): { at: Direction, tile: WeightedTile }[] {
        return <{ at: Direction, tile: WeightedTile }[]>([
            { at: 'up', tile: <WeightedTile> this.map.getTileAt(tileX, tileY + 1) },
            { at: 'down', tile: <WeightedTile> this.map.getTileAt(tileX, tileY - 1) },
            { at: 'left', tile: <WeightedTile> this.map.getTileAt(tileX - 1, tileY) },
            { at: 'right', tile: <WeightedTile> this.map.getTileAt(tileX + 1, tileY) }
        ].filter(t => t.tile != null));
    }

    private calculateFastesRouteHome(): void {
        console.log('Calculating fastest way home...');

        let remainingTiles = <WeightedTile[]> this.map.getAllDiscoveredTiles();
        remainingTiles.forEach(tile => tile.shortestHomeDistance = 9999);

        let homeTile = <WeightedTile> this.map.getTileAt(this.map.position.x, this.map.position.y);
        homeTile.shortestHomeDistance = 0;

        do {
            // Find the tile closest to home
            remainingTiles.sort( (a, b) => a.shortestHomeDistance - b.shortestHomeDistance );

            let tileToWork = remainingTiles.shift();
            let workDistance = tileToWork.shortestHomeDistance;

            console.info(`Calculating... ${remainingTiles.length} remaining, work distance ${workDistance}`);

            let neighbors = this.tilesNextToTile(tileToWork.x, tileToWork.y);
            neighbors.forEach(neighbor => {
                let mountain = (neighbor.tile.type === 'mountain');
                let neighborDistance = workDistance + (mountain ? 2 : 1);
                if (neighborDistance < neighbor.tile.shortestHomeDistance) {
                    neighbor.tile.shortestHomeDistance = neighborDistance;
                    neighbor.tile.wayHomeMountain = mountain;
                    neighbor.tile.wayHome = this.oppositeDirectionOf(neighbor.at);
                }
            });
        } while (remainingTiles.length > 0);

        // Create the path home for the current tile
        let routeHome = this.routeHome = <Direction[]> [];
        let current = <WeightedTile> this.map.getTileAt(this.map.position.x, this.map.position.y);

        while (current && current.wayHome) {
            let nextTile = <WeightedTile> this.map.getTileInDirectionOf(current.x, current.y, current.wayHome);
            if (nextTile.type == 'mountain') {
                routeHome.unshift(current.wayHome);
            }
            routeHome.unshift(current.wayHome);
            current = nextTile;
        }

        console.info('Fastest way home: ', routeHome);
    }

    private oppositeDirectionOf (direction: Direction): Direction {
        switch (direction) {
            case 'up': return 'down';
            case 'down': return 'up';
            case 'left': return 'right';
            case 'right': return 'left';
        }
    }

    private visualize (): string {
        let minX = Number.POSITIVE_INFINITY;
        let maxX = Number.NEGATIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY;
        let maxY = Number.NEGATIVE_INFINITY;

        this.map.getAllDiscoveredTiles().forEach( (tile: WeightedTile) => {
            let {x, y} = tile;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        });

        let lines: string[] = [];
        for (let y = maxY; y >= minY; y--) {
            let currentLine: string[] = [];
            for (let x = minX; x <= maxX; x++) {
                let tile = <WeightedTile> this.map.getTileAt(x, y);
                if (x === this.map.position.x && y === this.map.position.y) {
                    currentLine.push(`(${tile.type.charAt(0)}[${('    ' + tile.weight).substr(-4)}]})`);
                } else if (tile) {
                    currentLine.push(` ${tile.type.charAt(0)}[${('    ' + tile.weight).substr(-4)}] `);
                } else {
                    currentLine.push(' ?[????] ');
                }
            }
            lines.push(currentLine.join(''));
        }

        return lines.join('\n');
    }
}
