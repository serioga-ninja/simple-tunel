import * as http from 'http';
import * as net from 'net';
import { Socket } from 'net';

interface IRequestsData {
    request: http.IncomingMessage;
    response: http.ServerResponse;
    index: number;
}

class TunelServer {

    private reqeustId: number;
    private activeConnections: IRequestsData[];

    constructor(private socket: Socket) {
        this.reqeustId = 0;
    }

    /**
     * 
     * @param client_req 
     * @param client_res 
     */
    public onRequest(client_req: http.IncomingMessage, client_res: http.ServerResponse) {
        const data = {
            path: client_req.url,
            method: client_req.method,
            headers: client_req.headers
        };

        this.activeConnections.push({})

        this.socket.write(`${JSON.stringify(data)}\r\n`);
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

    socket.pipe(socket);
});

server.on('error', (err: any) => {
    throw err;
});

server.listen(8124, () => {
    console.log('server bound');
});