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
                        if (event.event_type === 'BTCUSDT') {
                            const index = global.btcOddsData.findIndex(e => e.event_id === event.event_id);
                            if (index !== -1) global.btcOddsData.splice(index, 1);
                        } else if (event.event_type === 'ETHUSDT') {
                            const index = global.ethOddsData.findIndex(e => e.event_id === event.event_id);
                            if (index !== -1) global.ethOddsData.splice(index, 1);
                        }
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