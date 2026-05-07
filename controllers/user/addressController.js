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

  } catch (error) {
    console.log(error);
req.session.message = {
    type: 'error',
    text: 'error loading address page'
  };  }
};


exports.addAddress = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const data = req.body;
    const isDefault = data.is_default === 'true';

    if (isDefault) {
      await Address.updateMany(
        { user_id: req.session.user.id },
        { $set: { is_default: false } }
      );
    }

    await Address.create({
      full_name: data.full_name,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      phone_number: data.phone_number,
      type : data.type,
      is_default: isDefault,
      user_id: req.session.user.id
    });

    req.session.message = { type: 'success', text: 'Address added successfully.' };
    res.redirect('/address');

  } catch (error) {
    console.log(error);
req.session.message = {
    type: 'error',
    text: ' add address error '
  };  }
};


exports.updateAddress = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { id } = req.params;
    const data = req.body;
    const isDefault = data.is_default === 'true';

    if (isDefault) {
      await Address.updateMany(
        { user_id: req.session.user.id },
        { $set: { is_default: false } }
      );
    }

    await Address.updateOne(
      { _id: id, user_id: req.session.user.id },
      {
        $set: {
          full_name: data.full_name,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          phone_number: data.phone_number,
         type : data.type,
          is_default: isDefault
        }
      }
    );

    req.session.message = { type: 'success', text: 'Address updated successfully.' };
    res.redirect('/address');

  } catch (error) {
    console.log(error);
req.session.message = {
    type: 'error',
    text: 'update address error'
  };  }
};


exports.deleteAddress = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const { id } = req.params;

    const deleted = await Address.findOneAndDelete({
      _id: id,
      user_id: req.session.user.id
    });

    if (deleted && deleted.is_default) {
      const firstAddress = await Address.findOne({
        user_id: req.session.user.id
      });

      if (firstAddress) {
        firstAddress.is_default = true;
        await firstAddress.save();
      }
    }

    req.session.message = { type: 'success', text: 'Address deleted successfully.' };
    res.redirect('/address');

  } catch (error) {
    console.log(error);
req.session.message = {
    type: 'error',
    text: 'delete address error'
  };  }
};