import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import  connectDB  from "./config/db.js";
import Feedback from "./model/Feedback.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());


app.use(express.static(path.join(__dirname, "../public")));


connectDB();



app.post("/feedback", async (req, res) => {

    try {

        const { name, rating, comment } = req.body;

        const newFeedback = new Feedback({
            name,
            rating,
            comment
        });

        await newFeedback.save();

        res.status(201).json({
            message: "Feedback submitted successfully",
            feedback: newFeedback
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to submit feedback",
            error: error.message
        });

    }

});

app.put("/feedback/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rating, comment } = req.body;

        if (!name || !rating || !comment) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { name, rating, comment },
            { new: true, runValidators: true }
        );

        if (!feedback) {
            return res.status(404).json({
                message: "Feedback not found"
            });
        }

        res.status(200).json({
            message: "Feedback updated successfully",
            feedback
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update feedback",
            error: error.message
        });
    }
});

app.delete('/feedback/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Feedback.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Feedback not found' });
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete feedback', error: error.message });
    }
});

app.get("/feedback", async (req, res) => {

    try {

        const feedback = await Feedback.find();


        res.json(feedback);

    } catch (error) {

        res.status(500).json({
            message: "Failed to get feedback",
            error: error.message
        });

    }

});


app.listen(PORT, () => {
    console.log(`Server is working on port ${PORT}`);
});