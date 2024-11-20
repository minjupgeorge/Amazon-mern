import User from '../models/user.js';
import hashPassword  from '../utils/hashPassword.js';
import matchPasswords from '../utils/matchPasswords.js';
import validateEmail from '../utils/validateEmail.js';
import validatePassword  from '../utils/validatePassword.js';
import validateUsername  from '../utils/validateUsername.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userControllers = {
    register: async (req, res) => {
        const {username, email ,password ,rePassword} = req.body;
        try {
            if (!username || !email || !password || !rePassword) {
                return res
                    .status(400)
                    .json({ message: 'All fields are required' });
            }
            if (!validateUsername(username)) {
                return res
                    .status(400)
                    .json({ message: 'Invalid username' });
            }
            if (!validateEmail(email)) {
                return res
                    .status(400)
                    .json({ message: 'Invalid email' });
            }
            if (!validatePassword(password)) {
                return res
                    .status(400)
                    .json({ message: 'Invalid password' });
            }
            if (!matchPasswords(password, rePassword)) {
                return res
                    .status(400)
                    .json({ message: 'Passwords do not match' });
            }
            const hashedPassword =  hashPassword(password);
            const user = await User.create({
                username,
                email,
                password: hashedPassword
            });
            res.status(201).json(user);
        } catch (error) {
            return res.status(500).json({ message: error.message });

    }},
    login: async (req, res) => {
        const {email,password}= req.body
        try {
            if(!email || !password )
            return res.status(400).json({message: 'All fields are required'});

 const userExists = await User.findOne({email});
const isPasswordCorrect =await bcrypt.compare(password, userExists.password);
if(!userExists || !isPasswordCorrect){
    return res.status(400).json({message: 'Invalid credentials'});
}
const token = jwt.sign({id: userExists._id}, process.env.TOKEN_SECRET )

res.cookie('token', token, {httpOnly: true});
res.json({message: 'Login successful'});

        } catch (error) {
            return res.status(500).json({message: error.message});
        }
    },
    checkAdmin: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await User.findOne({ _id: id });
            if (!user) {
                return res.status(400).json({ message: 'User not found!' });
            }

            if (user.role === 'admin') {
                res.status(200).json({
                    message: 'User is admin!',
                    isAdmin: true
                });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    getUser: async (req, res) => {
        const { id } = req.params;
        try {
            const user = await User.findOne({ _id: id });
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ message: 'User not found!' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    logout: async (req, res) => {
        res.clearCookie('token');
        res.json({message: 'Logout successful'});
    }
};

export default userControllers;