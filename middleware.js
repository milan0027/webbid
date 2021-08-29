const { productSchema, biddingSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Product = require('./models/product');



module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {

        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Sign in to continue');

        return res.redirect('/login');

    }
    next();
}




module.exports.validateProduct = (req, res, next) => {

        const { error } = productSchema.validate(req.body);
        if (error) {
            const msg = error.details.map(el => el.message).join(',')
            throw new ExpressError(msg, 400)
        } else {
            next();
        }

        
   
}


module.exports.isOwnerAndLimit = async (req, res, next)=>{
    const {id} = req.params;
    const product = await Product.findById(id);
    if(Date.now()>product.startTime)
    {
        req.flash('error', 'Action Not Allowed!!!')
        return res.redirect(`/products/${id}`)
    }
    if(!product.owner.equals(req.user._id))
    {
        req.flash('error', 'Action Not Allowed!!!')
        return res.redirect(`/products/${id}`)
    }
    next();
}

module.exports.validateBidding = (req, res, next) => {
    const { error } = biddingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}