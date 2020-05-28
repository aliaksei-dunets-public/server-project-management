const { gql } = require('apollo-server');

const typeDefs = gql`

    scalar Date
    scalar DateTime

    enum Model {
        PROJECT
        TASK
        PROJECTION
        VERSION
    }

    enum ProjectStatus {
        INACTIVE
        ACTIVE        
        OBSOLETE
    }

    enum IssueStatus {
        NEW
        PROGRESS
        CLOSED
    }

    enum ProjectionStatus {
        INACTIVE
        ACTIVE        
        OBSOLETE
    }

    enum VersionStatus {
        DRAFT
        ACTIVE        
        OBSOLETE
    }

    enum TaskStatus {
        NEW
        PROGRESS
        CLOSED
    }

    type ValueHelp {
        code: String
        descr: String
    }

    type Estimation {
        active: Float
    }

    type Project {
        id: ID
        code: String
        name: String
        descr: String
        status: ProjectStatus
        external_code: String
        external_url: String
        createdAt: DateTime
        updatedAt: DateTime
        issues: [Issue]
    }

    type Issue {
        id: ID
        project_id: ID
        code: String
        summary: String
        descr: String
        status: IssueStatus
        external_code: String
        external_url: String
        createdAt: DateTime
        updatedAt: DateTime
        timelogs: [Timelog]
    }

    type Timelog {
        id: ID
        project_id: ID
        issue_id: ID
        dateLog: DateTime
        valueLog: Float
        descr: String
        createdAt: DateTime
        updatedAt: DateTime
    }

    type Timesheet {
        projects: [Project]
        issues: [Issue]
        timelogs: [Timelog]
    }

    type Projection {
        id: ID
        code: String
        name: String
        descr: String
        status: ProjectionStatus
        estimation: Estimation
    }

    type ProjectionDetail {
        id: ID
        code: String
        name: String
        descr: String
        status: ProjectionStatus
        estimation: Estimation
        active_version: VersionDetail
        versions: [Version]
    }

    type Version {
        id: ID
        projection_id: ID
        version: Int
        name: String
        descr: String
        status: VersionStatus
        estimation: Estimation
    }

    type VersionDetail {
        id: ID
        projection_id: ID
        version: Int
        name: String
        descr: String
        status: VersionStatus
        estimation: Estimation
        stories: [Story]
    }

    type Story {
        id: ID
        projection_id: ID
        version_id: ID
        code: String
        summary: String
        descr: String
        estimation: Estimation
    }

    type StoryDetail {
        id: ID
        projection_id: ID
        version_id: ID
        code: String
        summary: String
        descr: String
        estimation: Estimation
        tasks: [Task]
    }

    type Task {
        id: ID
        projection_id: ID
        version_id: ID
        story_id: ID
        task_id: ID
        level: Int
        code: String
        summary: String
        descr: String
        status: TaskStatus
        total: Float
        value: Float
        risk: Float
        estimation: Estimation
    }

    type TaskDetail {
        id: ID
        projection_id: ID
        version_id: ID
        story_id: ID
        task_id: ID
        level: Int
        code: String
        summary: String
        descr: String
        status: TaskStatus
        total: Float
        value: Float
        risk: Float
        estimation: Estimation
        children: [Task]
    }

    input ProjectCreate {
        code: String!
        name: String!
        descr: String
        status: ProjectStatus
        external_code: String
        external_url: String
    }

    input ProjectEdit {
        code: String
        name: String
        descr: String
        status: ProjectStatus
        external_code: String
        external_url: String
    }
    
    input IssueCreate {
        project_id: ID!
        code: String
        summary: String!
        descr: String
        status: IssueStatus
        external_code: String
        external_url: String
    }

    input IssueEdit {
        project_id: ID
        code: String
        summary: String
        descr: String
        status: IssueStatus
        external_code: String
        external_url: String
    }

    input TimelogCreate {
        project_id: ID!
        issue_id: ID!
        dateLog: Date
        valueLog: Float!
        descr: String
    }

    input TimelogEdit {
        project_id: ID
        issue_id: ID
        dateLog: Date
        valueLog: Float
        descr: String
    }

    input ProjectionCreate {
        code: String!
        name: String!
        descr: String
        status: ProjectionStatus
    }

    input ProjectionEdit {
        code: String
        name: String
        descr: String
        status: ProjectionStatus
    }

    input VersionCreate {
        projection_id: ID!
        version: Int
        name: String
        descr: String
        status: VersionStatus
    }

    input VersionEdit {
        projection_id: ID
        version: Int
        name: String
        descr: String
        status: VersionStatus
    }

    input StoryCreate {
        projection_id: ID!
        version_id: ID!
        code: String!
        summary: String
        descr: String
    }

    input StoryEdit {
        projection_id: ID
        version_id: ID
        code: String
        summary: String
        descr: String
    }

    input TaskCreate {
        projection_id: ID!
        version_id: ID!
        story_id: ID!
        task_id: ID
        level: Int
        code: String
        summary: String
        descr: String
        status: TaskStatus
        value: Float
        risk: Float
    }

    input TaskEdit {
        projection_id: ID
        version_id: ID
        story_id: ID
        task_id: ID
        level: Int
        code: String
        summary: String
        descr: String
        status: TaskStatus
        value: Float
        risk: Float
    }

    type Query {
        statuses(model: Model!): [ValueHelp]

        project(id: ID!): Project
        projects(status: ProjectStatus): [Project]

        issue(id: ID!): Issue
        issues(status: IssueStatus, project_id: String): [Issue]
        
        timelog(id: ID!): Timelog
        timelogs(project_id: String, issue_id: String, startDate: Date, endDate: Date): [Timelog]        
        timesheet(startDate: Date, endDate: Date):Timesheet

        projection(id: ID!): ProjectionDetail
        projections(status: ProjectionStatus): [Projection]
        
        version(id: ID!): VersionDetail
        versions(status: VersionStatus, projection_id: ID): [Version]
        
        story(id: ID!): StoryDetail
        stories(version_id: ID, projection_id: ID): [Story]
        
        task(id: ID!): TaskDetail
        tasks(status:TaskStatus, story_id: ID, version_id: ID): [Task]        
    }

    type Mutation {
        login(email:String!, password: String!): String # login token

        createProject(input:ProjectCreate): Project
        updateProject(id:ID!, input:ProjectEdit): Project
        deleteProject(id:ID!, deleteChild:Boolean): Project

        createIssue(input:IssueCreate): Issue
        updateIssue(id:ID!, input:IssueEdit): Issue
        deleteIssue(id:ID!, deleteChild:Boolean): Issue

        createTimelog(input:TimelogCreate): Timelog
        createMultiTimelogs(input:[TimelogCreate]): [Timelog]
        updateTimelog(id:ID!, input:TimelogEdit): Timelog
        deleteTimelog(id:ID!): Timelog

        createProjection(input:ProjectionCreate): Projection
        updateProjection(id:ID!, input:ProjectionEdit): Projection
        deleteProjection(id:ID!): Projection

        createVersion(input:VersionCreate): Version
        updateVersion(id:ID!, input:VersionEdit): Version
        deleteVersion(id:ID!): Version

        createStory(input:StoryCreate): Story
        updateStory(id:ID!, input:StoryEdit): Story
        deleteStory(id:ID!): Story
        
        createTask(input:TaskCreate): Task
        updateTask(id:ID!, input:TaskEdit): Task
        deleteTask(id:ID!): Task
        cutOffTask(id:ID!): Task
    }
`;

module.exports = typeDefs;
