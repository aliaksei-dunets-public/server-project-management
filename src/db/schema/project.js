const mongoose = require('../../libs/mongoose');
const NumberRangeModel = require('./numberRange');

const projectSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true, uppercase: true },
    name: { type: String, required: true },
    descr: { type: String },
    status: { type: String, default: 'INACTIVE' },          // ACTIVE, INACTIVE, OBSOLETE
    external_code: { type: String },
    external_url: { type: String },
}, { timestamps: true });

projectSchema.pre('save', function (next) {
    try {
        if (this.isNew) return NumberRangeModel.initialize({ instance_id: this.id });
        next();
    } catch (error) {
        next(error);
    }
});

projectSchema.post('findOneAndDelete', function (instance, next) {
    try {
        return NumberRangeModel.remove(instance.id);
    } catch (error) {
        next();
    }
});

module.exports = mongoose.model('Project', projectSchema);