require('dotenv').config();
const assert = require('assert');
const { ControllerFactory, MODELS } = require('../src/db/controllers');

const factory = new ControllerFactory();

describe('Test DB Model - Time Tracking Project Functionality', () => {

    let project;
    let issue;
    let timelog;
    
    const projectController = factory.getInstance(MODELS.project);
    const issueController = factory.getInstance(MODELS.issue);
    const timelogController = factory.getInstance(MODELS.timelog);

    describe('Create instances of the Models', () => {

        it('Create a Project', async () => {
            const body = {
                code: 'TST01',
                name: 'Test Project 001',
                descr: 'My first test project',
                external_code: 'TST',
                external_url: 'www.test.com',
            };

            project = await projectController.createOne(body);

            assert.ok(project, `Error during creation of a new Project`);
            assert.equal(project.code, 'TST01', `Project code error`);
            assert.equal(project.external_code, 'TST', `Project external code error`);
        });

        it('Create a Issue', async () => {
            const body = {
                project_id: project._id,
                summary: 'Test Issue 001',
                descr: 'My Test Issue 001',
                external_code: 'TST001',
                external_url: 'www.test.com',
            };

            issue = await issueController.createOne(body);

            assert.ok(issue, `Error during creation of a new Issue`);
            assert.equal(issue.code, 'TST01-1', `Issue code error`);
        });

        it('Create a Timelog', async () => {
            const body = {
                project_id: project._id,
                issue_id: issue._id,
                valueLog: 10,
                descr: 'My Test Timelog 001',
            };

            timelog = await timelogController.createOne(body);

            assert.ok(timelog, `Error during creation of a new Timelog`);
            assert.equal(timelog.valueLog, 10, `Timelog valueLog error`);
        });

        it('Create MANY Issues and Timelogs', async () => {

            let bodiesTimelogs = [];
            const bodies = [{
                project_id: project._id,
                code: project.code,
                summary: 'Test Issue 002',
            },
            {
                project_id: project._id,
                code: project.code,
                summary: 'Test Issue 003',
            }];

            const arrayIssueIds = await issueController.createMany(bodies);
            assert.ok(arrayIssueIds, `Error during creation of many Issues`);

            arrayIssueIds.forEach(item => {
                bodiesTimelogs.push({
                    project_id: project._id,
                    issue_id: item._id,
                    valueLog: 10,
                    descr: 'My Test Timelog 001',
                });
            });

            const arrayTimelogsIds = await timelogController.createMany(bodiesTimelogs);
            assert.ok(arrayTimelogsIds, `Error during creation of many Timelogs`);

        });

    });

    describe('Update instances of the Models', () => {
        it('Update the Project', async () => {
            assert.ok(project, `Error during creation of Project`);
            const body = {
                code: 'TST011',
                status: 'ACTIVE',
                external_code: 'TST1',
            };

            const instance = await projectController.update(project._id, body);
            assert.ok(instance, `Error during update of the Project`);
            assert.equal(instance.code, 'TST011', `Project code error`);
            assert.equal(instance.status, 'ACTIVE', `Project status error`);
            assert.equal(instance.external_code, 'TST1', `Project external code error`);
        });

        it('Update the Issue', async () => {
            assert.ok(issue, `Error during creation of a new Issue`);

            const body = {
                external_code: 'TST0011',
            };

            const instance = await issueController.update(issue._id, body);

            assert.ok(instance, `Error during update of the Issue`);
            assert.equal(instance.external_code, 'TST0011', `Issue external code error`);
        });

        it('Update the Timelog', async () => {
            assert.ok(timelog, `Error during creation of a new Timelog`);

            const body = {
                valueLog: 100,
            };

            const instance = await timelogController.update(timelog._id, body);

            assert.ok(instance, `Error during update of the Issue`);
            assert.equal(instance.valueLog, 100, `Timelog valueLog error`);
        });
    });

    describe('Delete instances of the Models', () => {

        it('Delete the Project', async () => {
            assert.ok(project, `Error during creation of Project`);
            assert.ok(await projectController.deleteOne(project._id), `Error during <Delete the Project> of the Project`);
        });

        it('Delete the Issue', async () => {
            assert.ok(issue, `Error during creation of a new Issue`);
            assert.ok(await issueController.deleteOne(issue._id), `Error during <Delete the Issue> of the Issue`);
        });

        it('Delete the Timelog', async () => {
            assert.ok(timelog, `Error during creation of a new Timelog`);
            assert.ok(await timelogController.deleteOne(timelog._id), `Error during <Delete the Timelog> of the Issue`);
        });

        it('Delete the whole Project, Issues and Timelogs', async () => {
            assert.ok(await issueController.deleteByParentId(project._id),
                `Error during <Delete> of all Issues`);

            assert.ok(await timelogController.deleteByRootId(project._id),
                `Error during <Delete> of all Timelogs`);
        });
    });
});

