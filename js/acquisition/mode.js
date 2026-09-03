
/*   acquisition mode*/
import{getAcquisitionExperience}from"../shared/api.js";

export function setupAcquisitionMode(){
  const world=document.getElementById("acquisitionWorld");
  const card=document.getElementById("acquisitionCard");
  const progress=document.getElementById("acquisitionProgress");
  let data=null;
  let currentIndex=0;

  function getEntrySlug(){return new URLSearchParams(window.location.search).get("entry")?.trim()||""}
  function hasEntry(){return Boolean(getEntrySlug())}
  function show(){world.hidden=false;world.setAttribute("aria-hidden","false")}
  function hide(){world.hidden=true;world.setAttribute("aria-hidden","true")}

  function renderStep(){
    const step=data?.steps?.[currentIndex];
    if(!step)return;
    progress.textContent=`${String(currentIndex+1).padStart(2,"0")} / ${String(data.steps.length).padStart(2,"0")}`;
    card.classList.remove("is-entering");
    card.innerHTML="";

    const content=document.createElement("div");
    content.className="acquisition-content";

    const kicker=document.createElement("span");
    kicker.className="acquisition-kicker";
    kicker.textContent="AKIN";

    const heading=document.createElement("h1");
    heading.textContent=step.heading||data.experience?.title||"AKIN";

    const body=document.createElement("p");
    body.className="acquisition-body";
    body.textContent=step.body||"";

    content.append(kicker,heading);
    if(step.body)content.appendChild(body);
    card.appendChild(content);

    if(step.options?.length){
      renderOptions(step,content);
    }else{
      content.appendChild(createContinueButton(step.step_type==="cta"?"Create my AKIN":"Continue"));
    }

    requestAnimationFrame(()=>card.classList.add("is-entering"));
  }

  function renderOptions(step,content){
    const options=document.createElement("div");
    options.className="acquisition-options";

    step.options.forEach(option=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="acquisition-option";
      button.textContent=option.label;
      button.addEventListener("click",()=>selectOption(option,options,content));
      options.appendChild(button);
    });

    content.appendChild(options);
  }

  function selectOption(option,options,content){
    if(content.querySelector(".acquisition-continue"))return;

    options.querySelectorAll(".acquisition-option").forEach(button=>button.disabled=true);

    if(option.response_text){
      const response=document.createElement("div");
      response.className="acquisition-response-wrap";
      const responseLabel=document.createElement("span");
      responseLabel.className="acquisition-response-label";
      responseLabel.textContent="A thought for you";
      const responseText=document.createElement("p");
      responseText.className="acquisition-response";
      responseText.textContent=option.response_text;
      response.append(responseLabel,responseText);
      options.classList.add("is-leaving");
      window.setTimeout(()=>options.replaceWith(response),280);
      window.setTimeout(()=>response.appendChild(createContinueButton()),380);
      return;
    }

    const selected=[...options.children].find(button=>button.textContent===option.label);
    if(selected)selected.classList.add("is-selected");
    options.querySelectorAll(".acquisition-option").forEach(button=>{
      if(button!==selected)button.classList.add("is-muted");
    });
    content.appendChild(createContinueButton());
  }

  function createContinueButton(label="Continue"){
    const button=document.createElement("button");
    button.type="button";
    button.className="acquisition-continue";
    button.innerHTML=`<span>${label}</span><span aria-hidden="true">→</span>`;
    button.addEventListener("click",next);
    return button;
  }

  function next(){
    card.classList.remove("is-entering");
    card.classList.add("is-leaving");
    window.setTimeout(()=>{
      card.classList.remove("is-leaving");
      if(currentIndex<data.steps.length-1){
        currentIndex+=1;
        renderStep();
        return;
      }
      hide();
      document.getElementById("loginWorld").hidden=false;
    },360);
  }

  async function start(){
    const slug=getEntrySlug();
    if(!slug)return false;
    data=await getAcquisitionExperience(slug);
    currentIndex=0;
    document.getElementById("loginWorld").hidden=true;
    show();
    renderStep();
    return true;
  }

  hide();
  return{hasEntry,start,show,hide};
}
