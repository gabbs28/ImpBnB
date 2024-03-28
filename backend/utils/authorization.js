const notAuthorized = (req, _res, next) => {

  const err = new Error('Require proper authorization');
  err.title = 'Require proper authorization';
  err.errors = { message: "Forbidden" };
  err.status = 403;
  return next(err);
};

module.exports = {
  notAuthorized
};