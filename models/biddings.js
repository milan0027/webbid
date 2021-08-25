const mongoose = require('mongoose')
const Schema = mongoose.Schema

const bidSchema = new Schema({
    //uname: String,
    price: Number
})

module.exports = mongoose.model("Bidding", bidSchema)