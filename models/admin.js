const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/admin-tech-volsung', {
    
});

// Defining the admin schema
const admin_Schema = new mongoose.Schema({
    username: { type: String, default: 'admin' },
    password: { type: String, default: '1234' },
});

module.exports = mongoose.model('TechAdmin', admin_Schema);


