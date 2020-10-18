const pdf = require("pdf-creator-node");
const path = require('path');
const fs = require('fs');
const moment = require('moment');

module.exports = async (userId, { startDate, endDate }, timesheet) => {
    // Read HTML Template
    var htmlTemplate = fs.readFileSync(path.join(__dirname, '../../public/pdf_template.html'), 'utf8');

    var options = {
        format: "A4",
        orientation: "portrait",
        border: "10mm",
    }

    const projects = getProjectModel(timesheet);

    var document = {
        html: htmlTemplate,
        data: {
            title: `Time Report: ${moment(startDate).format('DD MMM YYYY')} - ${moment(endDate).format('DD MMM YYYY')}`,
            projects
        },
        path: path.join(__dirname, `../../public/output_${userId}.pdf`)
    };

    const file = await pdf.create(document, options);

    return {
        filename: path.basename(file.filename)
    }
}

const getProjectModel = ({ projects, issues, timelogs }) => {

    let projectModel = [];

    for (let j = 0; j < projects.length; j++) {

        let project = {
            code: projects[j].code,
            name: projects[j].name,
            descr: projects[j].descr,
            totalTime: 0,
            times: []
        };

        for (let i = 0; i < timelogs.length; i++) {

            if (projects[j].id == timelogs[i].project_id) {

                let issue = issues.find(issue => issue.id == timelogs[i].issue_id);

                project.times.push({
                    dateLog: moment(timelogs[i].dateLog).format('DD MMM YYYY, ddd'),
                    valueLog: timelogs[i].valueLog,
                    descr: timelogs[i].descr ? timelogs[i].descr : '',
                    issue_descr: `${issue.summary} (${issue.code})`
                });

                project.totalTime += timelogs[i].valueLog;

            }

        }

        projectModel.push(project);
    }

    return projectModel;
}

