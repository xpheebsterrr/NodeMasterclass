const http = require('http');

const server = http.createServer((req,res) => {
    res.end('First Web Server Sheesh');
});

server.listen(3000, ()=> {
    console.log('Server is started');
});