var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;
var todos = [];
var todoNextId =1;

app.use(bodyParser.json()); //to accessing body json
app.get('/', function(req, res) {
    res.send('Todo api');
})

//GET todos
app.get('/todos', function(req, res){
    res.json(todos);
});
//GET todos/:id

app.get('/todos/:id', function(req, res){
    var todoId = req.params.id;
    var todo = '';
    for(var i in todos) {
        console.log(todos[i]);
        if(todos[i].id == todoId) {
            todo = todos[i];
        }
    }

    if (todo === '') {
        res.status(400).send();
    } else {
        res.json(todo);
    }

});

//new todo
app.post('/todos', function(req, res) {
    var todo = req.body;
        todo.id = todoNextId;
        todoNextId++;
        todos.push(todo);
    res.json(todo);

})
app.listen(port, function(){
    console.log('Server running on '+port);
});
