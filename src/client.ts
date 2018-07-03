import * as http from 'http';

http.createServer(onRequest).listen(3210);

function onRequest(client_req: http.IncomingMessage, client_res: http.ServerResponse) {
  console.log('serve: ' + client_req.url);
  
  let headersToForward = ['content-type', 'content-length', 'cookie'];

  var options = {
    hostname: 'localhost',
    port: 3333,
    path: client_req.url,
    method: client_req.method,
    headers: <any>{
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    }
  };
  headersToForward.forEach(headerName => {
    if(client_req.headers[headerName] !== undefined) {
        options.headers[headerName] = client_req.headers[headerName];
    }
  });

  var proxy = http.request(options, function (res) {

    Object.keys(res.headers).forEach(key => {
        client_res.setHeader(key, res.headers[key]);
    });
    client_res.statusCode = res.statusCode;

    res.pipe(client_res, {
      end: true
    });
  });



  client_req.on('data', (data) => {
    proxy.write(data.toString());
  });

  client_req.on('end', () => {
    proxy.end();
  });
}
