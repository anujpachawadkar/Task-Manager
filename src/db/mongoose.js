const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
});



// const newUser = new User({
//     name: 'Vaibhavi',
//     email: 'vaibhu@gmail.com    ',
//     password: 'vaibhu@123456Password     '
// });

// newUser.save().then(res => {
//     console.log('New user created: ', res);
// }).catch(err => {
//     console.log('Error: ', err);
// });

// One tyoe of document creation
// Task.create({
//     description: 'To create a Task"s list',
//     completed: false
// }).then(res => {
//     console.log('Record created: ', res);
// }).catch(err => {
//     console.log('Error: ', err);
// });

// Another type of object creation
// const myTask = new Task({
//     description: '     Testing again      ',
//     completed: true
// });

// myTask.save().then(res => {
//     console.log('Task created successfuly: ', res);
// }).catch(err => {
//     console.log('Error', err);
// });