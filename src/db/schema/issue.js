const mongoose = require('../../libs/mongoose');
const ProjectModel = require('./project');
const NumberRangeModel = require('./numberRange');

const issueSchema = new mongoose.Schema({
    project_id: { type: String, required: true, index: true },
    code: { type: String, uppercase: true },
    codeId: { type: Number },
    summary: { type: String, required: true },
    descr: { type: String },
    status: { type: Number, default: 20 },                  // 10 - PROGRESS, 20 - NEW, 30 - HOLD, 40 - READY, 50 - CLOSED
    priority: { type: Number, default: 4 },                 // 1 - Critical, 2 - High, 3 - Medium, 4 - Low
    //type: { type: String, default: 'TASK' },                // ISSUE, BUG
    external_code: { type: String },
    external_url: { type: String },
}, { timestamps: true });

issueSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            const project = await ProjectModel.findById(this.project_id);
            if (project) {

                const count = await NumberRangeModel.nextNumber(this.project_id);

                this.code = `${project.code}-${count}`;
                this.external_url = project.external_url;
            }
        }
        next();
    } catch (error) {
        // TO DO error
    }
});

module.exports = mongoose.model('Issue', issueSchema);