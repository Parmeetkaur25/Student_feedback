
import express from "express";
import { connectDB } from "./config/db.js";
import { Contact } from "./models/Contact.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});



app.post("/submit-contact", async (req, res) => {
    try {
        const name = req.body.name?.trim(); 
        const email = req.body.email?.trim();
        const message = req.body.message?.trim();

        
        if (!name || !email || !message) {
            return res.status(400).json({
                message: "Name, email and message are required"
            });
        }

        const emailPattern = /^[^\s@]+@[^\s@]+.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(404).json({
                message: "Please enter a valid email"
            })
        }

        
        const newContact = new Contact({
            name,
            email,
            message
        });

        
        await newContact.save();

        
        res.status(201).json({
            message: "Contact submitted successfully",
            contact: newContact
        });

    } catch (error) {

        console.error("Error submitting contact:", error);

        res.status(500).json({
            message: "Something went wrong while submitting the contact"
        });
    }
});



app.get("/contacts", async (req, res) => {
    try {
        const contacts = await Contact.find();

        res.status(200).json(contacts);

    } catch (error) {

        console.error("Error fetching contacts:", error);

        res.status(500).json({
            message: "Something went wrong while fetching contacts"
        });
    }
});



connectDB();



app.listen(3000, () => {
    console.log("Server is working");
});
