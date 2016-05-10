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
        return this.post('/move/', { name: this._playerName, direction: moveDirection });
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

