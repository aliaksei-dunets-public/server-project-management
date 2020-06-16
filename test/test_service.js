require('dotenv').config();
const { createTestClient } = require('apollo-server-testing');
const assert = require('assert');
const { ApolloServer } = require('apollo-server');

const typeDefs = require('../src/service/schema');
const resolvers = require('../src/service/resolvers');
const { ControllerFactory } = require('../src/db/controllers');

// Set up Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ factory: new ControllerFactory() }),
});

// Use the test server to create a query function
const { query, mutate } = createTestClient(server);

describe('Test Service - Time Tracking Project Functionality', () => {

    let testProject = {};
    let testIssue = {};
    let testTimelog = {};

    describe('Mutation - Create', () => {

        it('Create a Project', async () => {

            const { data: { createProject } } = await mutate({
                mutation: `mutation createProject($input:ProjectCreate){
                    createProject(input:$input) {
                      id
                      code
                      name
                      descr
                      status
                      external_code
                      external_url
                    }
                  }`,
                variables: {
                    input: {
                        code: "UNITTEST",
                        name: "Project Name Unit Test",
                        descr: "Project Description Unit Test",
                        status: "ACTIVE",
                        external_code: "UNIT"
                    }
                }
            });

            assert.ok(createProject, `Error during creation of a new Project`);
            assert.equal(createProject.code, 'UNITTEST', `Project code error`);

            testProject = createProject;
        });

        it('Create an Issue', async () => {

            const { data: { createIssue } } = await mutate({
                mutation: `mutation createIssue($input:IssueCreate){
                    createIssue(input:$input) {
                        id
                        project_id
                        code
                        summary
                        descr
                        status
                        external_code
                    }
                  }`,
                variables: {
                    input: {
                        project_id: testProject.id,
                        code: testProject.code,
                        summary: 'Issue Summary Unit Test',
                        descr: 'Issue Description Unit Test',
                        status: 'NEW',
                        external_code: testProject.external_code
                    }
                }
            });

            assert.ok(createIssue, `Error during creation of a new Issue`);
            assert.equal(createIssue.project_id, testProject.id, `Issue project_id error`);

            testIssue = createIssue;
        });

        it('Create a Timelog', async () => {

            const { data: { createTimelog } } = await mutate({
                mutation: `
                    mutation createTimelog($input:TimelogCreate) {
                        createTimelog(input:$input) {
                            id
                            project_id
                            issue_id
                            valueLog
                            descr
                        }
                    }`,
                variables: {
                    input: {
                        project_id: testProject.id,
                        issue_id: testIssue.id,
                        valueLog: 10,
                        descr: "Timelog Description Unit Test",
                    }
                }
            });

            assert.ok(createTimelog, `Error during creation of a new Timelog`);
            assert.equal(createTimelog.valueLog, 10, `Timelog valueLog error`);

            testTimelog = createTimelog;
        });

        it('Create Multi Timelogs', async () => {

            const { data: { createMultiTimelogs } } = await mutate({
                mutation: `
                    mutation createMultiTimelogs($input:[TimelogCreate]) {
                        createMultiTimelogs(input:$input) {
                            id
                            project_id
                            issue_id
                            valueLog
                            descr
                        }
                    }`,
                variables: {
                    input: [
                        {
                            project_id: testProject.id,
                            issue_id: testIssue.id,
                            valueLog: 10,
                            descr: "Timelog Description Unit Test",
                        },
                        {
                            project_id: testProject.id,
                            issue_id: testIssue.id,
                            valueLog: 20,
                            descr: "Timelog Description Unit Test",
                        },
                        {
                            project_id: testProject.id,
                            issue_id: testIssue.id,
                            valueLog: 30,
                            descr: "Timelog Description Unit Test",
                        }
                    ]
                }
            });

            assert.ok(createMultiTimelogs, `Error during creation of a new Multi Timelogs`);
            assert.equal(createMultiTimelogs.length, 3, `Timelogs array result error`);
        });
    });

    describe('Query - Multy Read', () => {

        it('Read Projects', async () => {

            const { data: { projects } } = await query({
                query: `{
                    projects {
                      id
                    }
                  }`
            });

            assert.ok(projects, `Error during read of the Projects`);
        });

        it('Read Issues', async () => {

            const { data: { issues } } = await query({
                query: `{
                    issues {
                        id
                        project_id
                    }
                }`
            });

            assert.ok(issues, `Error during read of the Issues`);
        });

        it('Read Timelogs', async () => {

            const { data: { timelogs } } = await query({
                query: `{
                    timelogs {
                      id
                    }
                  }`
            });

            assert.ok(timelogs, `Error during read of the Timelogs`);
        });

    });

    describe('Query - Single Read', () => {

        it('Read Project', async () => {

            const { data: { project } } = await query({
                query: `
                    query getProject($id: ID!) {
                        project(id: $id) {
                            code
                        }
                    }
                `,
                variables: { id: testProject.id }
            });

            assert.ok(project, `Error during read of the Project`);
            assert.equal(project.code, 'UNITTEST', `Project code error`);
        });

        it('Read Issue', async () => {

            const { data: { issue } } = await query({
                query: `
                    query getIssue($id: ID!) {
                        issue(id: $id) {
                            project_id
                        }
                    }
                `,
                variables: { id: testIssue.id }
            });

            assert.ok(issue, `Error during read of the Issue`);
            assert.equal(issue.project_id, testProject.id, `Issue project_id error`);
        });

        it('Read Timelog', async () => {

            const { data: { timelog } } = await query({
                query: `
                    query getTimelog($id: ID!) {
                        timelog(id: $id) {
                            id
                            valueLog
                        }
                    }
                `,
                variables: { id: testTimelog.id }
            });

            assert.ok(timelog, `Error during read of the Timelog`);
            assert.equal(timelog.valueLog, 10, `Timelog valueLog error`);
        });

    });

    describe('Mutation - update', () => {

        it('Update the Project', async () => {

            const { data: { updateProject } } = await mutate({
                mutation: `
                    mutation updateProject($id: ID!, $input: ProjectEdit) {
                        updateProject(id: $id, input: $input) {
                            code
                            status
                        }
                    }
                `,
                variables: {
                    id: testProject.id,
                    input: {
                        code: "UNITTEST_1000",
                        status: "OBSOLETE",
                    }
                }
            });

            assert.ok(updateProject, `Error during update of the Project`);
            assert.equal(updateProject.code, 'UNITTEST_1000', `Project code error`);
            assert.equal(updateProject.status, 'OBSOLETE', `Project status error`);

        });

        it('Update the Issue', async () => {

            const { data: { updateIssue } } = await mutate({
                mutation: `
                    mutation updateIssue($id: ID!, $input: IssueEdit) {
                        updateIssue(id: $id, input: $input) {
                            code
                            status
                            priority
                        }
                    }
                `,
                variables: {
                    id: testIssue.id,
                    input: {
                        code: "UNITTEST_1010",
                        status: "CLOSED",
                        priority: "MEDIUM"
                    }
                }
            });

            assert.ok(updateIssue, `Error during update of the Issue`);
            assert.equal(updateIssue.code, 'UNITTEST_1010', `Issue code error`);
            assert.equal(updateIssue.status, 'CLOSED', `Issue status error`);
            assert.equal(updateIssue.priority, 'MEDIUM', `Issue priority error`);

        });

        it('Update the Timelog', async () => {

            const { data: { updateTimelog } } = await mutate({
                mutation: `
                    mutation updateTimelog($id: ID!, $input: TimelogEdit) {
                        updateTimelog(id: $id, input: $input) {
                            valueLog
                        }
                    }
                `,
                variables: {
                    id: testTimelog.id,
                    input: {
                        valueLog: 100
                    }
                }
            });

            assert.ok(updateTimelog, `Error during update of the Timelog`);
            assert.equal(updateTimelog.valueLog, 100, `Timelog valueLog error`);

        });

    });

    describe('Mutation - delete', () => {

        it('Delete the Timelog', async () => {

            const { data: { deleteTimelog } } = await mutate({
                mutation: `
                    mutation deleteTimelog($id:ID!) {
                        deleteTimelog(id:$id) {
                            id
                        }
                    }
                `,
                variables: { id: testTimelog.id }
            });

            assert.ok(deleteTimelog, `Error during delete of the Timelog`);
        });

        it('Delete the Issue', async () => {

            const { data: { deleteIssue } } = await mutate({
                mutation: `
                    mutation deleteIssue($id:ID!) {
                        deleteIssue(id:$id) {
                            id
                        }
                    }
                `,
                variables: { id: testIssue.id }
            });

            assert.ok(deleteIssue, `Error during delete of the Issue`);
        });

        it('Delete the Project', async () => {

            const { data: { deleteProject } } = await mutate({
                mutation: `
                    mutation deleteProject($id:ID!,$deleteChild:Boolean) {
                        deleteProject(id:$id,deleteChild:$deleteChild) {
                            code
                        }
                    }
                `,
                variables: { id: testProject.id, deleteChild: true }
            });

            assert.ok(deleteProject, `Error during delete of the Project`);
        });

    });

});

