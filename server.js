var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var todos = [{
    id : 1,
    description: 'Meet mom for lunch',
    complete : false
},
{
    id : 2,
    description: 'Go to marker',
    complete : false
},
{
    id : 3,
    description: 'Going to mosque',
    complete : true
}];

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
app.listen(port, function(){
    console.log('Server running on '+port);
});
