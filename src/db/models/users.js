const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./tasks');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    age: {
        type: Number,
        default: 0
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.length < 6 || value.toLocaleLowerCase().includes('password')) {
                throw new Error('Invalid password');
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                require: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject()
    delete userObject.tokens;
    delete userObject.password;
    return userObject;
}

userSchema.methods.getAuthorizationToken = async function () {
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

// Creation of a custome method on userSchema schema
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Unable to login');
    }
    console.log('password: ', password);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('isMatch: ', isMatch);
    if(!isMatch) {
        throw new Error('Wrong Password!');
    }
    return user;
}

// Hash the plane text passwords BEFORE saving
userSchema.pre('save', async function(next) {
    let user = this;
    if (user.isModified('password')) {
        console.log('This ALSO got called');
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({owner: user._id});
    next();
});

const User = mongoose.model('Users', userSchema);

module.exports = User;