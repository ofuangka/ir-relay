if (process.argv.length < 3) {
	console.log(`Usage: node ${__filename} PORT`);
	process.exit(-1);
}
const PAUSE_TIME_MS = 1000;

var express = require('express'),
	http = require('http'),
	execWithCallback = require('child_process').exec,
	port = process.argv[2],
	server = express();

function waitFor(ms) {
	return new Promise((resolve, reject) => setTimeout(resolve, ms));
}
function pause() {
	return waitFor(PAUSE_TIME_MS);
}
function exec(command) {
	return new Promise((resolve, reject) => {
		execWithCallback(command, (error, stdout, stderr) => {
			if (error) {
				reject({
					error: error,
					stderr: stderr
				});
			} else {
				resolve(stdout);
			}
		});
	})
}

server.post('/', function (inRequest, inResponse) {
	var command = inRequest.body;
	
	/* immediately reply (this might take a while) */
	inResponse.send(JSON.stringify({ code: 200, message: '200 OK' }));

	/* send the ir signal combination */
	exec('irsend SEND_ONCE Sharp KEY_POWER')
		.then(pause)
		.catch(error => `irsend error: ${JSON.stringify(error)}`);
});

http.createServer(server).listen(port);
console.log(`Server listening on port ${port}`);
