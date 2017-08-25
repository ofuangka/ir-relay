if (process.argv.length < 3) {
	console.log(`Usage: node ${__filename} PORT`);
	process.exit(-1);
}

var express = require('express'),
	http = require('http'),
	execWithCallback = require('child_process').exec,
	port = process.argv[2],
	server = express();

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
	});
}

server.post('/devices/:deviceId', function (inRequest, inResponse) {
	var deviceId = inRequest.params.deviceId,
		command = inRequest.body.command;

	/* send the ir signal combination */
	exec(`irsend SEND_ONCE ${deviceId} ${command}`)
		.then(result => inResponse.status(200).send(JSON.stringify({ result: result })))
		.catch(error => inResponse.status(500).send(JSON.stringify(error)));
});

http.createServer(server).listen(port);
console.log(`Server listening on port ${port}`);
