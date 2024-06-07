const FinishedEvent = require("./models/result");
const mongoose = require('mongoose');
const saveFinishedEvent = require("./result");
function getClockTime() {
    var now = new Date();
    var day = now.getDate();
    var month = now.getMonth() + 1; // Months are zero-based
    var year = now.getFullYear();
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
    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;
    hour = hour < 10 ? "0" + hour : hour;
    minute = minute < 10 ? "0" + minute : minute;

    var dateString = `${month}/${day}/${year}`;
    var timeString = `${hour}:${minute}${ap}`;
    //var dateTimeString = `${dateString} ${timeString}`;
    
    var dateTimeString = dateString + " " + timeString;
    return dateTimeString;
    //return timeString;
}

function getMinutes() {
    var now = new Date();
    var minute = now.getMinutes();
    return minute;
}
function create_event(message, events, symbol) {
    const dateTime = new Date().getTime();
    // console.log(getClockTime(dateTime))
    // 1 hour event
    if (
        getMinutes() % 60 === 0 ||
        getMinutes() % 20 === 0 ||
        getMinutes() % 10 === 0 ||
        getMinutes() % 5 === 0 

    ) {
        var event_duration;
        if (getMinutes() % 60 === 0) {
            event_duration = 60;
        } else if (getMinutes() % 20 === 0) {
            event_duration = 20;
        } else if (getMinutes() % 10 === 0) {
            event_duration = 10;
        } else if (getMinutes() % 5 === 0) {
            event_duration = 5;
        }
        // else if (getMinutes() % 2 === 0) {
        //     event_duration = 2;
        // }
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
        var istStartDate = istStartTime.split(',')[0];
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
        var clock_created_time = event_id;
        var create_price = message.data.p;
        var start_price = message.data.p;
        var diff_price = start_price - create_price;

        if (events.find((e) => e.event_id === event_id)) {
            // console.log("Event already exists")
            return false;
        }

        var obj = {
            event_id: event_id,
            start_price: message.data.p,
            title: `${symbol.toUpperCase()} to be priced at ${message.data.p} USDT or more at ${clock_end_time} ?`,
            subtitle: `${symbol.toUpperCase()} open price at ${event_id} was${start_price}USDT.`,
            event_type: `${symbol.toUpperCase()}`,
            is_event_active: false,
            yes_price: 5,
            no_price: 5,
            created_time: created_time,
            start_time_miliseconds: start_time_miliseconds,
            end_time_miliseconds: end_time_miliseconds,
            start_time: istStartTime,
            end_time: istEndTime,
            current_diff_price: null,
            diff_price: null,
        };
        // console.log("created event")
        //console.log(obj);
        return obj;
    } else {
        // console.log(" creating event failed");
    }
}
function update_event(message, events) {
    const dateTime = new Date().getTime();

    if (!Array.isArray(events)) {
        throw new Error("events should be an array");
    }

    for (let element of events) {
        element.current_diff_price = element.start_price - message.data.p;

        if (!element.is_event_active) {
            if (element.end_time_miliseconds > dateTime && element.start_time_miliseconds < dateTime) {
                element.is_event_active = true;
                if (element.diff_price === null) {
                    element.diff_price = element.start_price - message.data.p;
                }
                console.log("event_active");
            }
        }

        if (element.is_event_active) {
            var rate_change_for_1 = element.diff_price / 50;
            var rate_change = (element.current_diff_price - element.diff_price) / (rate_change_for_1 * 10);
            if (element.current_diff_price - element.diff_price > 0) {
                rate_change *= -1;
            }
            element.yes_price = parseFloat(5 - rate_change).toFixed(2);
            element.no_price = parseFloat(5 + rate_change).toFixed(2);
        }

        if (dateTime > element.end_time_miliseconds) {

            if (element.is_event_active === true) {
                element.is_event_active = false;
                let result;
                if (element.start_price < message.data.p) {
                    result = 'YES';
                } else {
                    result = 'NO';
                }

                saveFinishedEvent(element, result);
            }

            //console.log(`Event ${element.event_id} saved to the database.`);
        }
    }
}
module.exports = { create_event, update_event,getClockTime };

// Event.aggregate([
//     { $group: { _id: null, max_index: { $max: "$event_id" } } },
// ])
//     .then((data) => {
//         var new_index = 1;
//         if (data.length == 0) {
//             new_index = 1;
//         } else {
//             new_index = data[0].max_index + 1;
//         }
//         const obj = Event({
//             event_id: new_index,
//             title: `Bitcoin to be priced at ${
//                 message.data.p
//             } USDT or more at ${getClockTime(end_time)} PM?`,
//             subtitle: `Bitcoin open price at ${getClockTime(
//                 start_time
//             )} PM was 63527.16USDT.`,
//             event_type: "BTCUSDT",
//             is_event_active: false,
//             yes_price: 5,
//             no_price: 5,
//             start_time: start_time,
//             end_time: end_time,
//         });
//         obj.save();
// })
// .catch((err) => {
//     console.log(err);
// });
