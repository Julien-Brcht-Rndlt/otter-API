const connection = require('./db-config');

connection.connect((err) => {
    if(err){
        console.error(`Error while connecting to database: ${err.message}`,`${err.stack}`);
    } else {
        console.log(`Connected to database with threadId: ${connection.threadId}`);
    }
});

module.exports = connection;