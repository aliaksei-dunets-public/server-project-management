const mongoose = require('../../libs/mongoose');

const subIssueSchema = new mongoose.Schema({
    project_id: { type: String, required: true, index: true },
    issue_id: { type: String, required: true, index: true },
    summary: { type: String, required: true },
    descr: { type: String },
    status: { type: Number, default: 20 },                  // 10 - PROGRESS, 20 - NEW, 30 - HOLD, 40 - READY, 50 - CLOSED
    priority: { type: Number, default: 4 }                  // 1 - Critical, 2 - High, 3 - Medium, 4 - Low
}, { timestamps: true });

module.exports = mongoose.model('SubIssue', subIssueSchema);