import request = require('request');

export interface IGameOverResponse {
    game: 'over',
    result: 'won' | 'lost' | 'draw'
}

export interface IErrorResponse {
    error: string
}

export interface IViewResponse {
    view: {
        type: 'grass' | 'mountain' | 'water',
        castle?: string,
        treasure?: boolean
    }[][];
    treasure: boolean;
}

export type IResponse = IGameOverResponse | IErrorResponse | IViewResponse;

export function isGameOverResponse(response: IResponse): response is IGameOverResponse {
    return (<IGameOverResponse> response).game !== undefined;
}

export function isErrorResponse(response: IResponse): response is IErrorResponse {
    return (<IErrorResponse> response).error !== undefined;
}

export function isViewResponse(response: IResponse): response is IViewResponse {
    return (<IViewResponse> response).view !== undefined;
}

export class RestClient {
    private _urlBase: string;
    private _playerName: string;

    constructor(urlBase: string, playerName: string) {
        this._urlBase = urlBase;
        this._playerName = playerName;
    }

    public get playerName(): string { return this._playerName; }

    public register(): Promise<IViewResponse> {
        return this.post('/register/', { name: this._playerName });
    }

    public move(moveDirection: 'up' | 'down' | 'left' | 'right'): Promise<IViewResponse | IGameOverResponse> {
        return this.post('/move/', { player: this._playerName, direction: moveDirection });
    }

    public reset(): Promise<void> {
        let calledFrom: string = new Error().stack.match(/^.+?\n.+?\n\s+at ([^\n]+)/)[1];
        console.warn(`Use RestClient.reset() only for testing!\n${calledFrom}`);
        return this.post('/reset/', {}).then(() => {});
    }

    private post(relativeUrl: string, data: { [key: string]: string }): Promise<IGameOverResponse | IViewResponse> {
        return new Promise( (success, fail) => {
            request({
                uri: `${this._urlBase}${relativeUrl}`,
                method: 'POST',
                form: data
            }, (error: Error, response: any, body: string) => {
                if (error) {
                    return fail(error);
                } else if (/^Error: /.test(body)) {
                    return fail(new Error(`Server returned "${body}".`));
                }
                try {
                    let response: IResponse = JSON.parse(body);
                    if (isErrorResponse(response)) {
                        return fail(new Error(`/register/ failed with error "${response.error}"`));
                    }
                    return success(response);
                } catch (err) {
                    return fail(err);
                }
            });
        });
    }
}

