import mongoose from "mongoose"

const infoSchema = new mongoose.Schema({
    name: String,
    age: Number,
    house: String,
    skills: [String],
    attendance: Number,
    placementReady: Boolean
})

const Information = mongoose.model("Information", infoSchema)

export default Information