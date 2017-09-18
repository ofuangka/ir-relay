'use strict';

/* load environment variables */
var result = require('dotenv').config();
if (result.error) {
	throw result.error;
}

const RECEIVER_REGEX = /[A-Z][A-Z0-9_]*/i,
	KEY_REGEX = /[A-Z][A-Z0-9_]*/;

var http = require('http'),
	bodyParser = require('body-parser'),
	_exec = require('child_process').exec,
	server = require('express').express(),
	port = process.env.LISTEN_PORT || '9090',
	isVerbose = process.env.IS_VERBOSE,
	holdTime = parseFloat(process.env.HOLD_TIME || '0.375');

function exec(command) {
	return new Promise((resolve, reject) => {
		_exec(command, (error, stdout, stderr) => {
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

function log() {
    console.log.apply(console, Array.prototype.map.call(arguments, argument =>
        typeof argument === 'object' ? JSON.stringify(argument) : argument));
}

function verbose() {
	if (isVerbose) {
		log.apply(null, arguments);
	}
}

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.post('/receivers/:receiverId/command', (inRequest, inResponse) => {
	var receiverId = inRequest.params.receiverId,
		key = inRequest.body.key;
	verbose(receiverId, key);
	if (!RECEIVER_REGEX.test(receiverId) || !KEY_REGEX.test(key)) {
		log('Invalid receiver/key', receiverId, key);
		inResponse.status(400).send('Bad request');
	} else {

		/* send the ir signal combination */
		exec(`irsend SEND_START ${receiverId} ${key} && sleep ${holdTime}; irsend SEND_STOP ${receiverId} ${key}`)
			.then(result => inResponse.status(200).send(JSON.stringify({ result: result })))
			.catch(error => {
				log('Execution error', error);
				inResponse.status(500).send(JSON.stringify(error));
			});
	}
});

http.createServer(server).listen(port);
log(`Server listening on port ${port}`);