describe('Test DB Model - Estimation Projection Functionality', () => {

    const projectionController = factory.getInstance(MODELS.projection);
    const versionController = factory.getInstance(MODELS.version);
    const storyController = factory.getInstance(MODELS.story);
    const taskController = factory.getInstance(MODELS.task);

    let projection;
    let version;
    let story;
    let task;

    describe('Create instances of the Models', () => {

        it('Create a Projection', async () => {
            const body = {
                code: 'TST01',
                name: 'Test projectionion 001',
                descr: 'My first test projectionion',
            };

            projection = await projectionController.createOne(body);

            assert.ok(projection, `Error during creation of a new Projection`);
            assert.equal(projection.code, 'TST01', `Projection code error`);
        });

        it('Create a Version', async () => {
            const body = {
                projection_id: projection._id,
                version: 1,
                name: 'Test Version 1',
                descr: 'My Test Version 1',
                estimation: {
                    active: 30
                }
            };

            version = await versionController.createOne(body);

            assert.ok(version, `Error during creation of a new Version`);
            assert.equal(version.estimation.active, 30, `Version estimation.active error`);
        });

        it('Create a Story', async () => {
            const body = {
                projection_id: projection._id,
                version_id: version._id,
                summary: 'Test Story 001',
                descr: 'My Test Story 001',
                estimation: {
                    active: 13
                }
            };

            story = await storyController.createOne(body);

            assert.ok(story, `Error during creation of a new Story`);
            assert.equal(story.estimation.active, 13, `Story grade.total error`);
        });

        it('Create a Task', async () => {
            const body = {
                projection_id: projection._id,
                version_id: version._id,
                story_id: story._id,
                code: projection.code,
                summary: 'Test task 001',
                descr: 'My Test task 001',
                value: 10,
                risk: 30
            };

            task = await taskController.createOne(body);

            assert.ok(task, `Error during creation of a new Task`);
            assert.equal(task.value, 10, `Task grade.value error`);
            assert.equal(task.total, 13, `Task grade.total error`);
        });

    });

    describe('Update instances of the Models', () => {
        it('Update the Projection', async () => {
            assert.ok(projection, `Error during creation of Projection`);
            const body = {
                code: 'TST011',
                status: 'ACTIVE',
            };

            const instance = await projectionController.update(projection._id, body);
            assert.ok(instance, `Error during update of the Projection`);
            assert.equal(instance.code, 'TST011', `Projection code error`);
            assert.equal(instance.status, 'ACTIVE', `Projection status error`);
        });

        it('Update the Version', async () => {
            assert.ok(version, `Error during creation of a new Version`);

            const body = {
                estimation: {
                    active: 130
                }
            };

            const instance = await versionController.update(version._id, body);

            assert.ok(instance, `Error during update of the Version`);
            assert.equal(instance.estimation.active, 130, `Version valueLog error`);
        });

        it('Update the Story', async () => {
            const body = {
                estimation: {
                    active: 15
                }
            };

            const instance = await storyController.update(story._id, body);

            assert.ok(instance, `Error during update of a new Story`);
            assert.equal(instance.estimation.active, 15, `Story estimation.active error`);
        });

        it('Update the Task', async () => {
            assert.ok(task, `Error during creation of a new Task`);

            const body = {
                value: 100
            };

            const instance = await taskController.update(task._id, body);

            assert.ok(instance, `Error during update of the Task`);
            assert.equal(instance.value, 100, `Task grade.value error`);
            assert.equal(instance.total, 130, `Task grade.total error`);
        });

    });

    describe('Delete instances of the Models', () => {

        it('Delete the Projection', async () => {
            assert.ok(projection, `Error during creation of projection`);
            assert.ok(await projectionController.deleteOne(projection._id), `Error during <Delete> of the projection`);
        });

        it('Delete the Version', async () => {
            assert.ok(version, `Error during creation of a new Version`);
            assert.ok(await versionController.deleteOne(version._id), `Error during <Delete> of the Version`);
        });

        it('Delete the Story', async () => {
            assert.ok(story, `Error during creation of a new Story`);
            assert.ok(await storyController.deleteOne(story._id), `Error during <Delete> of the Story`);
        });

        it('Delete the Task', async () => {
            assert.ok(task, `Error during creation of a new Task`);
            assert.ok(await taskController.deleteOne(task._id), `Error during <Delete> of the Task`);
        });

    });
});
