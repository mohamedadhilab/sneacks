const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');


const loadReturns = async(req,res)=>{

try{


const orders =
await Order.find({

"items.status":{

$in:[

'Return Requested',
'Returned',
'Return Rejected'

]

}
})
.populate('userId')
.sort({createdAt:-1});


res.render(
'admin/returns',
{
    orders,
    page:'returns'
}
);


}

catch(error){

console.log(error);

res.redirect('/admin/orders');

}

};



const approveReturn = async(req,res)=>{

try{


const {

orderId,
itemId

}=req.params;


const order =
await Order.findOne({

_id:orderId,

userId:req.session.user.id

});
if(!order){


return res.json({

success:false,
message:'Order not found'

});


}



const item =
order.items.id(itemId);



if(!item){


return res.json({

success:false,
message:'Item not found'

});


}



// approve return

item.status =
'Returned';


item.returnStatus =
'Approved';


item.returnedAt =
new Date();



// restore stock

const product =
await Product.findById(

item.productId

);



if(product){


const variant =
product.variants.find(

v=>v.size == item.size

);



if(variant){


variant.stock +=
item.quantity;


}



await product.save();


}



// check all products returned

const allReturned =
order.items.every(

item =>
item.status === 'Returned'

);



const allCompleted =
order.items.every(item =>

item.status === 'Returned' ||

item.status === 'Return Rejected'

);


if(allCompleted){


order.orderStatus =
'Returned';


}



order.markModified('items');



await order.save();



res.json({

success:true,
message:'Return approved successfully'

});


}

catch(error){


console.log(error);



res.json({

success:false,
message:'Return approve failed'

});


}


};


const rejectReturn = async(req,res)=>{

try{


const {

orderId,
itemId

}=req.params;



const order =
await Order.findOne({

_id:orderId,

userId:req.session.user.id

});


if(!order){


return res.json({

success:false,
message:'Order not found'

});


}



const item =
order.items.id(itemId);



if(!item){


return res.json({

success:false,
message:'Item not found'

});


}



item.status =
'Return Rejected';


item.returnStatus =
'Rejected';



const allRejected =
order.items.every(

item =>
item.status === 'Return Rejected'

);

item.returnRejectedAt =
new Date();

if(allRejected){


order.orderStatus =
'Return Rejected';


}



order.markModified('items');



await order.save();



res.json({

success:true,
message:'Return rejected'

});


}

catch(error){


console.log(error);


res.json({

success:false,
message:'Reject failed'

});


}


};


module.exports={

loadReturns,
approveReturn,
rejectReturn

}