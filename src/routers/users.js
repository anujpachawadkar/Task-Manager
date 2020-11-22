const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
const multer = require('multer');
const sharp = require('sharp');
const auth = require('../middleware/auth');
const User = require('../db/models/users');
const { sendWelcomeEmail, accountClosingEmail } = require('../email/account');

const upload = multer({
    // only used to save file to the specified folder; if not written file is passed to the next function
    // dest: 'avatars', 
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload images only'));
        }
        cb(undefined, true);
    }
});

router.post('/user', async (req, res) => {
    const newUser = new User(req.body);
    try {
        const token = await newUser.getAuthorizationToken();
        await newUser.save()
        sendWelcomeEmail(newUser.email, newUser.name);
        res.status(200).send({
            message: 'User saved successfuly.',
            token
        })
    } catch (e) {
        res.status(400).send(e)
    }
});

router.post('/user/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.getAuthorizationToken();
        res.send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
    
});

router.post('/user/logout', auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return req.token !== token.token;
        });
        await req.user.save()
        res.status(200).send();
    } catch(e) {
        res.status(500).send('Something went wrong!');
    }
    
})

router.post('/user/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch(e) {
        res.status(500).send('Something went wrong!');
    }
    
})


router.get('/users/me', auth, async (req, res) => {
    res.status(201).send(req.user);
});

router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            return res.status(200).send(user);
        }
        res.status(204).send({
            message: 'No such user found'
        });
    } catch (e) {
        res.status(500).send('Internal server error!');
    }
});

router.patch('/user/me', auth, async (req, res) => {
    const expectedProperties = {name: true, email: true, age: true, password: true};
    const reqProperties = Object.keys(req.body);
    const isValidRequest = reqProperties.every((prop) => expectedProperties[prop]);
    if (!isValidRequest) {
        return res.status(400).send('Bad request');
    }
    try {
        reqProperties.forEach(element => {
            req.user[element] = req.body[element];
        });
        await req.user.save();
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e);
    }
});

router.delete('/user/me', auth, async(req, res) => {
    try {
        await req.user.remove();
        accountClosingEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({height: 250, width: 250}).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.delete('/user/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
});

router.get('/user/:id/avatar', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar);
    } catch (e) {
        res.status(404).send();
    }
    
});

module.exports = router