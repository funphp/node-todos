var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId =1;

app.use(bodyParser.json()); //to accessing body json
app.get('/', function(req, res) {
    res.send('Todo api');
})

//GET todos?completed=true&q=string
app.get('/todos', function(req, res){
    var query = req.query;
    var filteredTodos = todos;
    if(query.hasOwnProperty('completed') && query.completed == 'true') {
        filteredTodos = _.where(todos, {completed:true});
    } else if (query.hasOwnProperty('completed') && query.completed == 'false') {
        filteredTodos = _.where(todos, {completed:false});
    }
    if (query.hasOwnProperty('q') && query.q.trim().length > 0) {
        filteredTodos = _.filter(todos, function(val){
            return val.description.toLowerCase().indexOf(query.q.toLowerCase()) > -1;
        })
    }
    res.json(filteredTodos);
});
//GET todos/:id

app.get('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);

    var todo = _.findWhere(todos, {id:todoId});
    if (todo === '') {
        res.status(400).send();
    } else {
        res.json(todo);
    }

});

//new todo
app.post('/todos', function(req, res) {
    //cleanup post data using _.pick
    var todo = _.pick(req.body, 'completed', 'description');
    if(!_.isBoolean(todo.completed) || !_.isString(todo.description) || todo.description.trim().length ===0) {
        return res.status(400).send();
    }
    todo.description = todo.description.trim();
        todo.id = todoNextId;
        todoNextId++;
        todos.push(todo);
    res.json(todo);

});
//delete todo
app.delete('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var todo = _.findWhere(todos, {id:todoId});
    if(todo === '') {
        res.status(404).send();
    } else {
        todos = _.without(todos, todo);
         res.json(todo);
    }

});

//update todo
app.put('/todos/:id', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    var todoId = parseInt(req.params.id, 10);
    var todo = _.findWhere(todos, {id:todoId});

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
app.listen(port, function(){
    console.log('Server running on '+port);
});
