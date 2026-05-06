const Address = require('../../models/addressModel');

// ================= GET ADDRESS PAGE =================
exports.getAddressPage = async (req, res) => {
  try {
    // ✅ SAFETY CHECK (VERY IMPORTANT)
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
    res.send('Error loading address page');
  }
};


// ================= ADD ADDRESS =================
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
      is_default: isDefault,
      user_id: req.session.user.id
    });

    req.session.message = { type: 'success', text: 'Address added successfully.' };
    res.redirect('/address');

  } catch (error) {
    console.log(error);
    res.send('Add address error');
  }
};


// ================= UPDATE ADDRESS =================
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
          is_default: isDefault
        }
      }
    );

    req.session.message = { type: 'success', text: 'Address updated successfully.' };
    res.redirect('/address');

  } catch (error) {
    console.log(error);
    res.send('Update address error');
  }
};


// ================= DELETE ADDRESS =================
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

    // 🔥 maintain default logic
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
    res.send('Delete address error');
  }
};