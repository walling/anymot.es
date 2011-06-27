var url = require('url');

var queue = [];
var proxy = null;

function close_all_connections() {
	var client;
	while (client = queue.shift()) {
		client.writeHead(200, {
			'Content-Type': 'application/javascript'
		});
		client.end('response_ok("error", "proxy close");\n');
	}
}

require("http").createServer(function (request, response) {

	request.setEncoding('UTF-8');

	var query = url.parse(request.url, true);

	console.log(request.url);

	if (request.method === 'POST' && request.url === '/ir-proxy.hack') {

		if (proxy === null) {
			console.log('Proxy begin');
			proxy = request;
		} else {
			response.writeHead(503, {
				'Content-Type': 'text/plain'
			});
			response.end("Proxy already in use! :-)\n");
			return;
		}

		request.on('data', function(data) {
			console.log('Data', data);
			var client = queue.shift();
			if (!client) return;
			client.writeHead(200, {
				'Content-Type': 'application/javascript'
			});
			client.end(data === '1' ? 'response_ok();\n' : 'response_ok("error");\n');
		});

		request.on('end', function() {
			if (proxy) {
				console.log('Proxy end');
				close_all_connections();
			}
			proxy = null;
		});

		request.on('close', function() {
			if (proxy) {
				console.log('Proxy end');
				close_all_connections();
			}
			proxy = null;
		});

	} else if (request.method === 'GET' && query.pathname === '/id.irda') {

		code = Math.floor(1.0 * query.query.id || 0);
		if (proxy) {
			console.log('Proxy to IR: 0x' + code.toString(16));
			queue.push(response);
			proxy.connection.write((code + "                    ").substring(0, 20));
		} else {
			console.log('Proxy to IR failed (proxy client not connected)');
			response.writeHead(503, {
				'Content-Type': 'application/javascript'
			});
			response.end('response_ok("error", "service-unavailable");\n');
		}

	} else {

		response.writeHead(200, {
			'Content-Type': 'text/plain',
			'Content-Length': '14'
		});
		response.end("Hello, World!\n");

	}
}).listen(8123);
