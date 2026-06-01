const User = require('../models/userModel');
exports.isLoggedIn = async (req, res, next) => {

  try {
if (!req.session.user) {

    // =====================================
    // AJAX / FETCH REQUEST
    // =====================================

    if (

        req.xhr ||

        (
            req.headers.accept &&

            req.headers.accept.includes(
                'application/json'
            )
        )

    ) {

        return res.status(401).json({

            success: false,

            message: 'Please login first'

        });

    }

    // =====================================
    // NORMAL REQUEST
    // =====================================

    req.session.message = {

        type: 'error',

        text: 'Please login first'

    };

    return res.redirect('/login');

}

    const user = await User.findById(req.session.user.id);

    if (!user || user.isBlocked) {

      delete req.session.user;

      req.session.message = {
        type: 'error',
        text: 'Your account has been blocked'
      };

      return res.redirect('/login');

    }

    next();

  } catch (error) {

    console.log(error);

    return res.redirect('/login');

  }

};

exports.isLoggedOut = (req, res, next) => {

  if (req.session.user) {
    return res.redirect('/home');
  }

  next();
};