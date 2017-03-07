var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect' : 'sqlite',
    'storage' : __dirname+'/data/todo-api.sqlite'
});

var db = {};

//import to model
db.todo = sequelize.import(__dirname+'/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;