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
