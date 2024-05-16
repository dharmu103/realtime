const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
io.on('connection', () => {
    console.log('a user connected');
 });
server.listen(3000);

// io.start()
var timeout = 1000;

const emit = () => {
    // console.log(' emitting data');
    // console.log(global.oddsData);
    io.emit('broadcast',{events: global.oddsData});
    setTimeout(() => {emit();}, timeout);
}

module.exports = {
   emit

}
