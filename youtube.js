
const saveFinishedEvent= require("./result");
function getClockTime() {
    var now = new Date();

    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    var ap = "AM";
    if (hour > 11) {
        ap = "PM";
    }
    if (hour > 12) {
        hour = hour - 12;
    }
    if (hour == 0) {
        hour = 12;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    if (second < 10) {
        second = "0" + second;
    }
    var timeString = hour + ":" + minute + ap;
    return timeString;
}

function getMinutes() {
    var now = new Date();
    var minute = now.getMinutes();
    return minute;
}
async function createYouTubeEvent(channelDetails,eventid) {
    try{

        if (
            // getMinutes() % 5 === 0 ||
            // getMinutes() % 60 === 0 ||
            // getMinutes() % 20 === 0 ||
            // getMinutes() % 10 === 0||
            getMinutes() % 1=== 0
        ) {
            var event_duration;
            if (getMinutes() % 60 === 0) {
                event_duration = 60;
            } else if (getMinutes() % 20 === 0) {
                event_duration = 20;
            } else if (getMinutes() % 10 === 0) {
                event_duration = 24*6*10;
            } else if (getMinutes() % 5 === 0) {
                event_duration = 5;
            }
            // else if (getMinutes() % 2 === 0) {
            //     event_duration = 2;
            // }
            else{
                event_duration = 5;
            }
            // var istOptions = { timeZone: 'Asia/Kolkata' };
            // var istStartTime = start_time.toLocaleString('en-IN', istOptions);
            // var istEndTime = end_time.toLocaleString('en-IN', istOptions);
            
    
            var ampm = "AM";
            var currentDateObj = new Date();
            var numberOfMlSeconds = currentDateObj.getTime();
            var addMlSeconds = event_duration * 60 * 1000;
            var created_time = currentDateObj.getTime();
            var start_time_miliseconds = numberOfMlSeconds + addMlSeconds;
            var end_time_miliseconds = numberOfMlSeconds + addMlSeconds * 2;
            var start_time = new Date(numberOfMlSeconds + addMlSeconds);
            var end_time = new Date(numberOfMlSeconds + addMlSeconds * 2);
            var istOptions = { timeZone: 'Asia/Kolkata' };
            var istStartTime = start_time.toLocaleString('en-IN', istOptions);
            var istEndTime = end_time.toLocaleString('en-IN', istOptions);
            if (start_time.getHours() < 12) {
                ampm = "AM";
            } else {
                ampm = "PM";
            }
            var clock_start_time =
                start_time.getMinutes() === 0
                    ? start_time.getHours() + ":00" + ampm
                    : start_time.getHours() + ":" + start_time.getMinutes() + ampm;
            if (start_time.getHours() < 12) {
                ampm = "AM";
            } else {
                ampm = "PM";
            }
            var clock_end_time =
                end_time.getMinutes() === 0
                    ? end_time.getHours() + ":00" + ampm
                    : end_time.getHours() + ":" + end_time.getMinutes() + ampm;
    
            var event_id = getClockTime();
            // var clock_created_time = event_id;
            // var create_price = message.data.p;
            // var start_price = message.data.p;
            // var diff_price = start_price - create_price;
    
            if (eventid=== event_id) {
                // console.log("Event already exists")
                return false;
            }
            // event_id: event_id,
            // start_price: message.data.p,
            // title: `${symbol.toUpperCase()} to be priced at ${message.data.p} USDT or more at ${clock_end_time} ?`,
            // subtitle: `${symbol.toUpperCase()} open price at ${event_id} was${start_price}USDT.`,
            // event_type: `${symbol.toUpperCase()}`,
            // is_event_active: false,
            // yes_price: 5,
            // no_price: 5,
            // created_time: created_time,
            // start_time_miliseconds: start_time_miliseconds,
            // end_time_miliseconds: end_time_miliseconds,
            // start_time: istStartTime,
            // end_time: istEndTime,
            // current_diff_price: null,
            // diff_price: null,
            
            return {event_type: 'YOUTUBE',
            event_id: event_id,
            title: `Subscriber Count for ${channelDetails.snippet.title}`,
            subtitle: `${channelDetails.channelName} subscriber at ${event_id} was${channelDetails.statistics.subscriberCount}USDT.`,
            yes_price: 5,
            no_price: 5,
            start_price:channelDetails.statistics.subscriberCount,
            subscriber_count: channelDetails.statistics.subscriberCount,
                is_event_active: false,
                created_time,
                start_time_miliseconds,
                end_time_miliseconds,
                start_time: istStartTime,
                end_time: istEndTime,
                current_diff_price: null,
                diff_price: null,
            };
    
            
        } else {
            //console.log(" creating event failed");
        }
        
    }catch(err){
        console.log(err);
    }


}

async function  updateYouTubeEvent(event) {
    const dateTime = new Date().getTime();
    // if (event.is_event_active === false) {
    //     if (
    //         event.end_time_miliseconds < dateTime &&
    //         event.start_time_miliseconds > dateTime
    //     ) {
    //         event.is_event_active = false;
    //         console.log("youtube not started yet")
    //     }
    //     if (
    //         event.end_time_miliseconds > dateTime &&
    //         event.start_time_miliseconds < dateTime
    //     ) {
    //         event.is_event_active = true;
    //         if (event.diff_price === null) {
    //             event.diff_price = event.start_price - message.data.p;
    //         }
    //         console.log("cricket  event_active");
    //     }
    // }
   
        if (event.is_event_active && dateTime > event.end_time_miliseconds) {
            if( event.is_event_active ===true){
                event.is_event_active = false;
                let result;
                if(event.start_count<event.subscriber_count){
                    result='yes';
                }else{
                    result='no';
                }
    
                saveFinishedEvent(element, result);
            }
        }
        if ( dateTime >= event.start_time_miliseconds && dateTime <= event.end_time_miliseconds) {
            event.is_event_active = true;
            console.log("youtube event hitted")
            const updatedChannelDetails = await fetchYouTubeChannelDetails(event.channelName);
            event.current_diff_price = updatedChannelDetails.statistics.subscriberCount - event.subscriber_count;
            event.yes_price = parseFloat(5 - (event.current_diff_price / 1000)).toFixed(2);
            event.no_price = parseFloat(5 + (event.current_diff_price / 1000)).toFixed(2);
            event.subscriber_count=updatedChannelDetails.statistics.subscriberCount;
        }
        else{
            console.log("youtube event not started yet")
        }
        return event;
   
}


module.exports = { createYouTubeEvent, updateYouTubeEvent ,getClockTime};