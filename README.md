# ir-server
Server to send IR commands

## Requirements
[NodeJS & npm](https://nodejs.org) - 8.5.0
[LIRC](http://www.lirc.org)

## Configuration
The following command will download NodeJS dependencies.
    npm install

The following command will create the .env file containing configuration variables.
    node setup.js

## Usage
    node index.js

### Example
    curl http://localhost:9090/receivers/Living_Room_TV/command/KEY_POWER
