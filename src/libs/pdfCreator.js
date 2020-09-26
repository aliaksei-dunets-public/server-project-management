const pdf = require("pdf-creator-node");
const path = require('path');
const fs = require('fs');

module.exports = () => {
    // Read HTML Template
    var htmlTemplate = fs.readFileSync(path.join(__dirname, '../public/pdf_template.html'), 'utf8');

    var options = {
        format: "A3",
        orientation: "portrait",
        border: "10mm",
        header: {
            height: "45mm",
            contents: '<div style="text-align: center;">Author: Aliaksei Dunets</div>'
        },
        "footer": {
            "height": "28mm",
            "contents": {
                first: 'Cover page',
                2: 'Second page', // Any page number is working. 1-based index
                default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
                last: 'Last Page'
            }
        }
    }

    var users = [
        {
            name: "Shyam",
            age: "26"
        },
        {
            name: "Navjot",
            age: "26"
        },
        {
            name: "Vitthal",
            age: "26"
        }
    ]

    var document = {
        html: htmlTemplate,
        data: {
            users: users
        },
        path: path.join(__dirname, '../public/output.pdf')
    };

    return pdf.create(document, options);

}

