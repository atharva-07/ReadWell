exports.isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.redirect('/');
  }
  next();
};
