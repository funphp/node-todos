var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect' : 'sqlite',
    'storage' : __dirname+'/basic-sqlite.sqlite'
});

var Todo = sequelize.define('todo', {
    description : {
        type: Sequelize.STRING,
        allowNull: false,
        validate : {
            len : [1, 250]
        }
    },
    completed : {
        type: Sequelize.BOOLEAN,
        allowNull : false,
        defaultValue : false
    }
});

var User = sequelize.define('user', {
    email:{
        type:Sequelize.STRING,

    }
});
Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
    //force: true
}).then(function(){
    console.log("Database Synced");

    User.findById(1).then(function(user){
        return user.getTodos({
            where:{
                completed:false
            }
        });
    }). then(function(todos){
        todos.forEach(function(todo){
            console.log(todo.toJSON());
        });

    })
    /*User.create({
        email:'ab.duetcse@gmail.com'
    }). then(function(user){
        return Todo.create({
            description:'test1',
            completed:false
        });
    })
    .then(function(todo){
        User.findById(1).then(function(user){
            user.addTodo(todo);
        })
    });*/
});
