
/*   hidden private entry*/
import{getPrivateConfig,verifyPin,verifySecret,verifyBiometric}from"./auth.js";

function makeUnlockLayer(){
  const layer=document.createElement("section");
  layer.className="private-access-layer private-unlock-layer";
  layer.setAttribute("aria-hidden","true");
  layer.innerHTML=`
    <div class="private-access-card private-unlock-card">
      <div class="private-access-kicker">AKIN</div>
      <h2>Welcome back.</h2>
      <p id="unlockCopy">Enter your PIN.</p>
      <div id="unlockBody"></div>
      <div class="private-access-actions" id="unlockActions"></div>
    </div>`;

  document.getElementById("app").appendChild(layer);
  return layer;
}

export function setupPrivateEntry({publicMode,privateMode}){
  const orb=publicMode.orb.orb;
  const layer=makeUnlockLayer();
  const copy=layer.querySelector("#unlockCopy");
  const body=layer.querySelector("#unlockBody");
  const actions=layer.querySelector("#unlockActions");

  let tapCount=0;
  let tapTimer=null;
  let pointerStart=null;
  let gesturePoints=[];
  let holdTimer=null;
  let comboTapCount=0;
  let entryTriggered=false;

  function config(){
    return getPrivateConfig();
  }

  function hideUnlock(){
    layer.classList.remove("is-visible");
    layer.setAttribute("aria-hidden","true");
    body.innerHTML="";
    actions.innerHTML="";
  }

  function enterPrivate(){
    hideUnlock();
    publicMode.orb.hideQuote();
    privateMode.enter();
  }

  function renderDots(pin){
    return`<div class="pin-dots">${[0,1,2,3].map(i=>`<span class="${pin.length>i?"is-filled":""}"></span>`).join("")}</div>`;
  }

  function showUnlock(){
    const current=config();
    if(!current?.onboardingComplete)return;

    entryTriggered=true;
    publicMode.orb.hideQuote();
    layer.classList.add("is-visible");
    layer.setAttribute("aria-hidden","false");
    copy.textContent="Enter your PIN.";

    let pin="";
    body.innerHTML=`
      <div id="unlockDots">${renderDots(pin)}</div>
      <div class="pin-keypad">
        ${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-digit="${n}">${n}</button>`).join("")}
        <span></span>
        <button type="button" data-digit="0">0</button>
        <button type="button" data-back>⌫</button>
      </div>`;
    actions.innerHTML="";

    body.querySelectorAll("[data-digit]").forEach(button=>{
      button.addEventListener("click",async()=>{
        if(pin.length>=4)return;

        pin+=button.dataset.digit;
        body.querySelector("#unlockDots").innerHTML=renderDots(pin);

        if(pin.length===4){
          if(await verifyPin(pin)){
            enterPrivate();
            return;
          }

          copy.textContent="That PIN did not match.";
          window.setTimeout(()=>{
            pin="";
            copy.textContent="Enter your PIN.";
            body.querySelector("#unlockDots").innerHTML=renderDots(pin);
          },650);
        }
      });
    });

    body.querySelector("[data-back]").addEventListener("click",()=>{
      pin=pin.slice(0,-1);
      body.querySelector("#unlockDots").innerHTML=renderDots(pin);
    });

    if(current.biometricEnabled){
      const biometric=document.createElement("button");
      biometric.className="private-access-button";
      biometric.type="button";
      biometric.textContent="Use fingerprint / Face ID";

      biometric.addEventListener("click",async()=>{
        biometric.disabled=true;
        copy.textContent="Checking your device…";

        if(await verifyBiometric()){
          enterPrivate();
          return;
        }

        biometric.disabled=false;
        copy.textContent="Biometric unlock was not completed. You can use your PIN.";
      });

      actions.appendChild(biometric);
    }

    const cancel=document.createElement("button");
    cancel.className="private-access-button is-secondary";
    cancel.type="button";
    cancel.textContent="Cancel";
    cancel.addEventListener("click",hideUnlock);
    actions.appendChild(cancel);
  }

  function normalTap(){
    publicMode.orb.showQuote();
  }

  function showSecretInput(){
    entryTriggered=true;
    publicMode.orb.showQuote();

    window.setTimeout(()=>{
      const quote=publicMode.orb.getQuoteElement();
      if(!quote)return;

      quote.classList.add("is-secret-entry","is-visible");
      quote.innerHTML=`
        <form class="secret-word-form">
          <input type="password" autocomplete="off" maxlength="40" placeholder="Your word" aria-label="Enter your word">
          <button type="submit" aria-label="Continue">→</button>
        </form>`;

      const form=quote.querySelector("form");
      const input=quote.querySelector("input");
      input.focus();

      form.addEventListener("submit",async event=>{
        event.preventDefault();

        if(await verifySecret(input.value)){
          quote.classList.remove("is-secret-entry");
          showUnlock();
          return;
        }

        input.value="";
        input.focus();
      });
    },20);
  }

  function resetTaps(){
    tapCount=0;
    comboTapCount=0;
    window.clearTimeout(tapTimer);
  }

  orb.addEventListener("click",()=>{
    const current=config();

    if(entryTriggered){
      entryTriggered=false;
      return;
    }

    if(!current?.onboardingComplete){
      normalTap();
      return;
    }

    if(current.method==="hold"||current.method==="gesture"||current.method==="word"){
      normalTap();
      return;
    }

    if(current.method==="tap"){
      tapCount++;
      window.clearTimeout(tapTimer);

      if(tapCount>=5){
        resetTaps();
        showUnlock();
        return;
      }

      tapTimer=window.setTimeout(()=>{
        if(tapCount===1)normalTap();
        tapCount=0;
      },520);
      return;
    }

    if(current.method==="combo"){
      comboTapCount++;
      window.clearTimeout(tapTimer);
      tapTimer=window.setTimeout(()=>{
        if(comboTapCount===1)normalTap();
        comboTapCount=0;
      },650);
      return;
    }

    normalTap();
  });

  orb.addEventListener("pointerdown",event=>{
    const current=config();
    if(!current?.onboardingComplete)return;

    entryTriggered=false;
    pointerStart={x:event.clientX,y:event.clientY};
    gesturePoints=[event.clientX];

    if(current.method==="hold"){
      holdTimer=window.setTimeout(showUnlock,1800);
    }

    if(current.method==="word"){
      holdTimer=window.setTimeout(showSecretInput,1200);
    }

    if(current.method==="combo"&&comboTapCount>=2){
      holdTimer=window.setTimeout(()=>{
        resetTaps();
        showUnlock();
      },1350);
    }
  });

  orb.addEventListener("pointermove",event=>{
    if(config()?.method!=="gesture"||!pointerStart)return;
    gesturePoints.push(event.clientX);
  });

  function finishPointer(){
    const current=config();
    window.clearTimeout(holdTimer);

    if(current?.method==="gesture"&&!entryTriggered&&gesturePoints.length>3){
      const start=gesturePoints[0];
      const min=Math.min(...gesturePoints);
      const max=Math.max(...gesturePoints);
      const end=gesturePoints[gesturePoints.length-1];

      if(start-min>22&&max-min>55&&max-end>22){
        showUnlock();
      }
    }

    pointerStart=null;
    gesturePoints=[];
  }

  orb.addEventListener("pointerup",finishPointer);
  orb.addEventListener("pointercancel",finishPointer);

  return{showUnlock,hideUnlock};
}
