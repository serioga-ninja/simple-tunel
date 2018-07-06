declare module Tunel {
    export module Types {
        export type SocketForvardMessageTypes = 'request' | 'data';
    }

    export module Interfaces {
        export interface ISocketForwardMessage {
            path?: string;
            method?: string;
            headers?: any;
            id: string;
            type: Tunel.Types.SocketForvardMessageTypes;
            data?: any;
        }

        export interface ISockeResponseMessage {
            id: string;
            data: {
                headers: any;
                statusCode: number;
                body: Object | string;
            }
        }
    }
}