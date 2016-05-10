interface IGameOverResponse {
    game: 'over',
    result: 'won' | 'lost' | 'draw'
}

interface IErrorResponse {
    error: string
}

interface IViewResponse {
    view: {
        type: 'grass' | 'mountain' | 'water',
        castle?: string,
        treasure?: boolean
    }[][];
    treasure: boolean;
}

type IResponse = IGameOverResponse | IErrorResponse | IViewResponse;

function isGameOverResponse(response: IResponse): response is IGameOverResponse {
    return (<IGameOverResponse> response).game !== undefined;
}

function isErrorResponse(response: IResponse): response is IErrorResponse {
    return (<IErrorResponse> response).error !== undefined;
}

function isViewResponse(response: IResponse): response is IViewResponse {
    return (<IViewResponse> response).view !== undefined;
}
