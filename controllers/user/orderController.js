const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const PDFDocument = require('pdfkit');
// =====================================
// LOAD ORDERS PAGE
// =====================================

const loadOrders = async (req, res) => {

    try {

        const userId =
            req.session.user.id;

        const orders =
            await Order.find({

                userId

            })

            .sort({

                createdAt: -1

            });

        res.render(

            'user/orders',

            { orders }

        );

    }

    catch (error) {

        console.log(
            'LOAD ORDERS ERROR:',
            error
        );

        res.redirect('/profile');

    }

};
const loadOrderDetails = async (req, res) => {

    try {


        const order =
            await Order.findOne({

                _id: req.params.id,

                userId: req.session.user.id

            });



        if (!order) {


            return res.redirect('/orders');


        }



        res.render(

            'user/order-details',

            { order }

        );


    }


    catch (error) {


        console.log(
            'ORDER DETAILS ERROR:',
            error
        );


        res.redirect('/orders');


    }


};

const cancelOrder = async (req, res) => {

    try {

        const order =
            await Order.findById(
                req.params.id
            );

        if (!order) {

            return res.json({

                success: false

            });

        }

        // =================================
        // RESTORE STOCK
        // =================================

        for (const item of order.items) {

            const product =
                await Product.findById(
                    item.productId
                );

            if (product) {

                const variant =
                    product.variants.find(

                        v =>
                            v.size == item.size

                    );

                if (variant) {

                    variant.stock +=
                        item.quantity;

                }

                await product.save();

            }

        }

        // =================================
        // UPDATE STATUS
        // =================================

        order.orderStatus =
            'Cancelled';

        await order.save();

        return res.json({

            success: true

        });

    }

    catch (error) {

        console.log(
            'CANCEL ORDER ERROR:',
            error
        );

        return res.json({

            success: false

        });

    }

};
const cancelItem = async (req,res)=>{

    try{


        const {

            orderId,

            itemId

        } = req.params;


        const {

            reason

        } = req.body;



        const order =
            await Order.findById(orderId);



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



        if(

            order.orderStatus !== 'Pending'

            &&

            order.orderStatus !== 'Processing'

        ){


            return res.json({

                success:false,

                message:'Cannot cancel now'

            });


        }



                // update item status

                item.status =
                'Cancelled';


                item.cancelReason =
                reason;



            // force mongoose to detect item changes

        order.markModified('items');



        // check all items cancelled

        const allCancelled =
        order.items.every(

            item => 
            item.status === 'Cancelled'

        );



        if(allCancelled){


            order.orderStatus =
            'Cancelled';


        }



        const product =
            await Product.findById(
                item.productId
            );



        if(product){


            const variant =
                product.variants.find(

                    v => v.size == item.size

                );


            if(variant){


                variant.stock +=
                    item.quantity;


            }


            await product.save();


        }



        await order.save();



        res.json({

            success:true,

            message:'Item cancelled successfully'

        });



    }


    catch(error){


        console.log(error);


        res.json({

            success:false,

            message:'Cancel failed'

        });


}


};
const returnItem = async (req,res)=>{

    try{


        const {

            orderId,
            itemId

        } = req.params;


        const {

            reason

        } = req.body;



        if(!reason || reason.trim()===''){


            return res.json({

                success:false,

                message:'Return reason required'

            });


        }



        const order =
        await Order.findById(orderId);



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



        if(item.status !== 'Delivered'){


            return res.json({

                success:false,

                message:'Only delivered items can return'

            });

        }



        item.status =
        'Returned';


        item.returnReason =
        reason;



        order.markModified('items');



        const allReturned =
        order.items.every(

            item =>
            item.status === 'Returned'

        );



        if(allReturned){


            order.orderStatus =
            'Returned';

        }



        await order.save();



        res.json({

            success:true,

            message:'Return requested successfully'

        });



    }


    catch(error){


        console.log(error);


        res.json({

            success:false,

            message:'Return failed'

        });


    }


};

const downloadInvoice = async (req,res)=>{

try{


const order =
await Order.findById(req.params.id)
.populate('userId');


if(!order){

return res.redirect('/orders');

}


const doc =
new PDFDocument({

margin:50

});


const fileName =
`Invoice-${order.orderId}.pdf`;


res.setHeader(
'Content-Type',
'application/pdf'
);


res.setHeader(
'Content-Disposition',
`attachment; filename=${fileName}`
);


doc.pipe(res);



// ================= HEADER =================


doc
.fontSize(26)
.text('SNEACKS',50,50);


doc
.fontSize(10)
.text(
'Premium Sneakers Store',
50,
80
);


doc
.fontSize(20)
.text(
'INVOICE',
400,
50
);


doc
.moveDown();



doc
.fontSize(10)
.text(
`Invoice No: ${order.orderId}`,
400,
80
);


doc.text(
`Date: ${new Date(order.createdAt).toDateString()}`,
400,
95
);


// line

doc.moveTo(50,130)
.lineTo(550,130)
.stroke();




// CUSTOMER DETAILS


doc
.fontSize(14)
.text(
'Bill To',
50,
150
);


doc
.fontSize(11)
.text(order.userId.name,50,175)
.text(order.userId.email)
.text(order.address.address_line || '')
.text(
`${order.address.city}, ${order.address.state} ${order.address.pincode}`
);




// PRODUCT TABLE


let y = 260;


doc
.fontSize(12)
.text('Product',50,y)
.text('Size',250,y)
.text('Qty',320,y)
.text('Price',390,y)
.text('Total',470,y);


y += 20;


doc.moveTo(50,y)
.lineTo(550,y)
.stroke();


y += 20;



order.items.forEach(item=>{


doc
.fontSize(10)
.text(item.productName,50,y)
.text(item.size,250,y)
.text(item.quantity,320,y)
.text(
`Rs.${item.price}`,
390,y
)
.text(
`Rs.${item.totalPrice || item.price*item.quantity}`,
470,y
);


y += 25;


});



// TOTAL SECTION


y += 30;


doc.moveTo(350,y)
.lineTo(550,y)
.stroke();


y +=20;


doc
.fontSize(11)
.text(
`Subtotal: Rs.${order.subtotal}`,
350,
y
);


y +=20;


doc.text(
`Shipping: Rs.${order.shippingCharge}`,
350,
y
);


y +=20;


doc
.fontSize(14)
.text(
`Grand Total: Rs.${order.finalAmount}`,
350,
y
);




// FOOTER


doc
.fontSize(10)
.text(
'Thank you for shopping with SNEACKS!',
50,
720,
{
align:'center'
}
);



doc.end();



}

catch(error){


console.log(error);


res.redirect('/orders');


}


};

module.exports = {

    loadOrders,
    loadOrderDetails,
    cancelOrder,
    cancelItem,
    returnItem,
    downloadInvoice
};