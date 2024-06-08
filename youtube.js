require("dotenv").config();
const saveFinishedEvent = require("./result");
const axios = require("axios");
const { getClockTime } = require("./controller");
// function getClockTime() {
//     var now = new Date();
//     var day = now.getDate();
//     var month = now.getMonth() + 1;
//     var year = now.getFullYear();
//     var hour = now.getHours();
//     var minute = now.getMinutes();
//     var second = now.getSeconds();
//     var ap = "AM";
//     if (hour > 11) {
//         ap = "PM";
//     }
//     if (hour > 12) {
//         hour = hour - 12;
//     }
//     if (hour == 0) {
//         hour = 12;
//     }
//     if (hour < 10) {
//         hour = "0" + hour;
//     }
//     if (minute < 10) {
//         minute = "0" + minute;
//     }
//     if (second < 10) {
//         second = "0" + second;
//     }
//     var dateString = `${day}/${month}/${year}`;
//     var timeString = hour + ":" + minute + ap;
//     var dateTimeString = dateString + " " + timeString;
//     return dateTimeString;
//     //return timeString;
// }

function getMinutes() {
    var now = new Date();
    var minute = now.getMinutes();
    return minute;
}
async function createYouTubeEvent(channelDetails, event) {
    try {

        if (
            // getMinutes() % 5 === 0 ||
            // getMinutes() % 60 === 0 ||
            // getMinutes() % 20 === 0 ||
            // getMinutes() % 10 === 0||
            getMinutes() % 1 === 0
        ) {
            var event_duration;
            if (getMinutes() % 60 === 0) {
                event_duration = 60;
            } else if (getMinutes() % 20 === 0) {
                event_duration = 20;
            } else if (getMinutes() % 10 === 0) {
                event_duration = 24 * 6 * 10;
            } else if (getMinutes() % 5 === 0) {
                event_duration = 5;
            }
            // else if (getMinutes() % 2 === 0) {
            //     event_duration = 2;
            // }
            else {
                event_duration = 5;
            }



            var ampm = "AM";
            var currentDateObj = new Date();
            var numberOfMlSeconds = currentDateObj.getTime();
            var addMlSeconds = event_duration * 60 * 1000;
            var created_time = currentDateObj.getTime();
            var start_time_miliseconds = event.start_time;
            var end_time_miliseconds = event.end_time;
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


            if (channelDetails.eventid === event_id) {
                // console.log("Event already exists")
                return false;
            }

            const count = channelDetails.statistics.subscriberCount + 10000;
            return {
                event_type: 'YOUTUBE',
                event_id: event_id,
                title: `Subscriber Count for ${channelDetails.snippet.title} more than ${count}`,
                subtitle: `${channelDetails.channelName} subscriber at ${event_id} was${channelDetails.statistics.subscriberCount}USDT.`,
                yes_price: 5,
                no_price: 5,
                start_price: channelDetails.statistics.subscriberCount,
                subscriber_count: channelDetails.statistics.subscriberCount,
                is_event_active: false,
                created_time,
                start_time_miliseconds,
                end_time_miliseconds,
                start_time: event.start_time,
                end_time: event.end_time,
                current_diff_price: null,
                diff_price: null,
            };


        } else {
            //console.log(" creating event failed");
        }

    } catch (err) {
        console.log(err);
    }


}
function parseDateTime(dateTimeStr) {
    const dateTimeFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})(AM|PM)$/;
    const match = dateTimeStr.match(dateTimeFormat);

    if (!match) {
        throw new Error("Invalid date-time format");
    }

    const [, month, day, year, hour, minute, period] = match;
    let parsedHour = parseInt(hour, 10);
    if (period === "PM" && parsedHour !== 12) {
        parsedHour += 12;
    } else if (period === "AM" && parsedHour === 12) {
        parsedHour = 0;
    }

    return new Date(year, month - 1, day, parsedHour, parseInt(minute, 10));
}

 function calculateDate(endTime, startTime, ttime) {
    const end_time = parseDateTime(endTime);
    const start_time = parseDateTime(startTime);
    const time = parseDateTime(ttime);
    return { end_time, start_time, time }
}
async function updateYouTubeEvent(events) {
    const dateTime = getClockTime();
    console.log(dateTime)
    console.log(events[0].start_time)
    events = events.filter((event) => {
        const allTIme =  calculateDate(event.end_time_miliseconds, event.start_time_miliseconds, dateTime);
        const end_millisecond = allTIme.end_time;
        
        const current_time = allTIme.time;
        if (current_time <= end_millisecond) {
            return true; // Keep the event
        } else {
            console.log("Deleting event that has ended:", event);
            return false; // Remove the event
        }
    });
    events.forEach(async (event) => {
        const allTIme =  calculateDate(event.end_time_miliseconds, event.start_time_miliseconds, dateTime);
        const end_millisecond = allTIme.end_time;
        const start_millisecond = allTIme.start_time;
        const current_time = allTIme.time;
        console.log(allTIme)
        if (event.is_event_active === false) {
            if (
                end_millisecond < current_time &&
                start_millisecond > current_time
            ) {
                event.is_event_active = false;
                console.log("youtube not started yet")
            }
            if (
                end_millisecond > current_time &&
                start_millisecond < current_time
            ) {
                event.is_event_active = true;
                if (event.diff_price === null) {
                    event.diff_price = event.start_price - event.start_price;
                }
                console.log("youtube  event_active");
            }
        }

        if (event.is_event_active && current_time > end_millisecond) {
            if (event.is_event_active === true) {

                event.is_event_active = false;
                let result;
                if (event.start_count < event.subscriber_count) {
                    result = 'YES';
                } else {
                    result = 'NO';
                }

                saveFinishedEvent(event, result);
            }
        }
        if (current_time >= start_millisecond && current_time <= end_millisecond) {
            event.is_event_active = true;
            console.log("youtube event hitted")
            const updatedChannelDetails = await fetchYouTubeChannelDetails(event.channelName);
            event.current_diff_price = updatedChannelDetails.statistics.subscriberCount - event.subscriber_count;
            event.yes_price = parseFloat(5 - (event.current_diff_price / 1000)).toFixed(2);
            event.no_price = parseFloat(5 + (event.current_diff_price / 1000)).toFixed(2);
            event.subscriber_count = updatedChannelDetails.statistics.subscriberCount;

        }
        else {
            console.log("youtube event not started yet")
        }

    })
    return events;


}
async function fetchYouTubeChannelDetails(channelName) {
    try {
        const apiKey = `${process.env.API_KEY}`;
        const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forUsername=${channelName}&key=${apiKey}`;
        const response = await axios.get(url);
        if (response.data.items.length > 0) {
            return response.data.items[0];
        }
    } catch (err) {
        console.log(err);
        return "something wnet wrong";
    }

    //throw new Error('Channel not found');
}


module.exports = { createYouTubeEvent, updateYouTubeEvent, getClockTime, fetchYouTubeChannelDetails ,calculateDate,parseDateTime};