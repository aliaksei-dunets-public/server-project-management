const mongoose = require('mongoose');

const config = require('../config/index')[process.env.NODE_ENV || 'development'];

mongoose.connect(config.database.dsn, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database MongoDB connection error:'));

module.exports = mongoose;