const jwt = require("jsonwebtoken");

const { attachCookiesToResponse } = require("../utils/utils");

const isTokenValid = async (token) => await jwt.verify(token, process.env.JWT_SECRET);

const authMiddleware = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;
  
  try {
    if (accessToken) {
      const decodedUser = await isTokenValid(accessToken);
      const { userId, name, email, role } = decodedUser.user;
      req.user = { userId, name, email, role };
      return next();
    }

    const decodedUser = await isTokenValid(refreshToken);

    const existingToken = await Token.findOne({
      user: decodedUser.user.userId,
      refreshToken: decodedUser.refreshToken,
    });


    if (!existingToken || !existingToken?.isValid) {
      return res.status(401).json({ msg: "Authentication Invalid" });
    }

    await attachCookiesToResponse({
      res,
      user: decodedUser.user,
      refreshToken: existingToken.refreshToken,
    });

    const { name, userId, email, role } = decodedUser.user;

    req.user = { userId, name, email, role };
    next();
  } catch (error) {
    //  res.status(500).json({msg:error.message})
    return res.status(401).json({ msg: "Authentication Invalid" });
  }

  // if there is no token, user is not authorized

  // if (!req.signedCookies.token) {
  //   return res.status(400).json({ msg: "not authorized" });
  // }

  // const { token } = req.signedCookies;

  // const decodedUser = await isTokenValid(token);

  // if (decodedUser) {
  //   const { userId, name,email, role } = decodedUser;
  //   req.user = { userId, name,email, role };
  //   next();
  // } else {
  //   return res.status(400).json({ msg: "not authorized" });
  // }
};

module.exports = authMiddleware;
