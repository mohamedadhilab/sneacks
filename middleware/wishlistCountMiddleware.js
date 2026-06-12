const Wishlist = require('../models/wishlistModel');


const wishlistCountMiddleware = async (req,res,next)=>{


try{


let wishlistCount = 0;



if(req.session.user){


const wishlist =
await Wishlist.findOne({

userId:req.session.user.id

});



if(wishlist){


wishlistCount =
wishlist.items.length;


}


}



res.locals.wishlistCount =
wishlistCount;



next();


}


catch(error){


console.log(error);


res.locals.wishlistCount = 0;


next();


}


};



module.exports = wishlistCountMiddleware;