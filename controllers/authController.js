const User = require('../models/user');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) {
            res.status(400);
            throw new Error("Email and Password must not be empty.");
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            res.status(409);
            throw new Error("Email already exist");
        }

        const newUser = await User.create({ email: normalizedEmail, password, role });
        return res.status(201).json({
            success: true,
            message: "Account created successfully.",
            data: { id: newUser._id, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400);
            throw new Error("Please enter registered email and password.");
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user || !(await user.comparePassword(password))) {
            res.status(401);
            throw new Error("Not a registered user.");
        }

        const accessToken = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: { token: accessToken, role: user.role, email: user.email }
        });
    } catch (error) {
        next(error);
    }
};
