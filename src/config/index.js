require('dotenv').config();

module.exports = {
    development: {
        database: {
            dsn: 'mongodb://localhost:27017/dev-project-management'
        },
        PORT: process.env.PORT || '3005',
    },
    test: {
        database: {
            dsn: process.env.TEST_DB_DSN
        },
        PORT: process.env.PORT || '3010',
    },
    production: {
        database: {
            dsn: process.env.PRODUCTION_DB_DSN
        },
        PORT: process.env.PORT || '3015',
    },

}