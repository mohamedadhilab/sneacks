exports.isLoggedIn = (req, res, next) => {

  if (req.session.user) {
    return next();
  }

  return res.redirect('/login');
};


exports.isLoggedOut = (req, res, next) => {

  if (req.session.user) {
    return res.redirect('/home');
  }

  next();
};