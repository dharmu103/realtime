const {calculateDate,parseDateTime}= require("./youtube")

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
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minute < 10) {
        minute = "0" + minute;
    }
    if (second < 10) {
        second = "0" + second;
    }
    var dateString = `${day}/${month}/${year}`;
    var timeString = hour + ":" + minute + ap;
    var dateTimeString = dateString + " " + timeString;
    return dateTimeString;
    //return timeString;
    //hgvvfhv
}

function getMinutes() {
    var now = new Date();
    var minute = now.getMinutes();
    return minute;
}
// function create_event(event) {
//     console.log(event)
//     // Check if event is an array
//     if (Array.isArray(event)) {
//         // Process each event in the array
//         return event.map(singleEvent => processSingleEvent(singleEvent));
//     } else {
//         // Process single event
//         return processSingleEvent(event);
//     }
// }

function create_event(event) {
    //console.log(event)
    const dateTime = new Date().getTime();
    // console.log(getClockTime(dateTime))
    // 1 hour event
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
            event_duration = 10;
        } else if (getMinutes() % 5 === 0) {
            event_duration = 5;
        }
        // else if (getMinutes() % 2 === 0) {
        //     event_duration = 2;
        // }
        else {
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
        // var clock_created_time = event_id;
        // var create_price = message.data.p;
        // var start_price = message.data.p;
        // var diff_price = start_price - create_price;

        if (event.event_id === event_id) {
            // console.log("Event already exists")
            return false;
        }
        var event_id = getClockTime();
        return {
            ...event,
            start_price: 0,
            event_id: event_id,
            is_event_active: true,
            created_time,
            start_time_miliseconds,
            end_time_miliseconds,
            start_time: event.start_time,
            end_time: event.end_time,
            current_diff_price: null,
            diff_price: null,
        };
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
        // var obj = {
        //     event_id: event_id,
        //     start_price: message.data.p,
        //     title: `${symbol.toUpperCase()} to be priced at ${message.data.p} USDT or more at ${clock_end_time} ?`,
        //     subtitle: `${symbol.toUpperCase()} open price at ${event_id} was${start_price}USDT.`,
        //     event_type: `${symbol.toUpperCase()}`,
        //     is_event_active: false,
        //     yes_price: 5,
        //     no_price: 5,
        //     created_time: created_time,
        //     start_time_miliseconds: start_time_miliseconds,
        //     end_time_miliseconds: end_time_miliseconds,
        //     start_time: istStartTime,
        //     end_time: istEndTime,
        //     current_diff_price: null,
        //     diff_price: null,
        // };
        // // console.log("created event")
        //  //console.log(obj);
        // return obj;
    } else {
        // console.log(" creating event failed");
    }
}

function update_event(message, events) {
    console.log("update event is hitted")
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
    // console.log(" update event")
    // console.log("dateTime", dateTime);
    // console.log(message);
    events.forEach((event) => {
        element.current_diff_price = element.start_price - message.data.p;
        const allTIme =  calculateDate(event.end_time_miliseconds, event.start_time_miliseconds, dateTime);
        const end_millisecond = allTIme.end_time;
        const start_millisecond = allTIme.start_time;
        const current_time = allTIme.time;
        if (element.is_event_active === false) {
            if (
                end_millisecond < current_time &&
                start_millisecond > current_time
            ) {
                element.is_event_active = false;
            }
            if (
                end_millisecond > current_time &&
                start_millisecond< current_time
            ) {
                element.is_event_active = true;
                if (element.diff_price === null) {
                    element.diff_price = element.start_price - message.data.p;
                }
                console.log("cricket  event_active");
            }
        }
        if (element.is_event_active === true) {
            var rate_change_for_1 = element.diff_price / 50;
            var rate_change =
                (element.current_diff_price - element.diff_price) /
                (rate_change_for_1 * 10);
            if (element.current_diff_price - element.diff_price > 0) {
                rate_change = rate_change * -1;
            }
            element.yes_price = parseFloat(5 - rate_change).toFixed(2);
            element.no_price = parseFloat(5 + rate_change).toFixed(2);
            // console.log(
            //     " range_active",
            //     element.current_diff_price,
            //     element.yes_price,
            //     element.no_price,
            //     rate_change,
            //     rate_change_for_1
            // );
        }
        if (current_time > end_millisecond) {
            element.is_event_active = false;
        }

        return events;
    });
}

module.exports = { create_event, update_event };

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
