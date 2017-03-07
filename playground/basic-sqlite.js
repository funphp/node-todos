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

sequelize.sync({
    //force: true
}).then(function(){
    console.log("Database Synced");

    Todo.findById(3).then(function(todo){
        if(todo) {
            console.log(todo.toJSON());
        } else {
            console.log('todo not found');
        }

    });

   /* Todo.create({
        description : 'Go to mosque',
        completed : true
    }).then(function(){
        return Todo.create({
            description: 'Go to Macca'
        });
    })
    .then(function(){
        //return Todo.findById(1);
        return Todo.findAll({
            where: {
                description : {
                    like : '%Ma%'
                }
            }
        });
    })
    .then(function(todos){
        if(todos) {
            todos.forEach(function(todo){
               console.log(todo.toJSON());
            })

        } else {
            console.log("Todo not found");
        }
    })
    .catch(function(e){
        console.log(e);
    });*/
});
