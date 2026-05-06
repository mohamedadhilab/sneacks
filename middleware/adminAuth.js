exports.isAdminLoggedIn = (req, res, next) => {

  if (req.session.admin) {
    return next();
  }

  return res.redirect('/admin/login');
};


exports.isAdminLoggedOut = (req, res, next) => {

  if (req.session.admin) {
    return res.redirect('/admin/dashboard');
  }

  next();
};