import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import User from "../models/userModel.js";

const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "45m" }
    );
};

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "2d" }
    );
};

export const signUp = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            const error = new Error("Username and password are required");
            error.status = 400;
            return next(error);
        }

        const exisitingUser = await User.findOne({ username });
        if (exisitingUser) {
            const error = new Error("Username already taken");
            error.status = 409;
            return next(error);
        }

        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(password, salt);

        const newUser = new User({
            username: username,
            password: hashedPassword,
        });
        console.log(newUser);
        const token = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        await newUser.save();

        res.status(201).json({
            msg: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
            },
            access_token: token,
            refreshToken: refreshToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            const error = new Error("Username and password are required");
            error.status = 400;
            return next(error);
        }

        const user = await User.findOne({ username });
        if (!user) {
            const error = new Error("Invalid username or passowrd");
            error.status = 401;
            return next(error);
        }

        const isMatch = await bycrypt.compare(password, user.password);

        if (!isMatch) {
            const error = new Error("Invalid username of password");
            error.status = 401;
            return next(error);
        }

        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            msg: "Login successful",
            user: {
                id: user._id,
                username: user.username,
            },
            access_token: token,
            refresh_token: refreshToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.refreshToken = "";
            await user.save();
        } else {
            return res.status(403).json({ msg: "something went wrong" });
        }
        res.status(200).json({ msg: "Logged out successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const refresh = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const error = new Error("No auth token provied");
        error.status = 401;
        return next(error);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        console.log(decoded.id);

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const accessToken = generateAccessToken(decoded);

        res.status(200).json({ accessToken });
    } catch (error) {
        console.error(error);
        return res.status(403).json({ msg: "invalid or expired token" });
    }
};

export const createLibrarian = async (req, res, next) => {
    try {
        const userAuthority = req.user.role;
        if (userAuthority !== "admin") {
            const error = new Error("Not authorized to add librarians");
            error.status = 403;
            return next(error);
        }

        const { username, password } = req.body;

        if (!username || !password) {
            const error = new Error("Username and password are required");
            error.status = 400;
            return next(error);
        }

        const exisitingUser = await User.findOne({ username });
        if (exisitingUser) {
            const error = new Error("Username already taken");
            error.status = 409;
            return next(error);
        }

        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(password, salt);

        const newUser = new User({
            username: username,
            password: hashedPassword,
            role: "librarian",
        });
        console.log(newUser);
        const token = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);

        await newUser.save();

        res.status(201).json({
            msg: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
            },
            access_token: token,
            refreshToken: refreshToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
