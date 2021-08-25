const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: String,
    image: String,
    startTime: Date,
    duration: Number,
    endTime: Date,
    sold: Boolean,
    category: String,
    price: String,
    description: String,
    favCount: Number,
    favdata: Array,

    biddings:[
        {
            type: Schema.Types.ObjectId,
            ref: 'Bidding'
        }
    ]
    
});

module.exports = mongoose.model('Product', ProductSchema);