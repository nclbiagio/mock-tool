import jwt from 'jsonwebtoken';

export const generateToken = (
   email: string,
   userId: number,
   passwordChangedAt: string
): { token: string; refreshToken: string } => {
   const expiresIn = 10000000000;
   const jwtSecret = 'proxydev';
   const token = jwt.sign({ email, userId, passwordChangedAt }, jwtSecret, {
      expiresIn,
   });
   const refreshToken = jwt.sign(
      {
         email,
         userId,
         token,
         passwordChangedAt,
      },
      jwtSecret,
      { expiresIn }
   );
   return { token, refreshToken };
};
