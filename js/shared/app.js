
import{setupLogin}from"./login.js";
import{applyTimeAtmosphere}from"./atmosphere.js";
import{setupPublicMode}from"../public/mode.js";
import{setupPrivateMode}from"../private/mode.js";
import{setupPrivateOnboarding}from"../private/onboarding.js";
import{setupPrivateEntry}from"../private/entry.js";

const app=document.getElementById("app");
const publicMode=setupPublicMode();
const privateMode=setupPrivateMode({app,publicMode});
const privateOnboarding=setupPrivateOnboarding();
setupPrivateEntry({publicMode,privateMode});

setupLogin({
  app,
  frontWorld:publicMode.world,
  onEnter:bootstrapData=>{
    const onboardingComplete=Boolean(bootstrapData?.w_user?.onboarding_complete);
    if(!onboardingComplete&&!privateOnboarding.isComplete())privateOnboarding.show();
  }
});

applyTimeAtmosphere();
