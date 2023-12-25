const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
    const jwtKey = process.env.JWT_SECRET_KEY;
    return jwt.sign({ _id }, jwtKey, { expiresIn: '3d' });
}

const registerUser = async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    try {
        let user = await userModel.findOne({ email }).lean();
        if (user) return res.status(400).json('User with the given email already exists');
        if (!name || !email || !password || !confirmPassword) return res.status(400).json('Please enter all required fields');
        if (!validator.isEmail(email)) return res.status(400).json('Please enter a valid email address');
        if (!validator.isStrongPassword(password)) return res.status(400).json('Please enter a strong password (contains at least 8 characters, 1 lowercase, 1 uppercase, 1 number and 1 symbol)');
        if (password !== confirmPassword) return res.status(400).json('Passwords do not match');

        user = new userModel({ name, email, password });
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(user.password, salt);

        await user.save();

        const token = createToken(user._id);

        res.status(200).json({ _id: user._id, name: user.name, email: user.email, token: token });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await userModel.findOne({ email }).lean();
        if (!email || !password) return res.status(400).json('Please enter all required fields');
        if (!user) return res.status(400).json('Invalid email or password');
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) return res.status(400).json('Invalid email or password');

        const token = createToken(user._id);
        res.status(200).json({ _id: user._id, name: user.name, email: user.email, token: token });
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const findUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await userModel.findById(userId).lean();
        if (!user) return res.status(400).json('User with the given id does not exist');
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await userModel.find().lean();
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports = { registerUser, loginUser, findUser, getUsers };