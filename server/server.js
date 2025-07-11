import express from "express";
import dotenv from "dotenv";
import logger from "./middlewares/logger.js";
import cors from "cors";
import errorHandler from "./middlewares/errorHandler.js";
import connectDB from "./config/db.js";
import auth from "./routes/auth.js";
import books from "./routes/books.js";
import user from "./routes/user.js";
import librarian from "./routes/librarian.js";
dotenv.config();

const app = express();
connectDB();

//middelwares
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(logger);

app.use("/auth", auth);
app.use("/books", books);
app.use("/user", user);
app.use("/librarian", librarian);

app.get("/", (req, res) => {
    res.send("Server is up and running");
});

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
    console.log(`Server is running at port: ${process.env.PORT}`);
});
