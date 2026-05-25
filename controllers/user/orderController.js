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

module.exports = {

    loadOrders,
    loadOrderDetails,
    cancelOrder
};