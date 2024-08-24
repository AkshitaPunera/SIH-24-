const express = require('express');
const app = express();
const path = require('path');
const TechAdmin = require('./models/admin');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const museum = require('./models/museum');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); 


app.get('/', (req, res) => {
    res.render("admin");
});

// Validating the admin 
app.post('/admin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await TechAdmin.findOne();
        if (user && user.username === username && user.password === password) {
            const token = jwt.sign({ username }, "#234hsdfgwixbxcv-9923479sdfsbxklxcv");
            res.cookie("token", token, { httpOnly: true }); 
            console.log(token);
            res.redirect('/museums');
        } else {
            console.log(user);
            res.send('Invalid username or password.');
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Protected route 
app.get('/museums', isLoggedIn, (req, res) => {
    res.render("museums");
});

// Middleware for login routes
function isLoggedIn(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.send("You must login first");
    }

    try {
        const data = jwt.verify(token, "#234hsdfgwixbxcv-9923479sdfsbxklxcv");
        req.user = data;
        next();
    } catch (error) {
        console.error('Token verification failed:', error);
        res.send("Invalid or expired token. Please log in again.");
    }
}
app.get('/admin/museumlist', isLoggedIn,async (req,res)=>{
    let museumdata = await museum.find();
    res.render("museumlist",{museumdata});
});
app.get('/admin/buildmuseum',isLoggedIn,(req,res)=>{
    res.render("buildmuseum");

});

app.get('/admin/logout', (req, res) => {
    res.clearCookie('token'); 
    res.redirect('/'); 
});
// building the museum route 
app.post('/admin/buildmuseum',isLoggedIn, async (req,res)=>{
    let{ name,country , city , phone , image, address,capacity }=req.body;
    let createdMuseum= await museum.create({
        name,
        country,
        city,
        image,
        address,
        phone,
        capacity


    });
    console.log(createdMuseum);
    res.redirect('/museums');



});
// user end app
// Intro page for user end
app.get('/user',(req,res)=>{
    res.render("intro");
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
