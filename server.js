var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var bcrypt = require('bcrypt');
var db = require('./db.js');
var middleware = require('./middleware.js')(db);
var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json()); //to accessing body json
app.get('/', function(req, res) {
    res.send('Todo api');
})

//GET todos?completed=true&q=string
app.get('/todos', middleware.requireAuthentication, function(req, res) {
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
            $like: '%' + query.q + '%'
        }
    }
    //added userId to where clause
    where.userId = req.user.get('id');

    db.todo.findAll({
        where: where
    }).then(function(todos) {
        res.json(todos);
    }, function(error) {
        res.status(500).send();
    });

});
//GET todos/:id

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var where = {};
    where.userId = req.user.get('id');
    where.id = todoId
    db.todo.findOne({
        where: where
    }).then(function(todo) {
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
app.post('/todos', middleware.requireAuthentication, function(req, res) {
    //cleanup post data using _.pick
    var todo = _.pick(req.body, 'completed', 'description');
    if (!_.isBoolean(todo.completed) || !_.isString(todo.description) || todo.description.trim().length === 0) {
        return res.status(400).send();
    }

    //create todo on DB
    db.todo.create({
            description: todo.description,
            completed: todo.completed
        })
        .then(function(todo) {
                if (todo) {

                    req.user.addTodo(todo).then(function() {
                        return todo.reload();
                    }).then(function(todo) {
                        res.json(todo.toJSON());
                    })
                } else {
                    res.status(400).send();
                }
            },
            function(error) {
                res.status(400).send();
            });


});
//delete todo
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    //
    var where = {};
    where.id = todoId;
    where.userId = req.user.get('id');
    db.todo.destroy({
        where: where
    }).then(function(rowsDeleted) {
        if (rowsDeleted == 0) {
            res.status(404).json({
                error: 'no todo with this id'
            });
        } else {
            res.status(200).send();
        }
    }, function(error) {
        res.status(500).send();
    });


});

//update todo
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10);

    //update todo in porstgres

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
    var where = {};
    where.id = todoId;
    where.userId = req.user.get('id');

    db.todo.findOne({
            where: where
        }).then(function(todo) {
            if (!!todo) {
                return todo.update(validAttributes);
            } else {
                res.status(404).send();
            }
        }, function(error) {
            res.status(500).send();
        })
        .then(function(todo) {
            res.json(todo.toJSON());
        }, function(error) {
            res.status(400).json(e);
        });


});

//save user
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    db.user.create(body).then(function(user) {
            if (!!user) {
                res.json(user.toPublicJSON());
            } else {
                res.status(400).send();
            }
        },
        function(error) {
            res.status(500).send();
        })

});

//user login
app.post('/users/login', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    var validAttributes = {};
    db.user.authenticate(body).then(function(user) {
        var token = user.generateToken('Authentication');
        if (token) {
            res.header('Auth', token).json(user.toPublicJSON());
        } else {
            res.status(401).send();
        }

    }, function() {
        res.status(401).send();
    })

})

//initialie DB
db.sequelize.sync({
    //force: true
}).then(function() {
    app.listen(port, function() {
        console.log('Server running on ' + port);
    });
});
