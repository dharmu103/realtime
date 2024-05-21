const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const {create_event,update_event} = require("./cricket");
io.on('connection', () => {
    console.log('a user connected');
 });
server.listen(3000,()=>{
    console.log('server is runing');
});
global.cricketOddsData = [];
let events=[];
// io.start()
var timeout = 1000;

const emit = () => {
    // console.log(' emitting data');
    // console.log(global.oddsData);
    io.emit('broadcast', {
        btcEvents: global.btcOddsData,
        ethEvents: global.ethOddsData,
        cricketEvents: global.cricketOddsData
    });


    setTimeout(() => {emit();}, timeout);
}

module.exports = {
   emit

}

//rest api 
app.post('/api/events', (req, res) => {
    const newEvent = req.body;
   
    if (!newEvent.event_type || !newEvent.event_id || !newEvent.yes_price || !newEvent.title) {
        return res.status(400).json({ error: 'Invalid event object' });
    }

     if (newEvent.event_type === 'CRICKET') {
        const processedEvent = create_event(newEvent);
        if (processedEvent) {
            //console.log("process event"+processedEvent)
            events.push(processedEvent);
        }
        console.log(events)
      
        // events.push(newEvent)
        // const processedEvent = create_event(newEvent);
        global.cricketOddsData.push(events);
    } else {
        return res.status(400).json({ error: 'Unknown event type' });
    }

    res.status(201).json(newEvent);
});
const message={
    data:{
        p:10
    }
}
setInterval(() => {
    if (Array.isArray(global.cricketOddsData) && global.cricketOddsData.length > 0) {
        //console.log("Cricket odds data:", global.cricketOddsData);
        // Perform other actions or call functions here
        var updated_events = update_event(message, events);
        if(updated_events){
         events = updated_events;
         global.cricketOddsData.push(events);
         console.log("global value updTated")
        }
       
    } else {
        console.log("Cricket odds data is empty.");
    }
}, 1000);