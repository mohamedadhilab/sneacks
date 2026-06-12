const Order = require('../../models/orderModel');
const User = require('../../models/userModel');


const loadOrders = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = 5;

        const skip = (page - 1) * limit;

        const search = req.query.search || '';

        const sort = req.query.sort || 'new';

        let searchQuery = {};


            if(search){


            const users =
            await User.find({

            $or:[

            {
            name:{
            $regex:search,
            $options:'i'
            }
            },

            {
            email:{
            $regex:search,
            $options:'i'
            }
            }

            ]

            }).select('_id');



            searchQuery = {

            $or:[

            {

            orderId:{

            $regex:search,
            $options:'i'

            }

            },


            {

            userId:{

            $in:users.map(user=>user._id)

            }

            }


            ]


            };


            }
            const status = req.query.status || '';



            if(status){


            searchQuery.orderStatus = status;


            }
            let sortOption = {

            createdAt:-1

            };



            if(sort === 'old'){


            sortOption = {

            createdAt:1

            };


            }

        const totalOrders = await Order.countDocuments(searchQuery);

        const pendingCount = await Order.countDocuments({

            orderStatus:'Pending'

        });


        const inTransitCount = await Order.countDocuments({

            orderStatus:{

                $in:[
                    'Shipped',
                    'Out For Delivery'
                ]

            }

        });


        const revenueData = await Order.aggregate([

            {

                $match:{

                    orderStatus:'Delivered'

                }

            },


            {

                $group:{

                    _id:null,

                    total:{

                        $sum:'$finalAmount'

                    }

                }

            }

        ]);


        const totalRevenue =
        revenueData.length > 0
        ? revenueData[0].total
        : 0;


        // Return percentage

        const returnedCount =
        await Order.countDocuments({

            orderStatus:'Returned'

        });


        const allOrders =
        await Order.countDocuments();


        const returnRate =
        allOrders > 0
        ?
        ((returnedCount/allOrders)*100).toFixed(1)
        :
        0;

        const orders = await Order.find(searchQuery)

            .populate('userId')

            .sort(sortOption)
            .skip(skip)

            .limit(limit);

        const totalPages = Math.ceil(totalOrders / limit);

       res.render('admin/orders', {

            orders,
            currentPage:page,
            totalPages,
            search,
            status,
            sort,
            totalOrders,

            pendingCount,
            inTransitCount,
            totalRevenue,
            returnRate

        });

    }

    catch (error) {

        console.log(error);

        res.redirect('/admin/dashboard');

    }

};

const loadOrderDetails = async (req, res) => {

    try {

        const order = await Order.findById(req.params.id)

            .populate('userId')

            .populate('items.productId');

        res.render(

            'admin/order-details',

            { order }

        );

    }

    catch (error) {

        console.log(error);

        res.redirect('/admin/orders');

    }

};
const updateOrderStatus = async (req, res) => {

    try {

        const { status } = req.body;


        const order =
            await Order.findById(req.params.id);


        if (!order) {

            return res.json({

                success:false,

                message:'Order not found'

            });

        }



        // current status from database
        const currentStatus =
            order.orderStatus;



        // allowed ecommerce flow
        const allowedStatus = {


            Pending:[

                'Processing',

                'Cancelled'

            ],


            Processing:[

                'Shipped',

                'Cancelled'

            ],


            Shipped:[

                'Out For Delivery'

            ],


            'Out For Delivery':[

                'Delivered'

            ],


            Delivered:[],

                'Return Requested':[

                'Returned'

                ],




            Cancelled:[],


            Returned:[]

        };




        // block invalid movement
        if (

            !allowedStatus[currentStatus]
            .includes(status)

        ) {


            return res.json({

                success:false,


                message:
                `Cannot change ${currentStatus} to ${status}`

            });


        }




        // update order status
        order.orderStatus = status;


        // update every product status also
        order.items.forEach((item)=>{


           if(
            item.status !== 'Cancelled'
            ){


            item.status = status;


            }


        });


        await order.save();




        return res.json({

            success:true,


            message:
            'Order status updated successfully'

        });



    }


    catch(error){


        console.log(error);



        return res.json({

            success:false,


            message:'Update failed'

        });


    }

}
module.exports = {

    loadOrders,
    loadOrderDetails,
    updateOrderStatus

}