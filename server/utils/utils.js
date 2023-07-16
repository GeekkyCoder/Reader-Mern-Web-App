const jwt = require("jsonwebtoken");

const createJWT =  async ({payload }) => {
    return await jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME,
    });
  };

  
  // const ONE_DAY = 1000 * 60 * 60 * 24;


const attachCookiesToResponse = async ({res,user,refreshToken}) => {

    const accessTokenJWT =  await createJWT({ payload: { user } });
    const refreshTokenJWT =  await createJWT({ payload: { user, refreshToken } });
  
    const oneDay = 1000 * 60 * 60 * 24;
    const longerExp = 1000 * 60 * 60 * 24 * 30;
  
  
    res.cookie('accessToken', accessTokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      expires: new Date(Date.now() + oneDay),
      sameSite:"none"
    })
  
    res.cookie('refreshToken', refreshTokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      signed: true,
      expires: new Date(Date.now() + longerExp),
      sameSite:"none"
    });

    return res.status(200).json({ user });

  }

module.exports = {attachCookiesToResponse}