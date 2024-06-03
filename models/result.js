const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FinishedEventSchema = new Schema({
    event_id: { type: String, required: true },
    event_type: { type: String, required: true },
    title: { type: String, required: true },
    result: { type: String, enum: ['yes', 'no'], required: true },
    saved_at: { type: Date, default: Date.now },
    isMoneyTransferred: { type: Boolean, default: false }
});

const FinishedEvent = mongoose.model('FinishedEvent', FinishedEventSchema);

module.exports = FinishedEvent;