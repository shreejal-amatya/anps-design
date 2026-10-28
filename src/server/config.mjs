export function validateEnvironment(env) {
 const appEnv=env.APP_ENV;
 if (!["local","development","production"].includes(appEnv)) throw new Error("APP_ENV must be local, development or production");
 if(appEnv==="production") {
  for(const name of ["DATABASE_URL","AUTH_SECRET","AUTH_BASE_URL","MEDIA_PROVIDER"])
   if(!env[name]) throw new Error(`Missing required production setting: ${name}`);
 }
 return {appEnv};
}
