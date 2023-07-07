// const appError = require("../util/appError");

const protectedRoute = async (req, res, next) => {
  const { authenticated, user } = req.session;

  if ((authenticated, user)) {
    next();
  } else {
    // next(appError("Not autharized ,Login again", 401));
    res.render("users/notAuthorize")

  }
};

module.exports = protectedRoute;
