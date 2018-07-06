/// <reference path="./index.d.ts" />
import * as http from 'http';
import * as net from 'net';

const client = net.createConnection({ port: 8124 }, () => {
  // 'connect' listener
  console.log('connected to server!');
});

client.on('data', (data) => {
  let IncomingMessage: Tunel.Interfaces.ISocketForwardMessage = JSON.parse(data.toString());

  console.log('serve: ' + IncomingMessage.path);
  
  let headersToForward = ['content-type', 'content-length', 'cookie'];

  var options = {
    hostname: 'localhost',
    port: 3333,
    path: IncomingMessage.path,
    method: IncomingMessage.method,
    headers: <any>{
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
        ...IncomingMessage.headers
    }
  };

  var proxy = http.request(options, function (res) {
    let data: any;

    res.on('data', (chunk: string) => {
        console.log(chunk);
    });

    res.on('end', (chunk: string) => {
      client.write(JSON.stringify(<Tunel.Interfaces.ISockeResponseMessage>{
        id: IncomingMessage.id,
        data: {
          headers: res.headers,
          statusCode: res.statusCode,
          body: data
      }
      }) + '\r\n')
    });
  });
});

client.on('end', () => {
  console.log('disconnected from server');
});