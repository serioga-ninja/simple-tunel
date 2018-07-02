var http = require('http');

http.createServer(onRequest).listen(3210);

function onRequest(client_req, client_res) {
  console.log('serve: ' + client_req.url);
  
  let headersToForward = ['content-type', 'content-length'];

  var options = {
    hostname: 'localhost',
    port: 3333,
    path: client_req.url,
    method: client_req.method,
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
    }
  };
  headersToForward.forEach(headerName => {
    if(client_req[headerName] !== undefined) {
        options.headers[headerName] = client_req[headerName];
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

  client_req.pipe(proxy, {
    end: true
  });
}
