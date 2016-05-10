import { BotBase } from './bot-base';
import { MapTile, GameMap } from './map';

type Direction = 'up' | 'down' | 'left' | 'right';

export class Bot extends BotBase {
    protected map: GameMap;

    constructor (client: any) {
        super(client);
    }

    protected nextMove (): Direction {

        // TODO: Implement this method

        let rnd = Math.random() * 4 | 0;
        switch (rnd) {
            case 0: return 'up';
            case 1: return 'down';
            case 2: return 'left';
            default: return 'right';
        }
    }

    protected hasPickedUpTreasure(): void {

        // TODO: Implement this method

    }
}
