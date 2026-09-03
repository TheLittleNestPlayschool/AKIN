
/*   acquisition mode*/
import{getAcquisitionExperience}from"../shared/api.js";

export function setupAcquisitionMode(){
  const world=document.getElementById("acquisitionWorld");
  const card=document.getElementById("acquisitionCard");
  const progress=document.getElementById("acquisitionProgress");
  let data=null;
  let currentIndex=0;

  function getEntrySlug(){
    return new URLSearchParams(window.location.search).get("entry")?.trim()||"";
  }

  function hasEntry(){return Boolean(getEntrySlug())}

  function show(){
    world.hidden=false;
    world.setAttribute("aria-hidden","false");
  }

  function hide(){
    world.hidden=true;
    world.setAttribute("aria-hidden","true");
  }

  function renderStep(){
    const step=data?.steps?.[currentIndex];
    if(!step)return;
    progress.textContent=`${currentIndex+1} of ${data.steps.length}`;
    card.innerHTML="";

    const kicker=document.createElement("span");
    kicker.className="acquisition-kicker";
    kicker.textContent="AKIN";

    const heading=document.createElement("h1");
    heading.textContent=step.heading||data.experience?.title||"AKIN";

    const body=document.createElement("p");
    body.className="acquisition-body";
    body.textContent=step.body||"";

    card.append(kicker,heading,body);

    if(step.options?.length){
      const options=document.createElement("div");
      options.className="acquisition-options";
      step.options.forEach(option=>{
        const button=document.createElement("button");
        button.type="button";
        button.className="acquisition-option";
        button.textContent=option.label;
        button.addEventListener("click",()=>{
          if(option.response_text){
            const response=document.createElement("p");
            response.className="acquisition-response";
            response.textContent=option.response_text;
            options.replaceWith(response,createContinueButton());
          }else{
            next();
          }
        });
        options.appendChild(button);
      });
      card.appendChild(options);
      return;
    }

    card.appendChild(createContinueButton(step.step_type==="cta"?"Create my AKIN":"Continue"));
  }

  function createContinueButton(label="Continue"){
    const button=document.createElement("button");
    button.type="button";
    button.className="entry-button entry-primary acquisition-continue";
    button.textContent=label;
    button.addEventListener("click",next);
    return button;
  }

  function next(){
    if(currentIndex<data.steps.length-1){
      currentIndex+=1;
      renderStep();
      return;
    }
    hide();
    document.getElementById("loginWorld").hidden=false;
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
