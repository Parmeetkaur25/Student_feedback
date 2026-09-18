import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Information from "./models/Student.js";

dotenv.config();

const app = express();

app.use(express.json());

// connectDB();



app.get("/", (req, res) => {
    res.send("Server is working!");
});


app.post("/students-info", async (req, res) => {

    try {
        console.log("1. Request received");
        console.log("2. Data:", req.body);

        const student = await Information.create(req.body);

        console.log("3. Student created");

        res.json(student);

    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).json({
            message: error.message
        });
    }

});

app.listen(5000, () => {
    console.log("Server is working on port 5000");
});