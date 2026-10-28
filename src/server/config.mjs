export function validateEnvironment(env) {
 const appEnv=env.APP_ENV;
 if (!["local","development","production"].includes(appEnv)) throw new Error("APP_ENV must be local, development or production");
 if(appEnv==="production") {
  for(const name of ["DATABASE_URL","NEON_AUTH_COOKIE_SECRET","NEON_AUTH_BASE_URL","MEDIA_PROVIDER","ENQUIRY_RATE_LIMIT_SECRET","AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","AWS_ENDPOINT_URL_S3","AWS_REGION","MEDIA_BUCKET"])
   if(!env[name]) throw new Error(`Missing required production setting: ${name}`);
 }
 return {appEnv};
}
