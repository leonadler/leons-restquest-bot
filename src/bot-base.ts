import { RestClient, IGameOverResponse, IViewResponse, isViewResponse, isGameOverResponse } from './rest-client';
import { MapTile, GameMap, IDiscoverResult, Direction } from './map';

// Debug timer too see whats going on
const timeout = 0;

export class BotBase {
    protected map: GameMap;
    private _client: RestClient;
    private _hasTreasure = false;
    private _wasMountain = false;

    constructor (client: RestClient, map: GameMap = new GameMap()) {
        if (this.constructor === BotBase) {
            throw new Error('Derive from BotBase in your own class.');
        }
        this._client = client;
        this.map = map;
    }

    public get playerName (): string { return this._client.playerName; }
    public get hasTreasure (): boolean { return this._hasTreasure; }

    public startGame (): void {
        this._client.register()
        .then(response => {
            console.info(`${this.constructor.name}.startGame(): got response`);
            this._hasTreasure = response.treasure;
            this.processViewResponse(response);

            if (timeout) {
                setTimeout(() => this.sendNextMove(), timeout);
            } else {
                this.sendNextMove();
            }
        })
        .catch(err => console.error(`Error "${err.message}" in startGame()`));
    }

    private processViewResponse(response: IViewResponse) {
        const result: IDiscoverResult = this.map.discover(response.view);
        if (result.foundTreasure) {
            this.foundTreasure(<MapTile> result.foundTreasure);
        }

        if (result.treasureTaken) {
            if (response.treasure && !this._hasTreasure) {
                this._hasTreasure = true;
                this.pickedUpTreasure(<MapTile> result.treasureTaken);
            } else {
                this.treasureTakenByEnemy(<MapTile> result.treasureTaken);
            }
        } else if (response.treasure && !this._hasTreasure) {
            this._hasTreasure = true;
            this.pickedUpTreasure(null);
        }

        if (result.foundCastle) {
            if (result.foundCastle.castle == this.playerName) {
                this.foundOwnCastle(<MapTile> result.foundCastle);
            } else {
                this.foundEnemyCastle(<MapTile> result.foundCastle);
            }
        }
    }

    private sendNextMove () {
        let nextMove: Direction;
        try {
            nextMove = this.nextMove();
            if (nextMove !== 'up' && nextMove !== 'down' && nextMove !== 'left' && nextMove !== 'right') {
                throw Error(`Invalid move ${JSON.stringify(nextMove)} returned by ${this.constructor.name}.nextMove()`);
            }
        } catch (err) {
            console.error(`Error in ${this.constructor.name}.sendNextMove(): `, err);
        }

        // if (this._wasMountain) {
        //     this.map.playerMoved(nextMove);
        //     this._wasMountain = false;
        // } else {
        //     let mountain = this.map.getTileInDirection(nextMove);
        //     if (mountain) {
        //         this._wasMountain = true;
        //     } else {
        //         this._wasMountain = false;
        //         this.map.playerMoved(nextMove);
        //     }
        // }

        this._client.move(nextMove)
        .then(response => {
            if (isGameOverResponse(response)) {
                switch (response.result) {
                    case 'won': this.gameWon(); break;
                    case 'lost': this.gameLost(); break;
                    case 'draw': this.gameDraw(); break;
                }
                // this._client.reset();
            } else {
                this.processViewResponse(response);

                if (timeout) {
                    setTimeout(() => this.sendNextMove(), timeout);
                } else {
                    this.sendNextMove();
                }
            }
        })
        .catch(err => console.error(`Error "${err.message}" in sendNextMove()`));
    }

    protected foundTreasure(tile: MapTile): void {
        // Can be implemented in derived class
    }

    protected pickedUpTreasure(tile: MapTile): void {
        // Can be implemented in derived class
    }

    protected treasureTakenByEnemy(tile: MapTile): void {
        // Can be implemented in derived class
    }

    protected foundOwnCastle(tile: MapTile): void {
        // Can be implemented in derived class
    }

    protected foundEnemyCastle(tile: MapTile): void {
        // Can be implemented in derived class
    }

    protected nextMove (): Direction {
        console.error(`Implement ${this.constructor.name}.nextMove()!`);
        throw new Error('Not implemented.');
    }

    protected gameWon (): void {
        console.info(`GAME WON by ${this.playerName}!`);
    }

    protected gameLost (): void {
        console.info('GAME LOST!');
    }

    protected gameDraw (): void {
        console.info('DRAW!');
    }
}
