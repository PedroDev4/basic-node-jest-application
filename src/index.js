const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Users = {
 *  id: uuid
 *  name -  string
 *  username - string
 *  todos []
 * }
 */

 const users = [];

function checksExistsUserAccount(request, response, next) {
   const { username } = request.headers;
   const user = users.find(user => user.username === username) 

   if(!user) {
     return response.status(404).json({error: "User does not exists! "})
   } 

   request.user = user;

   return next();
}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({error: "User Already Exists!"});
  } 

  const user = {
    id: uuidv4(),
    name, 
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todoAdd = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  } 

  user.todos.push(todoAdd); 
  return response.status(201).json(todoAdd);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoExists = user.todos.find( todo => todo.id === id); // SELECT * FROM TODOS WHERE TODO.ID = ID RECEBIDO NOS PARAMS

  // Find -> retorna bool
  //

  if(!todoExists) { 
    return response.status(404).json({error: "ID To-Do was not found."})
  }

  console.log(todoExists) // Returning an Object 
 
  todoExists.title = title;
  todoExists.deadline = deadline;
  return response.json(todoExists);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.findIndex( todo => todo.id === id); // Find index retorna a posição do todo no Array / se ele nao achar ele retorna -1

  if(todoExists < 0) { 
    return response.status(404).json({error: " To-Do was not found."})
  }

  user.todos[todoExists].done = true;

  return response.json(user.todos[todoExists])

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoExists = user.todos.find( todo => todo.id === id);

  if(!todoExists) { 
    return response.status(404).json({error: "ID To-Do was not found."})
  }

  const todoList = user.todos.filter(todo => todo.id !== id) // Filtra os todos com id  diferente do id recebido e cria um novo array com os id's filtrados

  user.todos = todoList

  return response.status(204).send();
});

module.exports = app;