const FinishedEvent = require('./models/result'); // Ensure you have the correct path to your model

function saveFinishedEvent(event, result) {
    FinishedEvent.findOne({ event_id: event.event_id, event_type: event.event_type })
        .then((existingEvent) => {
            if (!existingEvent) {
                let finishedEvent = new FinishedEvent({
                    event_id: event.event_id,
                    event_type: event.event_type,
                    title: event.title,
                    result: result

                });

                finishedEvent.save()
                    .then(() => {
                        console.log(`Event ${event.event_id} ${event.event_type} saved to the database.`);
                    })
                    .catch((err) => {
                        console.error(`Failed to save event ${event.event_id}:`, err);
                    });
            } else {
                console.log(`Event ${event.event_id} already exists in the database.`);
            }
        })
        .catch((err) => {
            console.error(`Error checking if event ${event.event_id} exists:`, err);
        });
}

module.exports = saveFinishedEvent;