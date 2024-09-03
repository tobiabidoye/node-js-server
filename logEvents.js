const {format} = require('date-fns');
const {v4: uuid} = require('uuid');//v4 version

const fs = require('fs');
const fspromises = require('fs').promises;
const path = require('path');
const { log } = require('console');
const logEvents = async function(message,logName){
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logitem = `${dateTime}\t${uuid()}\t${message}\n`; //date, unique id, and message
    console.log(logitem);
    try{
        //if path doesnt exist append file created the path
        if(!fs.existsSync(path.join(__dirname,'logs'))){
           await fspromises.mkdir(path.join(__dirname,'logs'));
        }
        await fspromises.appendFile(path.join(__dirname,'logs',logName),logitem);
    }catch(err){
        console.log(err);
    }
}

module.exports = logEvents;