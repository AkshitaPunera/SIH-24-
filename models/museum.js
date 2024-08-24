const mongoose = require('mongoose');

const museumSchema=  new mongoose.Schema({
    name: String,
    country: String,
    city: String,
    phone:Number,
    capacity:Number,
    image:String,
    address:String,




});

module.exports=mongoose.model("museum",museumSchema);