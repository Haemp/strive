const fs = require('fs');
console.log('Configuring '+process.env.RUNNING_MODE);
const db = 'mongodb://127.0.0.1:27017/strivedb';
const confFile = JSON.parse(fs.readFileSync('./config/run.json'));
const curConf = confFile[process.env.RUNNING_MODE];

module.exports = {
   db: db,
   ipaddress: curConf.ip,
   port: curConf.port
};
