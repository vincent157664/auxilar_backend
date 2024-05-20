import dotenv from "dotenv";

dotenv.config();
export default {
  mongoURI: process.env.DATABASE_URI,
  jwtSecret: process.env.JWT_SECRET,
  apiVersion: process.env.API_VERSION,
  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESSKEYID,
  awsSecretAccessKey: process.env.AWS_SECRETACCESSKEY,
  strpSecreteKey: process.env.STRP_SECRETKEY,
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
};
