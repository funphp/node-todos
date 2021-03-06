var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'developement';
var sequelize;
if (env === 'production') {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        'dialect': 'postgres'
    });
} else {
    sequelize = new Sequelize(undefined, undefined, undefined, {
        'dialect': 'sqlite',
        'storage': __dirname + '/data/todo-api.sqlite'
    });
}


var db = {};

//import to model
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.user = sequelize.import(__dirname+'/models/user.js');
db.token = sequelize.import(__dirname+'/models/token.js');

//assciation
db.user.hasMany(db.todo);
db.todo.belongsTo(db.user);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
