/*   hidden private entry*/
import{getPrivateConfig,verifyPin,verifySecret,verifyBiometric}from"./auth.js";
function makeUnlockLayer(){
  const layer=document.createElement("section");layer.className="private-access-layer private-unlock-layer";layer.setAttribute("aria-hidden","true");
  layer.innerHTML=`<div class="private-access-card private-unlock-card"><div class="private-access-kicker">AKIN</div><h2>Welcome back.</h2><p id="unlockCopy">Enter your PIN.</p><div id="unlockBody"></div><div class="private-access-actions" id="unlockActions"></div></div>`;document.getElementById("app").appendChild(layer);return layer;
}
export function setupPrivateEntry({publicMode,privateMode}){
  const orb=publicMode.orb.orb,layer=makeUnlockLayer(),copy=layer.querySelector("#unlockCopy"),body=layer.querySelector("#unlockBody"),actions=layer.querySelector("#unlockActions");let tapCount=0,tapTimer=null,pointerStart=null,gesturePoints=[],holdTimer=null,comboTapCount=0,quoteHoldTimer=null;
  function config(){return getPrivateConfig()}
  function hideUnlock(){layer.classList.remove("is-visible");layer.setAttribute("aria-hidden","true");body.innerHTML="";actions.innerHTML=""}
  function enterPrivate(){hideUnlock();publicMode.orb.hideQuote();privateMode.enter()}
  function renderDots(pin){return`<div class="pin-dots">${[0,1,2,3].map(i=>`<span class="${pin.length>i?"is-filled":""}"></span>`).join("")}</div>`}
  function showUnlock(){
    const c=config();if(!c?.onboardingComplete)return;publicMode.orb.hideQuote();layer.classList.add("is-visible");layer.setAttribute("aria-hidden","false");copy.textContent="Enter your PIN.";let pin="";
    body.innerHTML=`<div id="unlockDots">${renderDots(pin)}</div><div class="pin-keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-digit="${n}">${n}</button>`).join("")}<span></span><button type="button" data-digit="0">0</button><button type="button" data-back>⌫</button></div>`;actions.innerHTML="";
    body.querySelectorAll("[data-digit]").forEach(b=>b.addEventListener("click",async()=>{if(pin.length>=4)return;pin+=b.dataset.digit;body.querySelector("#unlockDots").innerHTML=renderDots(pin);if(pin.length===4){if(await verifyPin(pin)){enterPrivate()}else{copy.textContent="That PIN did not match.";window.setTimeout(()=>{pin="";copy.textContent="Enter your PIN.";body.querySelector("#unlockDots").innerHTML=renderDots(pin)},650)}}}));
    body.querySelector("[data-back]").addEventListener("click",()=>{pin=pin.slice(0,-1);body.querySelector("#unlockDots").innerHTML=renderDots(pin)});
    if(c.biometricEnabled){const b=document.createElement("button");b.className="private-access-button";b.type="button";b.textContent="Use fingerprint / Face ID";b.addEventListener("click",async()=>{b.disabled=true;copy.textContent="Checking your device…";if(await verifyBiometric())enterPrivate();else{b.disabled=false;copy.textContent="Biometric unlock was not completed. You can use your PIN."}});actions.appendChild(b)}
    const cancel=document.createElement("button");cancel.className="private-access-button is-secondary";cancel.type="button";cancel.textContent="Cancel";cancel.addEventListener("click",hideUnlock);actions.appendChild(cancel);
  }
  function normalTap(){publicMode.orb.showQuote();if(config()?.method==="word")bindQuoteWord()}
  function bindQuoteWord(){window.setTimeout(()=>{const quote=publicMode.orb.getQuoteElement();if(!quote||quote.dataset.privateWordBound)return;quote.dataset.privateWordBound="1";quote.addEventListener("pointerdown",()=>{quoteHoldTimer=window.setTimeout(()=>showSecretInput(quote),1100)});["pointerup","pointercancel","pointerleave"].forEach(name=>quote.addEventListener(name,()=>window.clearTimeout(quoteHoldTimer)))},20)}
  function showSecretInput(quote){quote.classList.add("is-secret-entry");quote.innerHTML=`<input type="password" autocomplete="off" maxlength="40" aria-label="Enter word">`;const input=quote.querySelector("input");input.focus();input.addEventListener("keydown",async event=>{if(event.key!=="Enter")return;if(await verifySecret(input.value))showUnlock();else{input.value="";quote.classList.remove("is-secret-entry");quote.textContent="A little space can make things clearer."}})}
  function resetTaps(){tapCount=0;comboTapCount=0;window.clearTimeout(tapTimer)}
  orb.addEventListener("click",event=>{
    const c=config();if(!c?.onboardingComplete){normalTap();return}
    if(c.method==="hold"||c.method==="gesture")return;
    if(c.method==="tap"){tapCount++;window.clearTimeout(tapTimer);if(tapCount>=5){resetTaps();showUnlock();return}tapTimer=window.setTimeout(()=>{if(tapCount===1)normalTap();tapCount=0},520);return}
    if(c.method==="combo"){comboTapCount++;window.clearTimeout(tapTimer);tapTimer=window.setTimeout(()=>{if(comboTapCount===1)normalTap();comboTapCount=0},650);return}
    normalTap();
  });
  orb.addEventListener("pointerdown",event=>{
    const c=config();if(!c?.onboardingComplete)return;pointerStart={x:event.clientX,y:event.clientY};gesturePoints=[event.clientX];
    if(c.method==="hold")holdTimer=window.setTimeout(showUnlock,1800);
    if(c.method==="combo"&&comboTapCount>=2)holdTimer=window.setTimeout(()=>{resetTaps();showUnlock()},1350);
  });
  orb.addEventListener("pointermove",event=>{if(config()?.method!=="gesture"||!pointerStart)return;gesturePoints.push(event.clientX)});
  function finishPointer(){const c=config();window.clearTimeout(holdTimer);if(c?.method==="gesture"&&gesturePoints.length>3){const start=gesturePoints[0],min=Math.min(...gesturePoints),max=Math.max(...gesturePoints),end=gesturePoints[gesturePoints.length-1];if(start-min>22&&max-min>55&&max-end>22)showUnlock()}pointerStart=null;gesturePoints=[]}
  orb.addEventListener("pointerup",finishPointer);orb.addEventListener("pointercancel",finishPointer);
  return{showUnlock,hideUnlock};
}
