const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const axios = require('axios');
require('dotenv').config()
const saveFinishedEvent= require("./result");
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const {create_event,update_event} = require("./cricket");
const { createYouTubeEvent, updateYouTubeEvent ,getClockTime} = require("./youtube");
io.on('connection', () => {
    console.log('a user connected');
 });
server.listen(3000,()=>{
    console.log('server is runing');
});
global.cricketOddsData = [];
 global.globalYouTubeData = [];
let events=[];
let youtubeEvent=[];
// io.start()
var timeout = 1000;
const apiKey=process.env.API_KEY;
console.log(apiKey);
//const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forUsername=${channelName}&key=${apiKey}`;
const emit = () => {
    // console.log(' emitting data');
    // console.log(global.oddsData);
    const allEvents = [
        ...global.btcOddsData,
        ...global.ethOddsData,
        ...global.cricketOddsData,
        ...global.globalYouTubeData
    ];
    io.emit('broadcast', {
        events: allEvents
    });


    setTimeout(() => {emit();}, timeout);
}

module.exports = {
   emit

}

async function fetchYouTubeChannelDetails(channelName) {
    try{
        //const apiKey = 'YOUR_YOUTUBE_API_KEY';
        const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forUsername=${channelName}&key=${apiKey}`;
        const response = await axios.get(url);
        if (response.data.items.length > 0) {
            return response.data.items[0];
        }
    }catch(err){
        console.log(err);
        return "something wnet wrong"
    }
   

    //throw new Error('Channel not found');
}


//rest api 
app.post('/api/events', (req, res) => {
    const newEvent = req.body;
   
    if (!newEvent.event_type || !newEvent.yes_price || !newEvent.title) {
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
        global.cricketOddsData.push(processedEvent);
        res.status(201).json(processedEvent);
    } else {
        return res.status(400).json({ error: 'Unknown event type' });
    }

    //res.status(201).send("nothing happened")
});

//update cricket event
app.put('/api/events', (req, res) => {
    const eventId = req.query.event_id;
    const updatedData = req.body;

    if (!eventId) {
        return res.status(400).json({ error: 'Event ID is required' });
    }

    const event = global.cricketOddsData.find(e => e.event_id === eventId);

    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    const currentTime = new Date().getTime();

    if (currentTime < event.start_time_miliseconds) {
        
        return res.status(400).json({ error: 'Cannot update event outside of active period' });
    }
    else if(currentTime > event.start_time_miliseconds){
        if(event.is_event_active=true){
            console.log("executed")
            event.is_event_active=false;
            let result;
            if(updatedData.score>event.score){
                result='yes';
            }else{
                result='no';
            }
            saveFinishedEvent(event, result);
        }
    }

    // Update the event with the new yes_price and no_price
    if (updatedData.yes_price) event.yes_price = updatedData.yes_price;
    if (updatedData.no_price) event.no_price = updatedData.no_price;
    if (updatedData.score) event.score = updatedData.score;
    event.is_event_active=true;
    res.status(200).json(event);
});

//youtube api
app.post('/api/youtubeevents', async (req, res) => {
    const { event_type, channelName } = req.body;

    if (event_type !== 'YOUTUBE') {
        return res.status(400).json({ error: 'Unknown event type' });
    }

    try {
        const eventid="12344334"
        const channelDetails = await fetchYouTubeChannelDetails(channelName);
        console.log(channelDetails)
        const newEvent = await createYouTubeEvent(channelDetails,eventid);
        if(newEvent){
            //globalYouTubeData.push(newEvent);
            //youtubeEvent.push(newEvent)
        }
        globalYouTubeData.push(newEvent)
        res.status(201).json(channelDetails);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const message={
    data:{
        p:10
    }
}

setInterval(() => {
   
    if (Array.isArray(global.cricketOddsData) && global.cricketOddsData.length > 0) {
        
        // var updated_events = update_event(message, events);
        // if(updated_events){
        //  events = updated_events;
        //  global.cricketOddsData.push(events);
        //  console.log("global value updTated")
        // }
       
    } else {
        //console.log("Cricket odds data is empty.");
    }
}, 1000);

setInterval(async() => {
   
    if (globalYouTubeData.length > 0) {
     var update_youtube= await  updateYouTubeEvent(globalYouTubeData);
        console.log("YouTube events updated:", update_youtube);
    } else {
        console.log("No YouTube events to update.");
    }
}, 10000); 