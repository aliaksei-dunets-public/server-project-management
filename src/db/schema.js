const mongoose = require('../libs/mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    code: { type: String, unique: true, required: true, uppercase: true },
    name: { type: String, required: true },
    descr: { type: String },
    status: { type: String, default: 'INACTIVE' },          // ACTIVE, INACTIVE, OBSOLETE
    external_code: { type: String },
    external_url: { type: String },
}, { timestamps: true });

const issueSchema = new Schema({
    project_id: { type: String, required: true, index: true },
    code: { type: String, uppercase: true },
    summary: { type: String, required: true },
    descr: { type: String },
    status: { type: String, default: 'NEW' },               // NEW, PROGRESS, CLOSED
    external_code: { type: String },
}, { timestamps: true });

const timelogSchema = new Schema({
    project_id: { type: String, required: true, index: true },
    issue_id: { type: String, required: true, index: true },
    dateLog: { type: Date, default: Date.now },
    valueLog: { type: Number },
    descr: { type: String },
}, { timestamps: true });


// // https://dou.ua/lenta/articles/quick-estimates/
// const estimationSchema = new Schema({
//     best: { type: Number },
//     nominal: { type: Number },
//     worst: { type: Number },
//     mean: { type: Number },                                 // M = (B + 4N + W)/6
//     deviation: { type: Number },                            // S = (W — B)/6 ... Project Standard Deviation = SQRT(SUM(S^2))
// });

const estimationSchema = new Schema({
    active: { type: Number },
});

const gradeSchema = new Schema({
    total: { type: Number },
    value: { type: Number },
    risk: { type: Number },
});

const projectionSchema = new Schema({
    code: { type: String, unique: true, required: true, uppercase: true },
    name: { type: String, required: true },
    descr: { type: String },
    status: { type: String, default: 'INACTIVE' },          // ACTIVE, INACTIVE, OBSOLETE
    estimation: estimationSchema,
}, { timestamps: true });

const versionSchema = new Schema({
    projection_id: { type: String, required: true, index: true },
    version: { type: Number, required: true },
    name: { type: String, required: true },
    descr: { type: String },
    status: { type: String, default: 'DRAFT' },               // ACTIVE, DRAFT, OBSOLETE  
    estimation: estimationSchema,
}, { timestamps: true });

const storySchema = new Schema({
    projection_id: { type: String, required: true, index: true },
    version_id: { type: String, required: true, index: true },
    code: { type: String, uppercase: true },
    summary: { type: String, required: true },
    descr: { type: String },
    estimation: estimationSchema,
}, { timestamps: true });

const taskSchema = new Schema({
    projection_id: { type: String, required: true, index: true },
    version_id: { type: String, required: true, index: true },
    story_id: { type: String, required: true, index: true },
    task_id: { type: String, index: true },
    level: { type: Number },
    code: { type: String, uppercase: true },
    summary: { type: String, required: true },
    descr: { type: String },
    status: { type: String, default: 'NEW' },               // NEW, PROGRESS, CLOSED    
    total: { type: Number },
    value: { type: Number },
    risk: { type: Number },
    estimation: estimationSchema,
}, { timestamps: true });

function calculateTotal(value = 0, risk = 0) {
    return value + (value * risk) / 100;
}

taskSchema.pre('save', async function () {
    try {
        const self = this;

        // Only Creation
        // if (this.isNew) {
        //     if (this.subtask_id) {
        //         const parent = await self.constructor.findById(this.subtask_id, { level: 1 });
        //         this.level = parent.level != undefined ? parent.level + 1 : undefined;
        //     }
        // }

        // Every Save
        this.total = calculateTotal(this.value, this.risk);
    } catch (error) {
        // TO DO error
    }
});


// function weightedArithmeticMean(b = 0, n = 0, w = 0) {
//     // M = (B + 4N + W)/6
//     return (b + 4 * n + w) / 6;
// }

// function standardDeviation(b = 0, w = 0) {
//     // S = (W — B)/6
//     return (w - b) / 6;
// }

// taskSchema.post('save', function (item) {
//     item.mean = weightedArithmeticMean(item.best, item.nominal, item.worst);
//     item.deviation = standardDeviation(item.best, item.worst);
// });

// taskSchema.post('save', function (item) {
//     item.mean = weightedArithmeticMean(item.best, item.nominal, item.worst);
//     item.deviation = standardDeviation(item.best, item.worst);
// });

module.exports = {
    ProjectModel: mongoose.model('Project', projectSchema),
    IssueModel: mongoose.model('Issue', issueSchema),
    TimelogModel: mongoose.model('Timelog', timelogSchema),
    ProjectionModel: mongoose.model('Projection', projectionSchema),
    VersionModel: mongoose.model('Version', versionSchema),
    StoryModel: mongoose.model('Story', storySchema),
    TaskModel: mongoose.model('Task', taskSchema),
}