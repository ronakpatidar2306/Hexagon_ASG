const http = require('http');
const requesthandler =require('./user')

const server = http.createServer(requesthandler);
const PORT = 3000;
server.listen(PORT,()=>{
  console.log(`Server Running at http://localhost:${PORT}/`)
});