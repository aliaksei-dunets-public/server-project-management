const { FIELDS, MODELS } = require('../db/controllers');

module.exports = {
    // Queries
    Query: {
        // Project
        project: (root, { id }, { dataSources }) => {
            if (!id) throw new Error(`Error during project query`);
            return dataSources.factory.getInstance(MODELS.project).getById(id);
        },
        projects: (root, params, { dataSources, user }) => {
            return dataSources.factory.getInstance(MODELS.project).getAll(params);
        },
        // Issue
        issue: (root, { id }, { dataSources }) => {
            if (!id) throw new Error(`Error during issue query`);
            return dataSources.factory.getInstance(MODELS.issue).getById(id);
        },
        issues: (root, params, { dataSources }) => {
            return dataSources.factory.getInstance(MODELS.issue).getAll(params);
        },
        // Timelog
        timelog: (root, { id }, { dataSources }) => {
            if (!id) throw new Error(`Error during timelog query`);
            return dataSources.factory.getInstance(MODELS.timelog).getById(id);
        },
        timelogs: (root, params, { dataSources }) => {
            return dataSources.factory.getInstance(MODELS.timelog).getAll(params);
        },
        // Timesheet
        timesheet: async (root, params, { dataSources }) => {

            let projects = [],
                issues = [],
                timelogs = [];

            const factory = dataSources.factory;
            const instanceTimelog = factory.getInstance(MODELS.timelog);
            timelogs = await instanceTimelog.getAll(params);

            if (!timelogs) return {};

            const issueUniqIds = instanceTimelog.getUniqIds(FIELDS.issue_id, timelogs);
            if (issueUniqIds) {
                issues = await factory.getInstance(MODELS.issue).getByArrayIds(issueUniqIds);
            }

            const projectUniqIds = instanceTimelog.getUniqIds(FIELDS.project_id, timelogs);
            if (projectUniqIds) {
                projects = await factory.getInstance(MODELS.project).getByArrayIds(projectUniqIds);
            }

            return {
                projects,
                issues,
                timelogs
            };
        },
        // Projection
        projection: (root, { id }, { dataSources }) => {
            if (!id) throw new Error(`Error during projection query`);
            return dataSources.factory.getInstance(MODELS.projection).getById(id);
        },
        projections: (root, params, { dataSources }) => {
            return dataSources.factory.getInstance(MODELS.projection).getAll(params);
        },
        // Version
        version: (root, { id }, { dataSources }) => {
            if (!id) throw new Error(`Error during version query`);
            return dataSources.factory.getInstance(MODELS.version).getById(id);
        },
        versions: (root, params, { dataSources }) => {
            return dataSources.factory.getInstance(MODELS.version).getAll(params);
        },
        // Story
        story: (root, { id }, { dataSources }) => {
            if (!id) throw new Error(`Error during story query`);
            return dataSources.factory.getInstance(MODELS.story).getById(id);
        },
        stories: (root, params, { dataSources }) => {
            return dataSources.factory.getInstance(MODELS.story).getAll(params);
        },
        // Task
        task: (root, { id }, { dataSources }) => {
            if (!id) throw new Error(`Error during task query`);
            return dataSources.factory.getInstance(MODELS.task).getById(id);
        },
        tasks: (root, params, { dataSources }) => {
            return dataSources.factory.getInstance(MODELS.task).getAll(params);
        },
    },

    // Mutation
    Mutation: {
        //login
        login: (root, { email, password }, { dataSources }) => {
            if (!email || !password) throw new Error(`Error during login mutation`);
            return dataSources.factory.getInstance(MODELS.user).getOrCreateUser(email, password);
        },

        // Project
        createProject: (root, { input }, { dataSources }) => {
            if (!input) throw new Error(`Error during createProject mutation`);
            return dataSources.factory.getInstance(MODELS.project).createOne(input);
        },
        updateProject: (root, { id, input }, { dataSources }) => {
            if (!id || !input) throw new Error(`Error during updateProject mutation`);
            return dataSources.factory.getInstance(MODELS.project).update(id, input);
        },
        deleteProject: async (root, { id, deleteChild }, { dataSources }) => {
            if (!id) throw new Error(`Error during deleteProject mutation`);

            const factory = dataSources.factory;

            // if (deleteChild) {
            await factory.getInstance(MODELS.timelog).deleteByRootId(id);
            await factory.getInstance(MODELS.issue).deleteByParentId(id);
            // }
            return factory.getInstance(MODELS.project).deleteOne(id);
        },
        // Issue
        createIssue: (root, { input }, { dataSources }) => {
            if (!input) throw new Error(`Error during createIssue mutation`);
            return dataSources.factory.getInstance(MODELS.issue).createOne(input);
        },
        updateIssue: (root, { id, input }, { dataSources }) => {
            if (!id || !input) throw new Error(`Error during updateIssue mutation`);
            return dataSources.factory.getInstance(MODELS.issue).update(id, input);
        },
        deleteIssue: async (root, { id, deleteChild }, { dataSources }) => {
            if (!id) throw new Error(`Error during deleteIssue mutation`);

            const factory = dataSources.factory;

            if (deleteChild) {
                await factory.getInstance(MODELS.timelog).deleteByParentId(id);
            }

            return factory.getInstance(MODELS.issue).deleteOne(id);
        },
        // Timelog
        createTimelog: (root, { input }, { dataSources }) => {
            if (!input) throw new Error(`Error during createTimelog mutation`);
            return dataSources.factory.getInstance(MODELS.timelog).createOne(input);
        },
        updateTimelog: (root, { id, input }, { dataSources }) => {
            if (!id || !input) throw new Error(`Error during updateTimelog mutation`);
            return dataSources.factory.getInstance(MODELS.timelog).update(id, input);
        },
        deleteTimelog: (root, { id }, { dataSources }) => {
            if (!id) throw new Error(`Error during deleteTimelog mutation`);
            return dataSources.factory.getInstance(MODELS.timelog).deleteOne(id);
        },
        // Projection
        createProjection: (root, { input }, { dataSources }) => {
            if (!input) throw new Error(`Error during createProjection mutation`);
            return dataSources.factory.getInstance(MODELS.projection).createOne(input);
        },
        updateProjection: (root, { id, input }, { dataSources }) => {
            if (!id || !input) throw new Error(`Error during updateProjection mutation`);
            return dataSources.factory.getInstance(MODELS.projection).update(id, input);
        },
        deleteProjection: async (root, { id, deleteChild }, { dataSources }) => {
            if (!id) throw new Error(`Error during deleteProjection mutation`);

            const factory = dataSources.factory;

            // if (fullDeletion) {
            //     await factory.getInstance(MODELS.timelog).deleteByRootId(id);
            //     await factory.getInstance(MODELS.issue).deleteByParentId(id);
            // }
            return factory.getInstance(MODELS.projection).deleteOne(id);
        },
        // Version
        createVersion: (root, { input }, { dataSources }) => {
            if (!input) throw new Error(`Error during createVersion mutation`);
            return dataSources.factory.getInstance(MODELS.version).createOne(input);
        },
        updateVersion: (root, { id, input }, { dataSources }) => {
            if (!id || !input) throw new Error(`Error during updateVersion mutation`);
            return dataSources.factory.getInstance(MODELS.version).update(id, input);
        },
        deleteVersion: async (root, { id, deleteChild }, { dataSources }) => {
            if (!id) throw new Error(`Error during deleteVersion mutation`);

            const factory = dataSources.factory;

            // if (fullDeletion) {
            //     await factory.getInstance(MODELS.timelog).deleteByRootId(id);
            //     await factory.getInstance(MODELS.issue).deleteByParentId(id);
            // }
            return factory.getInstance(MODELS.version).deleteOne(id);
        },
        // Story
        createStory: (root, { input }, { dataSources }) => {
            if (!input) throw new Error(`Error during createStory mutation`);
            return dataSources.factory.getInstance(MODELS.story).createOne(input);
        },
        updateStory: (root, { id, input }, { dataSources }) => {
            if (!id || !input) throw new Error(`Error during updateStory mutation`);
            return dataSources.factory.getInstance(MODELS.story).update(id, input);
        },
        deleteStory: async (root, { id, deleteChild }, { dataSources }) => {
            if (!id) throw new Error(`Error during deleteStory mutation`);

            const factory = dataSources.factory;

            // if (fullDeletion) {
            //     await factory.getInstance(MODELS.timelog).deleteByRootId(id);
            //     await factory.getInstance(MODELS.issue).deleteByParentId(id);
            // }
            return factory.getInstance(MODELS.story).deleteOne(id);
        },
        // Task
        createTask: (root, { input }, { dataSources }) => {
            if (!input) throw new Error(`Error during createTask mutation`);
            return dataSources.factory.getInstance(MODELS.task).createOne(input);
        },
        updateTask: (root, { id, input }, { dataSources }) => {
            if (!id || !input) throw new Error(`Error during updateTask mutation`);
            return dataSources.factory.getInstance(MODELS.task).update(id, input);
        },
        deleteTask: async (root, { id, deleteChild }, { dataSources }) => {
            if (!id) throw new Error(`Error during deleteTask mutation`);

            const factory = dataSources.factory;

            // if (fullDeletion) {
            //     await factory.getInstance(MODELS.timelog).deleteByRootId(id);
            //     await factory.getInstance(MODELS.issue).deleteByParentId(id);
            // }
            return factory.getInstance(MODELS.task).deleteOne(id);
        },
    },

    // Types
    Project: {
        issues: (root, params, { dataSources }) => {
            if (!root.id) throw new Error(`Error during Project-issues query`);
            return dataSources.factory.getInstance(MODELS.issue).getAllByParent(root.id);
        },
    },
    Issue: {
        timelogs: (root, params, { dataSources }) => {
            if (!root.id) throw new Error(`Error during IssueDetail-timelogs query`);
            return dataSources.factory.getInstance(MODELS.timelog).getAllByParent(root.id);
        },
    }
}