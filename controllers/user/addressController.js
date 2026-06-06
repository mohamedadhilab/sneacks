const Address = require('../../models/addressModel');


exports.getAddressPage = async (req, res) => {

    try {

        if (!req.session.user) {

            return res.redirect('/login');

        }

        const addresses = await Address.find({
    user_id: req.session.user.id
});

        res.render('user/address', {

            addresses,

            user: req.session.user

        });

    }

    catch (error) {

        console.log(error);

        req.session.message = {

            type: 'error',

            text: 'Error loading address page'

        };

    }

};



exports.addAddress = async (req, res) => {

    try {

        if (!req.session.user) {

            return res.redirect('/login');

        }

        const data = req.body;
        console.log(
'CHECKOUT ADDRESS BODY:',
data
);
        const isDefault =
            data.is_default === 'true';


        if (isDefault) {

            await Address.updateMany(

                {

                user_id: req.session.user.id
                },

                {

                    $set: {

                        is_default: false

                    }

                }

            );

        }

     

       const newAddress = await Address.create({

    full_name:
        data.full_name ||
        (data.first_name+' '+data.last_name),

    address:
        data.address,

    city:
        data.city,

    state:
        data.state,

    pincode:
        data.pincode,

    phone_number:
        data.phone_number,

    type:
    data.type || 'home',

    is_default:
        isDefault,

    user_id: req.session.user.id

});

        return res.json({

            success: true,
            addressId:newAddress._id,
            message:
                'Address added successfully.'

        });

    }

    catch (error) {

console.log(
'ADD ADDRESS ERROR:',
error.message
);
        return res.status(500).json({

            success: false,

            message:
                'Add address failed'

        });

    }

};



exports.updateAddress = async (req, res) => {

    try {

        if (!req.session.user) {

            return res.redirect('/login');

        }

        const { id } = req.params;

        const data = req.body;

        const isDefault =
            data.is_default === 'true';

      

        if (isDefault) {

            await Address.updateMany(

                {

                   user_id: req.session.user.id

                },

                {

                    $set: {

                        is_default: false

                    }

                }

            );

        }

       

        await Address.updateOne(

            {

                _id: id,

                user_id: req.session.user.id

            },

            {

                $set: {

                    full_name:
                        data.full_name,

                    address:
                        data.address,

                    city:
                        data.city,

                    state:
                        data.state,

                    pincode:
                        data.pincode,

                    phone_number:
                        data.phone_number,

                    type:
                        data.type,

                    is_default:
                        isDefault

                }

            }

        );

        return res.json({

            success: true,

            message:
                'Address updated successfully.'

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
                'Update address failed'

        });

    }

};



exports.deleteAddress = async (req, res) => {

    try {

        if (!req.session.user) {

            return res.redirect('/login');

        }

        const { id } = req.params;

        const deleted =
            await Address.findOneAndDelete({

                _id: id,

                user_id: req.session.user.id

            });

  

        if (

            deleted &&
            deleted.is_default

        ) {

            const firstAddress =
                await Address.findOne({

                   user_id: req.session.user.id

                });

            if (firstAddress) {

                firstAddress.is_default = true;

                await firstAddress.save();

            }

        }

        return res.json({

            success: true,

            message:
                'Address deleted successfully.'

        });

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message:
                'Delete address failed'

        });

    }

};