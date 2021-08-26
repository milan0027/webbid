const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');


const products = require('./routes/products')
const biddings = require('./routes/biddings')

mongoose.connect('mongodb://localhost:27017/bidweb', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

mongoose.set('useFindAndModify', false);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


const sessionConfig = {
    secret: 'ThisIsTestingTheKey123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*30,
        maxAge: 1000*60*60*24*30
    }
}
app.use(session(sessionConfig));
app.use(flash());



app.use((req, res, next) =>{
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})
app.use('/products',products)
app.use('/products/:id/biddings', biddings)


app.get('/', (req, res) => {
    res.render('home')
});

app.all('*', (req,res,next)=>{
    next(new ExpressError('page not found', 404))
})

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err;
    if(!err.message) err.message='Something went wrong!!!'
    res.status(statusCode).render('error', { err })
    
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
