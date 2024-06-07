const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const axios = require("axios");
require("dotenv").config();
const saveFinishedEvent = require("./result");
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const FinishedEvent = require("./models/result");
const User = require("./models/user");
const UserTrades = require("./models/user_trades");
const { create_event, update_event } = require("./cricket");
const {
  createYouTubeEvent,
  updateYouTubeEvent,
  fetchYouTubeChannelDetails,
  getClockTime,
} = require("./youtube");
const path = require("path");
// const UserTrades = require(path.join(
//   __dirname,
//   "../../accounts/accounts/model/user_trades.js"
// ));
const { MongoClient } = require("mongodb");
require("dotenv/config");

io.on("connection", () => {
  console.log("a user connected");
});
server.listen(3000, () => {
  console.log("server is runing");
});
global.cricketOddsData = [];
global.globalYouTubeData = [];
let events = [];
let youtubeEvent = [];
// io.start()
var timeout = 1000;
const apiKey = process.env.API_KEY;
console.log(apiKey);
global.oddsData = {};
//const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forUsername=${channelName}&key=${apiKey}`;
const emit = () => {
  // console.log(' emitting data');
  // console.log(global.oddsData);
  const allEvents = [
    ...global.btcOddsData,
    ...global.ethOddsData,
    ...global.cricketOddsData,
    ...global.globalYouTubeData,
  ];
  io.emit("broadcast", {
    oddsData: allEvents,
  });

  //

  setTimeout(() => {
    emit();
  }, timeout);


};

setInterval(async () => {
  await transferFunds();
}, 60000);

module.exports = {
  emit,
};

//rest api
app.post("/api/events", (req, res) => {
  const newEvent = req.body;

  if (!newEvent.event_type || !newEvent.yes_price || !newEvent.title || !newEvent.start_time || !newEvent.end_time) {
    return res.status(400).json({ error: "Invalid event object" });
  }

  if (newEvent.event_type === "CRICKET") {
    const processedEvent = create_event(newEvent);
    if (processedEvent) {

      events.push(processedEvent);
    }
    console.log(events);

    global.cricketOddsData.push(processedEvent);
    res.status(201).json(processedEvent);
  } else {
    return res.status(400).json({ error: "Unknown event type" });
  }

});

//update cricket event
app.put("/api/events", (req, res) => {
  const eventId = req.query.event_id;
  const updatedData = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  const event = global.cricketOddsData.find((e) => e.event_id === eventId);

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const currentTime = new Date().getTime();

  if (currentTime < event.start_time_miliseconds) {
    return res
      .status(400)
      .json({ error: "Cannot update event outside of active period" });
  } else if (currentTime > event.start_time_miliseconds) {
    if ((event.is_event_active = true)) {
      console.log("executed");
      event.is_event_active = false;
      let result;
      if (updatedData.score > event.score) {
        result = "YES";
      } else {
        result = "NO";
      }
      saveFinishedEvent(event, result);
    }
    return res
      .status(400)
      .json({ error: "Cannot update event outside of active period" });
  }

  // Update the event with the new yes_price and no_price
  if (updatedData.yes_price) event.yes_price = updatedData.yes_price;
  if (updatedData.no_price) event.no_price = updatedData.no_price;
  if (updatedData.score) event.score = updatedData.score;
  event.is_event_active = true;
  global.cricketOddsData = global.cricketOddsData.filter((e) => currentTime < e.end_time_miliseconds);
  res.status(200).json(event);
});

//youtube api
app.post("/api/youtubeevents", async (req, res) => {
  // const { event_type, channelName,start_time,end_time } = req.body;
  const event = req.body
  if (event.event_type !== "YOUTUBE") {
    return res.status(400).json({ error: "Unknown event type" });
  }

  try {

    const channelDetails = await fetchYouTubeChannelDetails(event.channelName);
    console.log(channelDetails);
    const newEvent = await createYouTubeEvent(channelDetails, event);
    console.log(newEvent)
    if (newEvent) {
      //globalYouTubeData.push(newEvent);
      //youtubeEvent.push(newEvent)
    }
    globalYouTubeData.push(newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//update youtube event
app.put("/api/youtubeevents", (req, res) => {
  const eventId = req.query.event_id;
  const updatedData = req.body;

  if (!eventId) {
    return res.status(400).json({ error: "Event ID is required" });
  }

  const event = global.globalYouTubeData.find((e) => e.event_id === eventId);

  if (!event) {
    return res.status(404).json({ error: "YOTUBEEvent not found" });
  }

  const currentTime = new Date().getTime();

  if (currentTime < event.start_time_miliseconds) {
    return res
      .status(400)
      .json({ error: "Cannot update event outside of active period" });
  } else if (currentTime > event.start_time_miliseconds) {
    if ((event.is_event_active = true)) {
      console.log("executed");
      event.is_event_active = false;
      let result;
      if (updatedData.score > event.score) {
        result = "YES";
      } else {
        result = "NO";
      }
      saveFinishedEvent(event, result);
    }
    return res
      .status(400)
      .json({ error: "Cannot update event outside of active period" });
  }

  // Update the event with the new yes_price and no_price
  if (updatedData.yes_price) event.yes_price = updatedData.yes_price;
  if (updatedData.no_price) event.no_price = updatedData.no_price;
  if (updatedData.score) event.score = updatedData.score;
  event.is_event_active = true;
  res.status(200).json(event);
});
const message = {
  data: {
    p: 10,
  },
};

setInterval(() => {
  if (
    Array.isArray(global.cricketOddsData) &&
    global.cricketOddsData.length > 0
  ) {
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

setInterval(async () => {
  if (globalYouTubeData.length > 0) {
    var update_youtube = await updateYouTubeEvent(globalYouTubeData);
    console.log("YouTube events updated:", update_youtube);
    globalYouTubeData = update_youtube;
  } else {
    console.log("No YouTube events to update.");
  }
}, 10000);

//5*60*10000
let intervalId;
app.post("/api/start-processing", (req, res) => {
  if (!intervalId) {
    intervalId = setInterval(checkAndProcessEvents, 1 * 60 * 1000);
    res.send("Started processing events every 2 minutes");
  } else {
    res.send("Processing is already running");
  }
});
app.post("/api/testing-usertrades", async (req, res) => {
  try {
    const userTrades = await UserTrades.findAll();
    console.log(userTrades);
    res.send("done");
  } catch (err) {
    console.log(err);
    res.send("wrong happened");
  }
});
app.post("/api/stop-processing", (req, res) => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    res.send("Stopped processing events");
  } else {
    res.send("Processing is not running");
  }
});



async function transferFunds() {
  try {
    const event = await FinishedEvent.findOne({ isMoneyTransferred: false });
    if (event) {
      console.log("event mil gaya")
      //console.log(event);
      var userTrades = await UserTrades.find({
        event_id: event.event_id,
        event_type: event.event_type,
        status: "PENDING",
      });
      if (userTrades) {

        console.log(userTrades);
        for (var i = 0; i < userTrades.length; i++) {
          if (event.result.toUpperCase() == userTrades[i].bet_type.toUpperCase()) {
            var user = await User.findOneAndUpdate({ _id: userTrades[i].user_id }, { $inc: { walletBalance: userTrades[i].amount } });
          }
          else {
            userTrades[i].amount = 0;
          }
          userTrades[i].status = "SUCCESS";
          userTrades[i].save().then(data => {

            console.log("Amount Transfer Completed");

          });
          event.isMoneyTransferred = true;
        event.save().then(data => {
          console.log("Event Updated");
        });
        }
        
      }
    }
    console.log("event not found")
  } catch (e) {
    console.log(e);
  }


}
