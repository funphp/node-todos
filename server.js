var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json()); //to accessing body json
app.get('/', function(req, res) {
    res.send('Todo api');
})

//GET todos?completed=true&q=string
app.get('/todos', function(req, res) {
    var query = req.query;

    //get todos from DB
    var where = {};
    if (query.hasOwnProperty('completed') && query.completed == 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed == 'false') {
       where.completed = false;
    }
    if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
        where.description = {
            $like : '%'+query.q+'%'
        }
    }

    db.todo.findAll({where:where}).then(function(todos){
        res.json(todos);
    },function(error){
        res.status(500).send();
    });

});
//GET todos/:id

app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    /*var todo = _.findWhere(todos, {
        id: todoId
    });
    if (todo === '') {
        res.status(400).send();
    } else {
        res.json(todo);
    }*/
    db.todo.findById(todoId).then(function(todo){
        if (!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }

    }, function(error) {
        res.status(500).send();
    });

});

//new todo
app.post('/todos', function(req, res) {
    //cleanup post data using _.pick
    var todo = _.pick(req.body, 'completed', 'description');
    if (!_.isBoolean(todo.completed) || !_.isString(todo.description) || todo.description.trim().length === 0) {
        return res.status(400).send();
    }
    /*todo.description = todo.description.trim();
    todo.id = todoNextId;
    todoNextId++;
    todos.push(todo);*/
    //create todo on DB
    db.todo.create({
            description: todo.description,
            completed: todo.completed
        })
        .then(function(todo) {
                if (todo) {
                    res.json(todo.toJSON());
                } else {
                    res.status(400).send();
                }
            },
            function(error) {
                res.status(400).send();
            });


});
//delete todo
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    /*var todo = _.findWhere(todos, {
        id: todoId
    });

    if (todo === '') {
        res.status(404).send();
    } else {
        todos = _.without(todos, todo);
        res.json(todo);
    }*/
    //
   /* db.todo.findById(todoId).then(function(todo){
        todo.destroy()
    })*/

});

//update todo
app.put('/todos/:id', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10);
    var todo = _.findWhere(todos, {
        id: todoId
    });

    if (!todo) {
        return res.status(404).send();
    }
    var validAttributes = {};
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if (body.hasOwnProperty('completed')) {
        console.log('completed');
        return res.status(400).send();
    }

    if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        console.log('description');
        return res.status(400).send();
    }

    _.extend(todo, validAttributes);
    res.json(todo);

});

//initialie DB
db.sequelize.sync().then(function() {
    app.listen(port, function() {
        console.log('Server running on ' + port);
    });
});
