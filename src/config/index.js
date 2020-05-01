require('dotenv').config();

module.exports = {
    development: {
        database: {
            dsn: process.env.DEV_DB_DSN
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