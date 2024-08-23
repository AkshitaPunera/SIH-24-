const express = require('express');
const path = require('path');
const mongoose = require('./conn');
const Reservation = require('./models/reservation');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.get('/availability/:museum/:date', async (req, res) => {
    const { museum, date } = req.params;

    try {
       
        const reservationsOnDate = await Reservation.find({ museum, date }).exec();
        
     
        const totalReservedSeats = reservationsOnDate.reduce((total, reservation) => total + reservation.tickets, 0);
        
    
        const maxCapacity = 100;
        const availableSeats = maxCapacity - totalReservedSeats;

        res.json({ availableSeats });
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/reserve', async (req, res) => {
    const { state, museum, tickets, date } = req.body;

    try {
       
        const reservation = new Reservation({
            state,
            museum,
            tickets,
            date
        });
        await reservation.save();

        res.json({ message: 'Reservation successful!' });
    } catch (error) {
        console.error('Error saving reservation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
