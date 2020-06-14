const mongoose = require('../../libs/mongoose');

const numberRangeSchema = new mongoose.Schema({
    instance_id: { type: String, unique: true, required: true, index: true },
    startAt: { type: Number, default: 0 },
    incrementBy: { type: Number, default: 1 },
    count: { type: Number, default: 0 },
});

numberRangeSchema.statics.initialize = function ({ instance_id, startAt, incrementBy }) {
    // Create a new Number Range for ID
    return new this({ instance_id, startAt, incrementBy, count: startAt }).save();
}

numberRangeSchema.statics.nextNumber = async function (instance_id) {
    let count = 1;
    // Find an exist Number Range for ID
    const numberRange = await this.findOne({ instance_id });
    if (numberRange) {
        // Update count for corresponding Number Range
        count =  numberRange.count + numberRange.incrementBy;
        await this.updateOne({ _id: numberRange._id }, { count });
    } else {
        // Create a new Number Range for ID
        await this.initialize({ instance_id, startAt: 1 });
    }

    return count;
}

numberRangeSchema.statics.remove = function (instance_id) {
    // Delete an exist Number Range for ID
    return this.findOneAndDelete({ instance_id });
}

module.exports = mongoose.model('NumberRange', numberRangeSchema);
