exports.isLoggedIn = (req, res, next) => {

  if (req.session.user) {
    return next();
  }

  req.session.message = {
    type: 'error',
    text: 'Please login first'
  };

  return res.redirect('/login');
};


exports.isLoggedOut = (req, res, next) => {

  if (req.session.user) {
    return res.redirect('/home');
  }

  next();
};