import { RestClient, IGameOverResponse, IViewResponse, isViewResponse, isGameOverResponse } from './rest-client';
import { MapTile, GameMap } from './map';

export class BotBase {
    protected map: GameMap;
    private _client: RestClient;
    private _pickedUpTreasure = false;

    constructor (client: RestClient, map: GameMap = new GameMap()) {
        if (this.constructor === BotBase) {
            throw new Error('Derive from BotBase in your own class.');
        }
        this._client = client;
        this.map = map;
    }

    public get name (): string { return this._client.playerName; }
    public get pickedUpTreasure (): boolean { return this._pickedUpTreasure; }

    public startGame (): void {
        this._client.register()
        .then(response => {
            console.info(`${this.constructor.name}.startGame(): got response`);
            this._pickedUpTreasure = response.treasure;
            this.map.discover(response.view);
            this.sendNextMove();
        })
        .catch(err => console.error(`Error "${err.message}" in startGame()`));
    }

    private sendNextMove () {
        let nextMove = this.nextMove();
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
                this.map.discover(response.view);
                if (response.treasure && !this._pickedUpTreasure) {
                    this._pickedUpTreasure = true;
                    this.hasPickedUpTreasure();
                }
                this.sendNextMove();
            }
        })
        .catch(err => console.error(`Error "${err.message}" in sendNextMove()`));
    }

    protected hasPickedUpTreasure(): void {
        // Can be implemented in derived class
    }

    protected nextMove (): 'up' | 'down' | 'left' | 'right' {
        console.error(`Implement ${this.constructor.name}.nextMove()!`);
        throw new Error('Not implemented.');
    }

    protected gameWon (): void {
        console.info(`GAME WON by ${this.name}!`);
    }

    protected gameLost (): void {
        console.info('GAME LOST!');
    }

    protected gameDraw (): void {
        console.info('DRAW!');
    }
}
