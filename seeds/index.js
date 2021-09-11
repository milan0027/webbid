const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Product = require('../models/product');

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

const sample = array => array[Math.floor(Math.random() * array.length)];

const cat = ["Art","Antique","Books","Electronics","Fashion","Gadgets","Instruments","Jewellery","Property","Software","Vehicles"]
const seedDB = async () => {
    await Product.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random()*50) + 10;
        const gtb  = Math.floor(Math.random()*11);
        const d = new Date();
        const pro = new Product({
            title: `${sample(descriptors)} ${sample(places)}`,
            image: [{
                url: 'https://res.cloudinary.com/webbid/image/upload/v1630764070/Webbid/kqovfbymzexrjojsuhfu.png',
                filename: 'Webbid/kqovfbymzexrjojsuhfu'
              }],
            price,
            owner: "61291ea211e30c5cf0ce267f",
            favCount: Math.floor(Math.random()*100),
            description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
            startTime: d.getTime(),
            category: cat[gtb],
            duartion: 1.5,
            endTime: d.getTime()+9751405842



        })
        await pro.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})