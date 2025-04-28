const recruiterLoggedIn = (req, res, next) => {
  if (req.session.recruiterId) {
      next();
  } else {
      res.status(401).json({ message: "Unauthorized: Please log in" });
  }
};

module.exports = { recruiterLoggedIn };
