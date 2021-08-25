const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate= require('ejs-mate');
const { productSchema, biddingSchema } = require('./schemas.js');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Product = require('./models/product');
const Bidding = require('./models/biddings');

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

const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

const validateBidding = (req, res, next) => {
    const { error } = biddingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});
app.get('/products', catchAsync( async (req, res) => {
    const products = await Product.find({});
    res.render('products/index', { products })
}));

app.get('/products/new', catchAsync( async (req, res) => {
    res.render('products/new');
}))

app.post('/products', validateProduct, catchAsync( async (req, res,next) => {
   
    const product = new Product(req.body.product);
    product.endTime = Date.parse(product.startTime)+product.duration*3600000 
    await product.save();
    res.redirect(`/products/${product._id}`)
}))

app.get('/products/:id', catchAsync( async (req, res,) => {
    const product = await Product.findById(req.params.id)
    res.render('products/show', { product });
}));

app.get('/products/:id/edit', catchAsync( async (req, res) => {
    const product = await Product.findById(req.params.id)
    res.render('products/edit', { product });
}))

app.put('/products/:id', validateProduct, catchAsync( async (req, res) => {
    const { id } = req.params;
    const inputs = req.body.product
    const endtime = Date.parse(inputs.startTime)+inputs.duration*3600000
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product , endTime: endtime});
    res.redirect(`/products/${product._id}`)
}));

app.post('/products/:id/biddings', validateBidding, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const bidding = new Bidding(req.body.bidding);
    product.biddings.push(bidding);
    await bidding.save();
    await product.save();
    res.redirect(`/products/${product._id}`);
}))

app.delete('/products/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.redirect('/products');
}))


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
