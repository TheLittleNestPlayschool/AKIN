/*   private access onboarding*/
import{getPrivateConfig,savePrivateConfig,setPin,setSecret,enrollBiometric,biometricSupported}from"./auth.js";

const methods=[
  {id:"tap",name:"Tap pattern",copy:"Tap the orb five times quickly."},
  {id:"hold",name:"Press & hold",copy:"Press and hold the orb for about two seconds."},
  {id:"gesture",name:"Gesture sequence",copy:"Touch the orb and move left, right, then left before releasing."},
  {id:"word",name:"Secret word",copy:"Press and hold the orb, then enter your private word."},
  {id:"combo",name:"Combination",copy:"Tap twice, then press and hold the orb."}
];

function makeLayer(){
  const layer=document.createElement("section");
  layer.className="private-access-layer private-setup-layer";
  layer.setAttribute("aria-hidden","true");
  layer.innerHTML=`
    <div class="private-access-card">
      <div class="private-access-kicker">Your private space</div>
      <h2 id="setupTitle"></h2>
      <p id="setupCopy"></p>
      <div id="setupBody"></div>
      <div class="private-access-actions" id="setupActions"></div>
    </div>`;

  document.getElementById("app").appendChild(layer);
  return layer;
}

export function setupPrivateOnboarding(){
  const layer=makeLayer();
  const title=layer.querySelector("#setupTitle");
  const copy=layer.querySelector("#setupCopy");
  const body=layer.querySelector("#setupBody");
  const actions=layer.querySelector("#setupActions");

  let method=null;
  let pin="";
  let confirmPin="";

  function show(){
    layer.classList.add("is-visible");
    layer.setAttribute("aria-hidden","false");
    chooseMethod();
  }

  function hide(){
    layer.classList.remove("is-visible");
    layer.setAttribute("aria-hidden","true");
  }

  function button(label,fn,secondary=false){
    const item=document.createElement("button");
    item.type="button";
    item.className=`private-access-button${secondary?" is-secondary":""}`;
    item.textContent=label;
    item.addEventListener("click",fn);
    return item;
  }

  function chooseMethod(){
    title.textContent="Choose your private entrance.";
    copy.textContent="AKIN will always open in Public Mode. Choose the hidden action you will use when you want your private space.";
    body.innerHTML=`
      <div class="entry-method-grid">
        ${methods.map(item=>`
          <button type="button" class="entry-method" data-method="${item.id}">
            <strong>${item.name}</strong>
            <span>${item.copy}</span>
          </button>`).join("")}
      </div>`;
    actions.innerHTML="";

    body.querySelectorAll(".entry-method").forEach(item=>{
      item.addEventListener("click",()=>{
        method=item.dataset.method;
        methodDetails();
      });
    });
  }

  function methodDetails(){
    const selected=methods.find(item=>item.id===method);
    title.textContent=selected.name;
    copy.textContent=selected.copy;
    body.innerHTML="";
    actions.innerHTML="";

    if(method==="word"){
      body.innerHTML=`
        <label class="private-access-field">
          Choose your secret word or phrase
          <input id="secretEntry" type="password" autocomplete="off" maxlength="40" placeholder="Your private word">
        </label>`;

      actions.append(
        button("Continue",async()=>{
          const value=body.querySelector("#secretEntry").value.trim();
          if(value.length<3)return;

          const config={method,onboardingComplete:false,biometricEnabled:false};
          savePrivateConfig(config);
          await setSecret(config,value);
          createPin();
        }),
        button("Back",chooseMethod,true)
      );
      return;
    }

    const config={method,onboardingComplete:false,biometricEnabled:false};
    savePrivateConfig(config);
    actions.append(button("Continue",createPin),button("Back",chooseMethod,true));
  }

  function renderPinDots(value){
    return`<div class="pin-dots">${[0,1,2,3].map(i=>`<span class="${value.length>i?"is-filled":""}"></span>`).join("")}</div>`;
  }

  function keypad(){
    return`
      <div class="pin-keypad">
        ${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-digit="${n}">${n}</button>`).join("")}
        <span></span>
        <button type="button" data-digit="0">0</button>
        <button type="button" data-back>⌫</button>
      </div>`;
  }

  function bindKeypad(onChange){
    body.querySelectorAll("[data-digit]").forEach(item=>{
      item.addEventListener("click",()=>onChange(item.dataset.digit));
    });

    body.querySelector("[data-back]")?.addEventListener("click",()=>onChange("back"));
  }

  function createPin(){
    pin="";
    title.textContent="Create your 4-digit PIN.";
    copy.textContent="This is your backup unlock even if you use biometrics.";
    body.innerHTML=`<div id="setupPinDots">${renderPinDots(pin)}</div>${keypad()}`;
    actions.innerHTML="";

    bindKeypad(value=>{
      if(value==="back")pin=pin.slice(0,-1);
      else if(pin.length<4)pin+=value;

      body.querySelector("#setupPinDots").innerHTML=renderPinDots(pin);
      if(pin.length===4)window.setTimeout(confirmPinStep,180);
    });
  }

  function confirmPinStep(){
    confirmPin="";
    title.textContent="Confirm your PIN.";
    copy.textContent="Enter the same four digits again.";
    body.innerHTML=`<div id="setupPinDots">${renderPinDots(confirmPin)}</div>${keypad()}`;

    bindKeypad(async value=>{
      if(value==="back")confirmPin=confirmPin.slice(0,-1);
      else if(confirmPin.length<4)confirmPin+=value;

      body.querySelector("#setupPinDots").innerHTML=renderPinDots(confirmPin);

      if(confirmPin.length===4){
        if(confirmPin!==pin){
          copy.textContent="Those did not match. Try again.";
          window.setTimeout(createPin,700);
          return;
        }

        const config=getPrivateConfig()||{method};
        await setPin(config,pin);
        window.setTimeout(biometricsStep,180);
      }
    });
  }

  function biometricsStep(){
    title.textContent="Use biometrics too?";
    copy.textContent=biometricSupported()
      ?"You can unlock with your device fingerprint or face recognition. Your 4-digit PIN always remains available."
      :"This browser or device does not currently offer biometric unlock. Your PIN will still work.";
    body.innerHTML="";
    actions.innerHTML="";

    if(biometricSupported()){
      actions.append(button("Enable biometrics",async()=>{
        const item=actions.querySelector("button");
        item.disabled=true;

        try{
          await enrollBiometric(getPrivateConfig());
          finish();
        }catch{
          item.disabled=false;
          copy.textContent="Biometric setup was not completed. You can continue with your PIN.";
        }
      }));
    }

    actions.append(button("Use PIN only",finish,true));
  }

  function finish(){
    const config=getPrivateConfig();
    config.onboardingComplete=true;
    savePrivateConfig(config);
    title.textContent="You are set.";
    copy.textContent="AKIN will open in Public Mode. Use the private entrance you chose, then unlock with biometrics or your PIN.";
    body.innerHTML="";
    actions.innerHTML="";
    actions.append(button("Got it",hide));
  }

  return{
    show,
    hide,
    isComplete:()=>Boolean(getPrivateConfig()?.onboardingComplete)
  };
}
