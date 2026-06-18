const Coupon =require('../../models/couponModel');



// ================================
// LOAD COUPONS
// ================================

const loadCoupons = async(req,res)=>{

try{


const trash =
req.query.trash === 'true';



const coupons =
await Coupon.find({

isDeleted:trash

})
.sort({

createdAt:-1

});



res.render(
'admin/coupons',
{
    coupons,
    trash 
}
);


}

catch(error){


console.log(
'LOAD COUPON ERROR:',
error
);


res.redirect('/admin/dashboard');


}


};




// ================================
// ADD COUPON
// ================================


const addCoupon = async(req,res)=>{


try{


const {

couponCode,
discountType,
discountValue,
minimumAmount,
maximumDiscount,
expiryDate,
usageLimit

}=req.body;




// expiry validation

if(new Date(expiryDate) <= new Date()){



req.session.message={

type:'error',

text:'Expiry date must be future date'

};



return res.redirect('/admin/coupons');


}




// discount validation

if(Number(discountValue)<=0){



req.session.message={

type:'error',

text:'Invalid discount amount'

};



return res.redirect('/admin/coupons');


}




// percentage validation

if(

discountType === 'percentage'

&&

Number(discountValue)>100

){



req.session.message={

type:'error',

text:'Percentage cannot exceed 100'

};



return res.redirect('/admin/coupons');


}




// duplicate checking

const exist =
await Coupon.findOne({

couponCode:
couponCode.toUpperCase()

});




if(exist){



req.session.message={

type:'error',

text:'Coupon already exists'

};



return res.redirect('/admin/coupons');


}





await Coupon.create({

couponCode:
couponCode.toUpperCase(),

discountType,

discountValue,

minimumAmount,

maximumDiscount,

expiryDate,

usageLimit

});





req.session.message={

type:'success',

text:'Coupon created successfully'

};




res.redirect('/admin/coupons');


}



catch(error){


console.log(
'ADD COUPON ERROR:',
error
);



req.session.message={

type:'error',

text:'Failed to create coupon'

};



res.redirect('/admin/coupons');


}


};




// ================================
// BLOCK / UNBLOCK COUPON
// ================================


const toggleCoupon = async(req,res)=>{


try{


const coupon =
await Coupon.findById(
req.params.id
);



if(!coupon){


return res.redirect('/admin/coupons');


}



coupon.isActive =
!coupon.isActive;



await coupon.save();



res.redirect('/admin/coupons');


}



catch(error){



console.log(
'TOGGLE COUPON ERROR:',
error
);



res.redirect('/admin/coupons');


}



};





// ================================
// DELETE COUPON (SOFT DELETE)
// ================================


const deleteCoupon = async(req,res)=>{


try{



await Coupon.findByIdAndUpdate(

req.params.id,

{

isDeleted:true

}

);




req.session.message={

type:'success',

text:'Coupon deleted successfully'

};




res.redirect('/admin/coupons');


}



catch(error){



console.log(
'DELETE COUPON ERROR:',
error
);



res.redirect('/admin/coupons');


}



};





// ================================
// EDIT COUPON
// ================================


const editCoupon = async(req,res)=>{


try{



await Coupon.findByIdAndUpdate(

req.params.id,

{

...req.body,

couponCode:req.body.couponCode.toUpperCase()

}

);




req.session.message={

type:'success',

text:'Coupon updated successfully'

};




res.redirect('/admin/coupons');


}



catch(error){



console.log(
'EDIT COUPON ERROR:',
error
);



req.session.message={

type:'error',

text:'Coupon update failed'

};



res.redirect('/admin/coupons');


}



};

const restoreCoupon = async(req,res)=>{


try{


await Coupon.findByIdAndUpdate(

req.params.id,

{

isDeleted:false

}

);



req.session.message={

type:'success',

text:'Coupon restored successfully'

};



res.redirect('/admin/coupons?trash=true');


}


catch(error){


console.log(error);


res.redirect('/admin/coupons');


}


};




// ================================
// EXPORTS
// ================================


module.exports = {
    loadCoupons,
    addCoupon,
    toggleCoupon,
    deleteCoupon,
    editCoupon,
    restoreCoupon
};