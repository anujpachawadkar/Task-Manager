const express = require('express');
const app = express();
const taskRoutes = require('./db/routers/tasks');
const userRoutes = require('./db/routers/users');

// Making DB connection
// It is going to execute function returned from 'mongoose.js'
require('./db/mongoose');

const PORT = process.env.PORT;

// A Middleware(Application level middleware) to parse JSON to object
// Every request goes through these middlewares
app.use(express.json());
app.use(taskRoutes);
app.use(userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Important:- - -

// const Task = require('./src/db/models/tasks');
// const User = require('./src/db/models/users');

// const main = async () => {
//     // const task = await Task.findById('5fb2188e9367857ce6bd4e88');
//     // await task.populate('owner').execPopulate();
//     // console.log(task);

//     const user = await User.findById('5fb11ba355c79276e02154c3');
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks);
// }

// main();