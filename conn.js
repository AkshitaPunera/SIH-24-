const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/museumReservations', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

module.exports = mongoose;