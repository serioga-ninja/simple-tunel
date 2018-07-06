/// <reference path="./index.d.ts" />

import * as http from 'http';
import * as net from 'net';
import { Socket } from 'net';
import * as uuid from 'uuid';

interface IRequestsData {
    request: http.IncomingMessage;
    response: http.ServerResponse;
}

class TunelServer {

    private reqeustId: number;
    private activeConnections: { [key: string]: IRequestsData };

    constructor(private socket: Socket) {
        this.reqeustId = 0;
        this.activeConnections = {};
    }

    /**
     * 
     * @param client_req 
     * @param client_res 
     */
    public onRequest(client_req: http.IncomingMessage, client_res: http.ServerResponse) {
        let requestId = uuid.v4();
        const data: Tunel.Interfaces.ISocketForwardMessage = {
            path: client_req.url,
            method: client_req.method,
            headers: client_req.headers,
            id: requestId,
            type: 'request'
        };

        this.activeConnections[this.reqeustId] = {
            request: client_req,
            response: client_res,
        };

        client_req.on('data', (data) => {
            this.socket.write(`${JSON.stringify({
                id: requestId,
                type: 'data',
                data: data.toString()
            })}\r\n`);
        });

        this.socket.write(`${JSON.stringify(data)}\r\n`);
    }

    public onSocketResponse(data: string) {
        let parsedData: Tunel.Interfaces.ISockeResponseMessage = JSON.parse(data);
        let connectionObj: IRequestsData = this.activeConnections[parsedData.id];
        Object.keys(parsedData.data.headers).forEach(key => {
            connectionObj.response.setHeader(key, parsedData.data.headers[key]);
        });
        connectionObj.response.statusCode = parsedData.data.statusCode;
        connectionObj.response.end(parsedData.data.body);
        delete this.activeConnections[parsedData.id];
    }
}

const server = net.createServer((socket: Socket) => {

    const tunelServer = new TunelServer(socket);
    tunelServer.onRequest.bind(tunelServer);

    const proxyServer = http
        .createServer(tunelServer.onRequest)
        .listen(3211);


    // 'connection' listener
    console.log('client connected');
    socket.on('end', () => {
        console.log('client disconnected');
        proxyServer.close();
    });

    socket.on('data', (data: Buffer) => {
        console.log(data.toString());
    });

    socket.pipe(socket);
});

server.on('error', (err: any) => {
    throw err;
});

server.listen(8124, () => {
    console.log('server bound');
});