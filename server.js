const http = require('http');
const path = require('path');
const fs = require('fs');
const fspromises = require('fs').promises;

const logEvents = require('./logEvents');
const EventEmitter = require('events');
class Emitter extends EventEmitter{};

//initialize object;
const myemitter = new Emitter();
myemitter.on('log', function(message,filename){
    logEvents(message,filename);
});

const PORT = process.env.PORT || 3000;
const serveFile = async function(filePath, contentType, response){ 
    try{ 
        const rawdata = await fspromises.readFile(filePath,
            !contentType.includes('image')? 'utf8': '');
        const data = contentType === 'application/json'? JSON.parse(rawdata):rawdata; //if data type is json then parse rawdata else data is rawdata
        response.writeHead(
            filePath.includes('404.html')?404: 200,
            {'Content-Type': contentType});
        response.end(
            contentType === 'application/json'? JSON.stringify(data): data
        );
    }catch(err){
        console.log(err);
        myemitter.emit('log', `${err.name}: ${err.message}`,'errLog.txt');
        response.statusCode = 500;  
        response.end();
    }
}
const server = http.createServer(function(req, res){ 
    console.log(req.url,req.method);
    myemitter.emit('log', `${req.url}\t${req.method}`,'reqLog.txt');

    const extenstion = path.extname(req.url);
    let contentType; 

    switch(extenstion){ 
        case '.CSS':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break; 
        case '.json': 
            contentType = 'application/json';
            break; 
        case '.png': 
            contentType = 'image/png';
            break;
        case '.jpg': 
            contentType = 'image/jpg';
            break;
        case '.txt': 
            contentType = 'text/plain';
            break; 
        default: 
            contentType = 'text/html'; 
            break;
    }

    let filePath;
    //constructing filepath then verifying if that file exists

    if (contentType === 'text/html') {
        if (req.url === '/') {
            filePath = path.join(__dirname, 'views', 'index.html');
        } else if (req.url.slice(-1) === '/') {
            filePath = path.join(__dirname, 'views', req.url, 'index.html');
        } else {
            filePath = path.join(__dirname, 'views', req.url);
        }
    } else {
        filePath = path.join(__dirname, req.url);
    }
//makes.html extenstion not a requirement in browser
if (!extenstion && req.url.slice(-1) !== '/'){ 
    filePath += '.html';
}

const fileExists = fs.existsSync(filePath);

if(fileExists){ 
    //serve file
    serveFile(filePath,contentType,res);
}else{ 
    //404 or 301 redirect
    switch(path.parse(filePath).base){ 
        case 'old-page.html':
            res.writeHead(301,{'Location':'/new-page.html'});
            res.end();
            break;
        case 'www-page.html':
            res.writeHead(301,{'Location':'/'});
            res.end();
        default: 
            //server a 404 response
            serveFile(path.join(__dirname,'views','404.html'), contentType,res);
    }
} 


});



//listening for connections
server.listen(PORT, function(){ 
    console.log(`server running on port ${PORT}`);
})







