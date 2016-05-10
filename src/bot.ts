import { RestClient, IGameOverResponse, IViewResponse, isViewResponse, isGameOverResponse } from './rest-client';
import { MapTile, GameMap } from './map';

export class Bot {
    protected map: GameMap;
    private _client: RestClient;
    private _foundTreasure = false;

    constructor (client: RestClient, map: GameMap = new GameMap()) {
        if (this.constructor === Bot) {
            throw new Error('Derive from Bot in your own class.');
        }
        this._client = client;
        this.map = map;
    }

    public get name (): string {
        return this._client.playerName;
    }

    public startGame (): void {
        this._client.register()
        .then(response => {
            console.info(`${this.constructor.name}.startGame(): got response`);
            this._foundTreasure = response.treasure;
            this.map.discover(response.view);
            this.sendNextMove();
        })
        .catch(err => console.error(`Error ${err.message} in startGame()`));
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
            }
        })
        .catch(err => console.error(`Error ${err.message} in sendNextMove()`));
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
