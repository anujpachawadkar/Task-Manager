const express = require('express');

const taskRoutes = require('./routers/tasks');
const userRoutes = require('./routers/users');

const app = express();
const PORT = process.env.PORT;

// Making DB connection
// It is going to execute function returned from 'mongoose.js'
require('./db/mongoose');

// A Middleware(Application level middleware) to parse JSON to object
// Every request goes through these middlewares
app.use(express.json());
app.use(taskRoutes);
app.use(userRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});