/*   acquisition mode*/
import{getAcquisitionExperience}from"../shared/api.js";

export function setupAcquisitionMode(){
  const world=document.getElementById("acquisitionWorld");
  const stage=document.getElementById("acquisitionStage");
  const progress=document.getElementById("acquisitionProgress");
  let data=null;
  let currentIndex=0;
  let cards=[];

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

  function buildStage(){
    stage.innerHTML="";
    cards=(data?.steps||[]).map((step,index)=>{
      const card=createCard(step,index);
      stage.appendChild(card);
      return card;
    });
    updateStage(false);
  }

  function createCard(step,index){
    const wrapper=document.createElement("article");
    wrapper.className=`acquisition-experience acquisition-${step.step_type||"moment"}`;
    wrapper.dataset.index=String(index);
    wrapper.dataset.pos="0";
    wrapper.setAttribute("aria-hidden","true");

    const card=document.createElement("div");
    card.className="acquisition-card";

    const surface=document.createElement("div");
    surface.className="acquisition-surface";

    const glow=document.createElement("div");
    glow.className="acquisition-glow";
    surface.appendChild(glow);

    const content=document.createElement("div");
    content.className="acquisition-content";

    const kicker=document.createElement("span");
    kicker.className="acquisition-kicker";
    kicker.textContent=getKicker(step);

    const heading=document.createElement("h1");
    heading.textContent=step.heading||data.experience?.title||"AKIN";

    const body=document.createElement("p");
    body.className="acquisition-body";
    body.textContent=step.body||"";

    content.append(kicker,heading);
    if(step.body)content.appendChild(body);

    const interaction=document.createElement("div");
    interaction.className="acquisition-interaction";
    content.appendChild(interaction);

    card.append(surface,content);
    wrapper.appendChild(card);

    renderInteraction(step,interaction,index);
    return wrapper;
  }

  function getKicker(step){
    switch(step.step_type){
      case"intro":return"A moment";
      case"choice":return"What would you do?";
      case"reflection":return"Look a little closer";
      case"value":return"Try this";
      case"cta":return"Your AKIN";
      default:return"AKIN";
    }
  }

  function renderInteraction(step,interaction,index){
    interaction.innerHTML="";

    if(step.options?.length){
      const options=document.createElement("div");
      options.className="acquisition-options";

      step.options.forEach(option=>{
        const button=document.createElement("button");
        button.type="button";
        button.className="acquisition-option";
        button.textContent=option.label;
        button.addEventListener("click",()=>selectOption(step,option,options,interaction,index));
        options.appendChild(button);
      });

      interaction.appendChild(options);
      return;
    }

    interaction.appendChild(createContinueButton(step.step_type==="cta"?"Create my AKIN":"Continue",index));
  }

  function selectOption(step,option,options,interaction,index){
    if(interaction.classList.contains("is-reflecting"))return;
    interaction.classList.add("is-reflecting");

    options.querySelectorAll(".acquisition-option").forEach(button=>{
      button.disabled=true;
      if(button.textContent===option.label)button.classList.add("is-selected");
      else button.classList.add("is-muted");
    });

    window.setTimeout(()=>{
      if(option.response_text){
        showResponse(option.response_text,interaction,index);
        return;
      }

      const thought=step.step_type==="reflection"
        ?"That answer matters more than it looks."
        :"Hold onto that choice for a moment.";
      showResponse(thought,interaction,index);
    },520);
  }

  function showResponse(text,interaction,index){
    const response=document.createElement("div");
    response.className="acquisition-response-wrap";

    const label=document.createElement("span");
    label.className="acquisition-response-label";
    label.textContent="AKIN noticed";

    const responseText=document.createElement("p");
    responseText.className="acquisition-response";
    responseText.textContent=text;

    response.append(label,responseText,createContinueButton("Continue",index));
    interaction.classList.add("is-changing");

    window.setTimeout(()=>{
      interaction.innerHTML="";
      interaction.appendChild(response);
      interaction.classList.remove("is-changing");
      requestAnimationFrame(()=>response.classList.add("is-visible"));
    },420);
  }

  function createContinueButton(label,index){
    const button=document.createElement("button");
    button.type="button";
    button.className="acquisition-continue";
    button.innerHTML=`<span>${label}</span><span aria-hidden="true">→</span>`;
    button.addEventListener("click",()=>next(index));
    return button;
  }

  function next(index){
    if(index!==currentIndex)return;

    if(currentIndex<data.steps.length-1){
      currentIndex+=1;
      updateStage(true);
      return;
    }

    world.classList.add("is-finishing");
    window.setTimeout(()=>{
      hide();
      world.classList.remove("is-finishing");
      document.getElementById("loginWorld").hidden=false;
    },900);
  }

  function updateStage(animate){
    progress.textContent=`${String(currentIndex+1).padStart(2,"0")} / ${String(data.steps.length).padStart(2,"0")}`;
    stage.classList.toggle("is-moving",animate);

    cards.forEach((card,index)=>{
      const position=index-currentIndex;
      card.dataset.pos=String(Math.max(-2,Math.min(2,position)));
      card.setAttribute("aria-hidden",position===0?"false":"true");
    });

    window.setTimeout(()=>stage.classList.remove("is-moving"),1500);
  }

  async function start(){
    const slug=getEntrySlug();
    if(!slug)return false;

    data=await getAcquisitionExperience(slug);
    currentIndex=0;
    document.getElementById("loginWorld").hidden=true;
    show();
    buildStage();
    return true;
  }

  hide();
  return{hasEntry,start,show,hide};
}
