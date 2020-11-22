const express = require('express');
const router = new express.Router();
const Task = require('../db/models/tasks');
const auth = require('../middleware/auth');

// This is called router middleware function
router.post('/task', auth, async (req, res) => {
    const newTask = new Task({...req.body, owner: req.user._id});
    try {
        await newTask.save()
        res.status(200).send(newTask);
    } catch (e) {
        res.status(400).send({
            message: 'Bad Request!'
        })
    }
});

router.get('/tasks', auth, async (req, res) => {
    let sort = {};
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === desc ? -1 : 1;
    }
    try {
        // const tasks = await Task.find({owner: req.user._id});
        // OR
        await req.user.populate({
            path: 'tasks',
            match: {
                completed: req.query.completed === 'true'
            },
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        // if (!tasks) {
        //     return res.status(204).send('No tasks found');    
        // }
        res.status(200).send(req.user.tasks);
        // res.status(200).send(tasks);
    } catch (e) {
        res.status(500).send('Resource error!');
    }
});

router.get('/task/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (task) {
            return res.status(200).send(task);
        }
        res.status(204).send({
            message: 'No such task found'
        });
    } catch (e) {
        res.status(500).send('Internal server error!');
    }
});

router.patch('/task/:id', auth, async (req, res) => {
    const expectedProperties = {description: true, completed: true};
    const reqProperties = Object.keys(req.body);
    const isValidRequest = reqProperties.every((prop) => expectedProperties[prop]);

    if (!isValidRequest) {
        return res.status(400).send('Bad request');
    }

    try {

        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});

        reqProperties.forEach(element => {
            task[element] = req.body[element];
        });

        await task.save();
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        if (task) {
            return res.status(200).send(task);
        }
        res.status(204).send({
            message: 'No such task found'
        });
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/task/:id', auth, async(req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;