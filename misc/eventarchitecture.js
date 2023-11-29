//require events module in file
let events = require('events');

//creating an event emitter
let eventEmitter = new events.EventEmitter();

// event listener, listen for the event "connection" and pass our callback
eventEmitter.on('connection', () => {
    console.log('Connection Successful tehe.');
})

//firing the connection event/ emiting event
eventEmitter.emit('connection');