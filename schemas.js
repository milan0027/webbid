const Joi = require('joi')
const d= new Date()
const t = d.getTime()
module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        //image: Joi.string().required(),
        price: Joi.number().min(0).required(),
        startTime: Joi.date().required().min(0),
        duration: Joi.number().required().min(0.5).max(3)
    }).required()
})

module.exports.biddingSchema = Joi.object({
    bidding: Joi.object({
        price: Joi.number().required().min(0)
    }).required()
})

module.exports.walletSchema = Joi.object({
    walletAdd: Joi.object({
        wallet: Joi.number().required().min(0).max(100000)
    }).required()
})