describe('Test Service - Projection Estimation Functionality', () => {

    let testProjection = {};
    let testVersion = {};
    let testStory = {};
    let testTask = {};

    describe('Mutation - Create', () => {

        it('Create a Projection', async () => {

            const { data: { createProjection } } = await mutate({
                mutation: `mutation createProjection($input:ProjectionCreate){
                        createProjection(input:$input) {
                            id
                            code
                            name
                            descr
                            status
                        }
                    }`,
                variables: {
                    input: {
                        code: "UNITTEST01",
                        name: "Projection Name Unit Test 01",
                        descr: "Projection Description Unit Test 01",
                        status: "ACTIVE",
                    }
                }
            });

            assert.ok(createProjection, `Error during creation of a new Projection`);
            assert.equal(createProjection.code, 'UNITTEST01', `Projection code error`);

            testProjection = createProjection;
        });

        it('Create an Version', async () => {

            const { data: { createVersion } } = await mutate({
                mutation: `mutation createVersion($input:VersionCreate) {
                        createVersion(input:$input) {
                            id
                            projection_id
                            version
                            name
                            descr
                            status
                        }
                    }`,
                variables: {
                    input: {
                        projection_id: testProjection.id,
                        version: 1,
                        name: 'Version Name Unit Test',
                        descr: 'Version Description Unit Test',
                        status: 'ACTIVE',
                    }
                }
            });

            assert.ok(createVersion, `Error during creation of a new Version`);
            assert.equal(createVersion.projection_id, testProjection.id, `Version projection_id error`);

            testVersion = createVersion;
        });

        it('Create a Story', async () => {

            const { data: { createStory } } = await mutate({
                mutation: `
                    mutation createStory($input:StoryCreate) {
                        createStory(input:$input) {
                            id
                            projection_id
                            version_id
                            code
                            summary
                            descr
                        }
                    }`,
                variables: {
                    input: {
                        projection_id: testProjection.id,
                        version_id: testVersion.id,
                        code: testProjection.code,
                        summary: "Story Summary Unit Test",
                        descr: "Story Description Unit Test",
                    }
                }
            });

            assert.ok(createStory, `Error during creation of a new Story`);
            assert.equal(createStory.version_id, testVersion.id, `Story version_id error`);

            testStory = createStory;
        });

        it('Create a Task', async () => {

            const { data: { createTask } } = await mutate({
                mutation: `
                    mutation createTask($input:TaskCreate) {
                        createTask(input:$input) {
                            id
                            projection_id
                            version_id
                            story_id
                            code
                            summary
                            descr
                            status
                            value
                            risk
                        }
                    }`,
                variables: {
                    input: {
                        projection_id: testProjection.id,
                        version_id: testVersion.id,
                        story_id: testStory.id,
                        code: testProjection.code,
                        summary: "Task Summary Unit Test",
                        descr: "Task Description Unit Test",
                        status: "NEW",
                        value: 100,
                        risk: 30
                    }
                }
            });

            assert.ok(createTask, `Error during creation of a new Task`);
            assert.equal(createTask.story_id, testStory.id, `Task story_id error`);

            testTask = createTask;
        });
    });

    describe('Query - Multy Read', () => {

        it('Read Projections', async () => {

            const { data: { projections } } = await query({
                query: `{
                    projections {
                      id
                    }
                  }`
            });

            assert.ok(projections, `Error during read of the Projections`);
        });

        it('Read Versions', async () => {

            const { data: { versions } } = await query({
                query: `{
                    versions {
                        id
                        projection_id
                    }
                }`
            });

            assert.ok(versions, `Error during read of the Versions`);
        });

        it('Read Stories', async () => {

            const { data: { stories } } = await query({
                query: `{
                    stories {
                      id
                    }
                  }`
            });

            assert.ok(stories, `Error during read of the Stories`);
        });

        it('Read Tasks', async () => {

            const { data: { tasks } } = await query({
                query: `{
                    tasks {
                      id
                    }
                  }`
            });

            assert.ok(tasks, `Error during read of the Tasks`);
        });

    });

    describe('Query - Single Read', () => {

        it('Read Projection', async () => {

            const { data: { projection } } = await query({
                query: `
                    query getProjection($id: ID!) {
                        projection(id: $id) {
                            code
                        }
                    }
                `,
                variables: { id: testProjection.id }
            });

            assert.ok(projection, `Error during read of the Projection`);
            assert.equal(projection.code, 'UNITTEST01', `Projection code error`);
        });

        it('Read Version', async () => {

            const { data: { version } } = await query({
                query: `
                    query getVersion($id: ID!) {
                        version(id: $id) {
                            projection_id
                        }
                    }
                `,
                variables: { id: testVersion.id }
            });

            assert.ok(version, `Error during read of the Version`);
            assert.equal(version.projection_id, testProjection.id, `Version projection_id error`);
        });

        it('Read Story', async () => {

            const { data: { story } } = await query({
                query: `
                    query getStory($id: ID!) {
                        story(id: $id) {
                            id                            
                        }
                    }
                `,
                variables: { id: testStory.id }
            });

            assert.ok(story, `Error during read of the Story`);
            assert.equal(story.id, testStory.id, `Story id error`);
        });

        it('Read Task', async () => {

            const { data: { task } } = await query({
                query: `
                    query getTask($id: ID!) {
                        task(id: $id) {
                            id                            
                        }
                    }
                `,
                variables: { id: testTask.id }
            });

            assert.ok(task, `Error during read of the Task`);
            assert.equal(task.id, testTask.id, `Task id error`);
        });

    });

    describe('Mutation - update', () => {

        it('Update the Projection', async () => {

            const { data: { updateProjection } } = await mutate({
                mutation: `
                    mutation updateProjection($id: ID!, $input: ProjectionEdit) {
                        updateProjection(id: $id, input: $input) {
                            code
                            status
                        }
                    }
                `,
                variables: {
                    id: testProjection.id,
                    input: {
                        code: "UNITTEST_1000",
                        status: "OBSOLETE",
                    }
                }
            });

            assert.ok(updateProjection, `Error during update of the Projection`);
            assert.equal(updateProjection.code, 'UNITTEST_1000', `Projection code error`);
            assert.equal(updateProjection.status, 'OBSOLETE', `Projection status error`);

        });

        it('Update the Version', async () => {

            const { data: { updateVersion } } = await mutate({
                mutation: `
                    mutation updateVersion($id: ID!, $input: VersionEdit) {
                        updateVersion(id: $id, input: $input) {
                            version
                            status
                        }
                    }
                `,
                variables: {
                    id: testVersion.id,
                    input: {
                        version: 2,
                        status: "OBSOLETE",
                    }
                }
            });

            assert.ok(updateVersion, `Error during update of the Version`);
            assert.equal(updateVersion.version, 2, `Version version error`);
            assert.equal(updateVersion.status, 'OBSOLETE', `Version status error`);

        });

        it('Update the Story', async () => {

            const { data: { updateStory } } = await mutate({
                mutation: `
                    mutation updateStory($id: ID!, $input: StoryEdit) {
                        updateStory(id: $id, input: $input) {
                            code
                        }
                    }
                `,
                variables: {
                    id: testStory.id,
                    input: {
                        code: 'CHANGEDCODE'
                    }
                }
            });

            assert.ok(updateStory, `Error during update of the Story`);
            assert.equal(updateStory.code, 'CHANGEDCODE', `Story code error`);

        });

        it('Update the Task', async () => {

            const { data: { updateTask } } = await mutate({
                mutation: `
                    mutation updateTask($id: ID!, $input: TaskEdit) {
                        updateTask(id: $id, input: $input) {
                            code
                        }
                    }
                `,
                variables: {
                    id: testTask.id,
                    input: {
                        code: 'CHANGEDCODE'
                    }
                }
            });

            assert.ok(updateTask, `Error during update of the Task`);
            assert.equal(updateTask.code, 'CHANGEDCODE', `Task code error`);

        });

    });

    describe('Mutation - delete', () => {

        it('Delete the Projection', async () => {

            const { data: { deleteProjection } } = await mutate({
                mutation: `
                    mutation deleteProjection($id:ID!) {
                        deleteProjection(id:$id) {
                            code
                        }
                    }
                `,
                variables: { id: testProjection.id }
            });

            assert.ok(deleteProjection, `Error during delete of the Projection`);
        });

        it('Delete the Version', async () => {

            const { data: { deleteVersion } } = await mutate({
                mutation: `
                    mutation deleteVersion($id:ID!) {
                        deleteVersion(id:$id) {
                            id
                        }
                    }
                `,
                variables: { id: testVersion.id }
            });

            assert.ok(deleteVersion, `Error during delete of the Version`);
        });

        it('Delete the Story', async () => {

            const { data: { deleteStory } } = await mutate({
                mutation: `
                    mutation deleteStory($id:ID!) {
                        deleteStory(id:$id) {
                            id
                        }
                    }
                `,
                variables: { id: testStory.id }
            });

            assert.ok(deleteStory, `Error during delete of the Story`);
        });

        it('Delete the Task', async () => {

            const { data: { deleteTask } } = await mutate({
                mutation: `
                    mutation deleteTask($id:ID!) {
                        deleteTask(id:$id) {
                            id
                        }
                    }
                `,
                variables: { id: testTask.id }
            });

            assert.ok(deleteTask, `Error during delete of the Task`);
        });

    });

});
