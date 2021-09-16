if(process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const socketio = require('socket.io')
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const Product = require('./models/product');
const Bidding = require('./models/biddings');

const userRoutes = require('./routes/users')
const productsRoutes = require('./routes/products')
const biddingsRoutes = require('./routes/biddings')
const trendRoutes = require('./routes/trending')
const liveRoutes = require('./routes/live')
const upcomingRoutes = require('./routes/upcoming')
const LoginUserRoutes = require('./routes/LoginUser');
const {generateValue} = require('./utils/generateValue');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/activeusers');


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
const server = http.createServer(app);
const io = socketio(server)

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

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())



app.use((req, res, next) =>{
   // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/', userRoutes)
app.use('/products',productsRoutes)
app.use('/trending', trendRoutes)
app.use('/live', liveRoutes)
app.use('/upcoming', upcomingRoutes)
app.use('/user', LoginUserRoutes)
app.use('/products/:id/biddings', biddingsRoutes)

io.on('connection', (socket =>{
    console.log('new web socket')



    socket.on('join', ({username, room}, callback) =>{
        const {user} = addUser({ id: socket.id, username, room})

        socket.join(user.room)

        io.to(user.room).emit('roomdata' , getUsersInRoom(user.room))
        callback()
    })

    socket.on('sendValue', async (bid, callback)=>{
    const user = getUser(socket.id)


    const product = await Product.findById(bid.pro_id);
    const bidding = new Bidding();
    bidding.price = bid.price;

    const bidUser = bid.currentuser;

    if(bidding.price>bidUser.wallet)
    {
        return callback('Insufficient Balance in Wallet')
        
    }
    if(product.owner.equals(bidUser._id))
    {
        return callback('You cannot Bid on your own items')
    }
    if(bidding.price<=product.lastbid) {
        return callback('Bid Value Must be Greater')
       
    }
    if(Date.now()<product.startTime || Date.now()>product.endTime){
        return callback('Action Not Allowed!!!')
        
    }
    await product.biddings.push(bidding);
    product.lastbid = bidding.price;
    product.lastbidder = bidUser._id;
    bidding.owner = bidUser._id;
    await bidding.save();
    await product.save();

    io.to(user.room).emit('value', generateValue(user.username, bid.price))
    callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('roomdata', getUsersInRoom(user.room))
        }
    })
}))











app.get('/all/:category', catchAsync(async (req, res)=>{

    const {category} = req.params
    const d = Date.now()
    const type = "All"
    const products = await Product.find({ $and: [ {endTime: { $gte: d}} , {category:category }]});
    res.render('products/index', { products, category, type})

}))



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

server.listen(3000, () => {
    console.log('Serving on port 3000')
})
