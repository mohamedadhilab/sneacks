const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');

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
            await Order.findById(
                req.params.id
            );

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

module.exports = {

    loadOrders,
    loadOrderDetails,
    cancelOrder,
    cancelItem,
    returnItem
};