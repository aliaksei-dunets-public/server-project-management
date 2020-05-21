const moment = require('moment');
const db = require('./schema');

const MODELS = {
    user: 'User',
    project: 'Project',
    issue: 'Issue',
    timelog: 'Timelog',
    projection: 'Projection',
    version: 'Version',
    story: 'Story',
    task: 'Task'
}

const FIELDS = {
    id: '_id',
    project_id: 'project_id',
    issue_id: 'issue_id',
    projection_id: 'projection_id',
    version_id: 'version_id',
    story_id: 'story_id',
    task_id: 'task_id',
}

class ControllerFactory {

    constructor() {
        this.controllers = {};
    }

    getInstance(modelName) {

        if (!modelName) throw new Error('Controller was not determined');

        if (!(modelName in this.controllers)) {
            this.controllers[modelName] = this._createController(modelName);
        }

        return this.controllers[modelName];
    }

    _createController(modelName) {
        let controller;

        switch (modelName) {
            case MODELS.user:
                controller = new ControllerUser();
                break;
            case MODELS.project:
                controller = new ControllerProject();
                break;
            case MODELS.issue:
                controller = new ControllerIssue();
                break;
            case MODELS.timelog:
                controller = new ControllerTimelog();
                break;
            case MODELS.projection:
                controller = new ControllerProjection();
                break;
            case MODELS.version:
                controller = new ControllerVersion();
                break;
            case MODELS.story:
                controller = new ControllerStory();
                break;
            case MODELS.task:
                controller = new ControllerTask();
                break;
            default:
                throw new Error('Controller was not determined');
        }

        return controller;
    }

}

class ControllerBase {

    constructor(model) {
        this.model = model;
        this.modelName = this.model.modelName;
    }

    _parseBody(body) {
        return body;
    }

    _whereOptions(query) {
        return query;
    }

    getParentModelId() {
        return FIELDS.id;
    }

    getRootModelId() {
        return FIELDS.id;
    }

    getUniqIds(nameId, documents) {
        const uniqIds = [];

        documents.forEach((item) => {
            if (uniqIds.includes(item[nameId], 0)) return;
            else uniqIds.push(item[nameId]);
        });

        return uniqIds;
    }

    getById(id) {
        try {
            return this.model.findById(id);
        } catch (error) {
            console.error(`Error during getById - ${error}`);
            return null;
        }
    }

    getOne(query) {
        try {
            return this.model.findOne(query);
        } catch (error) {
            console.error(`Error during getOne - ${error}`);
            return null;
        }
    }

    getAll(query) {
        try {
            return this.model.find(this._whereOptions(query));
        } catch (error) {
            console.error(`Error during getAll - ${error}`);
            return null;
        }
    }

    getAllByParent(id) {
        try {
            return this.model.find({ [this.getParentModelId()]: id });
        } catch (error) {
            console.error(`Error during getAllByParent - ${error}`);
            return null;
        }
    }

    getAllByRoot(id) {
        try {
            return this.model.find({ [this.getRootModelId()]: id });
        } catch (error) {
            console.error(`Error during getAllByRoot - ${error}`);
            return null;
        }
    }

    getByArrayIds(uniqIds) {
        if (uniqIds.length === 0) return [];
        return this.model.find({ [FIELDS.id]: { $in: uniqIds } });
    }

    createOne(body) {
        try {
            return new this.model(this._parseBody(body)).save();
        } catch (error) {
            console.error(`Error during createOne - ${error}`);
            return null;
        }
    }

    createMany(bodies) {
        try {
            return this.model.insertMany(bodies);
        } catch (error) {
            console.error(`Error during createMany - ${error}`);
            return null;
        }
    }

    async update(id, body) {

        const instance = await this.getById(id);
        if (!instance) throw new Error('Could not find the requested entry');

        try {
            Object.keys(body).forEach((key) => {

                // Check deep Objects and exclude Date type fields
                if (instance[key] instanceof Object && !instance[key].getTime) {
                    Object.keys(body[key]).forEach((deep_key) => {
                        if (deep_key in body[key] && body[key][deep_key] !== undefined) {
                            instance[key][deep_key] = body[key][deep_key];
                        }
                    });
                } else {
                    if (key in body && body[key] !== undefined) instance[key] = body[key];
                }
            });
            return instance.save();
        } catch (error) {
            console.error(`Error during update - ${error}`);
            return null;
        }
    }

