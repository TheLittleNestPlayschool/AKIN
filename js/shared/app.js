
import{setupLogin}from"./login.js";
import{applyTimeAtmosphere}from"./atmosphere.js";
import{setupPublicMode}from"../public/mode.js";
import{setupPrivateMode}from"../private/mode.js";
const app=document.getElementById("app");
const publicMode=setupPublicMode();
setupPrivateMode({app,publicMode});
setupLogin({app,frontWorld:publicMode.world});
applyTimeAtmosphere();
