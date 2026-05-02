const Address = require('../../models/addressModel');

// ================= GET ADDRESS PAGE =================
exports.getAddressPage = async (req, res) => {
  try {
    const addresses = await Address.find({
      user_id: req.session.user.id
    });

    res.render('address', { addresses });

  } catch (error) {
    console.log(error);
    res.send('Error loading address page');
  }
};


// ================= ADD ADDRESS =================
exports.addAddress = async (req, res) => {
  try {
    const data = req.body;

    // 🔥 handle default address
    if (data.is_default) {
      await Address.updateMany(
        { user_id: req.session.user.id },
        { is_default: false }
      );
    }

    await Address.create({
      ...data,
      user_id: req.session.user.id
    });

    res.redirect('/address');

  } catch (error) {
    console.log(error);
    res.send('Add address error');
  }
};


// ================= UPDATE ADDRESS =================
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.is_default) {
      await Address.updateMany(
        { user_id: req.session.user.id },
        { is_default: false }
      );
    }

    await Address.updateOne(
      { _id: id, user_id: req.session.user.id },
      { $set: data }
    );

    res.redirect('/address');

  } catch (error) {
    console.log(error);
    res.send('Update address error');
  }
};


// ================= DELETE ADDRESS =================
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    await Address.deleteOne({
      _id: id,
      user_id: req.session.user.id
    });

    res.redirect('/address');

  } catch (error) {
    console.log(error);
    res.send('Delete address error');
  }
};