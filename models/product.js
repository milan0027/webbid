const mongoose = require('mongoose');
const Bidding = require('./biddings');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    title: String,
    image: String,
    startTime: Date,
    duration: Number,
    endTime: Date,
    sold: Boolean,
    category: String,
    price: Number,
    lastbid: Number,
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

ProductSchema.post('findOneAndDelete', async function(doc){
    if(doc)
    {
        await Bidding.deleteMany({
            _id: {
                $in: doc.biddings
            }
        })
    }
})

module.exports = mongoose.model('Product', ProductSchema);