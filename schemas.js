const Joi = require('joi')
const d= new Date()
const t = d.getTime()
module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required(),
        price: Joi.number().min(0).required(),
        startTime: Joi.date().required().min(t),
        duration: Joi.number().required()
    }).required()
})

module.exports.biddingSchema = Joi.object({
    bidding: Joi.object({
        price: Joi.number().required().min(0)
    }).required()
})