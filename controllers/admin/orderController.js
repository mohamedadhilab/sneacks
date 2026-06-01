const Order = require('../../models/orderModel');

const loadOrders = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = 10;

        const skip = (page - 1) * limit;

        const search = req.query.search || '';

        let searchQuery = {};

        if (search) {

            searchQuery = {

                orderId: {
                    $regex: search,
                    $options: 'i'
                }

            };

        }

        const totalOrders = await Order.countDocuments(searchQuery);

        const orders = await Order.find(searchQuery)

            .populate('userId')

            .sort({ createdAt: -1 })

            .skip(skip)

            .limit(limit);

        const totalPages = Math.ceil(totalOrders / limit);

        res.render('admin/orders', {

            orders,
            currentPage: page,
            totalPages,
            search

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

        if(!order){

            return res.json({

                success:false,

                message:'Order not found'

            });

        }

        order.orderStatus = status;

        await order.save();

        return res.json({

            success:true

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