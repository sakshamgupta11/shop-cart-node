module.exports = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/login');
  }

  if (!req.session.role) {
    return res.redirect('/');
  }

  next();
};