    async deleteOne(id) {
        try {
            const instance = await this.getById(id);
            if (!instance) throw new Error('Could not find the requested entry');

            await this.model.deleteOne({ [FIELDS.id]: id });
            return instance;
        } catch (error) {
            console.error(`Error during deleteOne - ${error}`);
            return null;
        }
    }

    async deleteByParentId(id) {
        try {
            return await this.model.deleteMany({ [this.getParentModelId()]: id });
        } catch (error) {
            console.error(`Error during deleteByParentId - ${error}`);
            return null;
        }
    }

    async deleteByRootId(id) {
        try {
            return await this.model.deleteMany({ [this.getRootModelId()]: id });
        } catch (error) {
            console.error(`Error during deleteByRootId - ${error}`);
            return null;
        }
    }
}

class ControllerUser extends ControllerBase {
    constructor() {
        super(db.UserModel);
    }

    async checkToken(auth) {
        if(!auth) return null;
        const token = Buffer.from(auth, 'base64').toString('ascii');
        const data = token.split('__&&__');
        let user = await this.getOne({ email: data[0] });
        if (user && user.hashedPassword === data[1]) {
            return user
        } else return null;
    }

    async getOrCreateUser(email, password) {
        let user = await this.getOne({ email });
        // User doesn't exist into DB -> create a new user
        if (!user) {
            // user = await this.createOne({ email, password });
            return null;
        } else {
            // Check Password of exist user
            if (!user.checkPassword(password)) return null;
        }
        const hash = user.email + '__&&__' + user.hashedPassword;

        return Buffer.from(hash).toString('base64');
    }
}

class ControllerProject extends ControllerBase {
    constructor() {
        super(db.ProjectModel);
    }
}

class ControllerIssue extends ControllerBase {

    constructor() {
        super(db.IssueModel);
    }

    getParentModelId() {
        return FIELDS.project_id;
    }
}

class ControllerTimelog extends ControllerBase {

    constructor() {
        super(db.TimelogModel);
    }

    _parseStartDate(date) {
        const valueDate = date ? moment(date, 'YYYY-MM-DD', true) : moment().startOf('isoWeek');
        return valueDate.startOf('day');
    }

    _parseEndDate(date) {
        const valueDate = date ? moment(date, 'YYYY-MM-DD', true) : moment().endOf('isoWeek');
        return valueDate.endOf('day');
    }

    _whereOptions(query) {

        let whereOption = {};

        if (!query) return whereOption;

        if (query.project_id) whereOption.project_id = query.project_id;
        if (query.issue_id) whereOption.issue_id = query.issue_id;
        if (query.startDate && query.endDate) {
            whereOption.dateLog = {
                "$gte": this._parseStartDate(query.startDate),
                "$lte": this._parseEndDate(query.endDate)
            };
        }

        return whereOption;
    }

    getParentModelId() {
        return FIELDS.issue_id;
    }

    getRootModelId() {
        return FIELDS.project_id;
    }
}

class ControllerProjection extends ControllerBase {
    constructor() {
        super(db.ProjectionModel);
    }
}

class ControllerVersion extends ControllerBase {

    constructor() {
        super(db.VersionModel);
    }

    getParentModelId() {
        return FIELDS.projection_id;
    }

    getRootModelId() {
        return FIELDS.projection_id;
    }
}

class ControllerStory extends ControllerBase {

    constructor() {
        super(db.StoryModel);
    }

    getParentModelId() {
        return FIELDS.version_id;
    }

    getRootModelId() {
        return FIELDS.projection_id;
    }
}

class ControllerTask extends ControllerBase {

    constructor() {
        super(db.TaskModel);
    }

    getParentModelId() {
        return FIELDS.story_id;
    }

    getRootModelId() {
        return FIELDS.version_id;
    }

    getChildren(id) {
        return this.getAll({ [FIELDS.task_id]: id });
    }

    async deleteByProjection(id) {
        try {
            return await this.model.deleteMany({ [FIELDS.projection_id]: id });
        } catch (error) {
            console.error(`Error during deleteByProjection - ${error}`);
            return null;
        }
    }

    async deleteChildren(id) {
        // try {
        //     return await this.model.deleteMany({ [FIELDS.projection_id]: id });
        // } catch (error) {
        //     console.error(`Error during deleteByProjection - ${error}`);
        //     return null;
        // }
    }
}

module.exports = {
    MODELS,
    FIELDS,
    ControllerFactory
}

