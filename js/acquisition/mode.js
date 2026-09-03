/*   acquisition mode*/
import{getAcquisitionExperience}from"../shared/api.js";
import{getAcquisitionTheme,getAcquisitionAsset}from"./themes.js";

export function setupAcquisitionMode(){
  const world=document.getElementById("acquisitionWorld");
  const stage=document.getElementById("acquisitionStage");
  const progress=document.getElementById("acquisitionProgress");
  const backdropA=document.getElementById("acquisitionBackdropA");
  const backdropB=document.getElementById("acquisitionBackdropB");
  let data=null;
  let theme=null;
  let currentIndex=0;
  let cards=[];
  let activeBackdrop=0;

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

  function normalizeText(value){
    return String(value||"")
      .replace(/<br\s*\/?\s*>/gi,"\n")
      .replace(/\r\n/g,"\n")
      .trim();
  }

  function setFormattedText(element,value){
    element.textContent=normalizeText(value);
  }

  function getStepAsset(step){
    return getAcquisitionAsset(theme,step?.step_type||"intro");
  }

  function setBackdrop(asset,immediate=false){
    if(!asset||!backdropA||!backdropB)return;
    const next=activeBackdrop===0?backdropB:backdropA;
    const current=activeBackdrop===0?backdropA:backdropB;
    next.style.backgroundImage=`url("${asset}")`;

    if(immediate){
      current.style.backgroundImage=`url("${asset}")`;
      current.classList.add("is-visible");
      next.classList.remove("is-visible");
      return;
    }

    next.classList.add("is-visible");
    current.classList.remove("is-visible");
    activeBackdrop=activeBackdrop===0?1:0;
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

    const asset=getStepAsset(step);
    if(asset)wrapper.style.setProperty("--acquisition-card-image",`url("${asset}")`);

    const card=document.createElement("div");
    card.className="acquisition-card";

    const surface=document.createElement("div");
    surface.className="acquisition-surface";
    surface.appendChild(document.createElement("div")).className="acquisition-glow";

    const content=document.createElement("div");
    content.className="acquisition-content";

    const copy=document.createElement("div");
    copy.className="acquisition-copy";

    const kicker=document.createElement("span");
    kicker.className="acquisition-kicker";
    kicker.textContent=getKicker(step);

    const heading=document.createElement("h1");
    setFormattedText(heading,step.heading||data.experience?.title||"AKIN");

    copy.append(kicker,heading);

    if(step.body){
      const body=document.createElement("p");
      body.className="acquisition-body";
      setFormattedText(body,step.body);
      copy.appendChild(body);
    }

    content.appendChild(copy);

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
      case"intro":return"A real-life moment";
      case"choice":return"What would you do?";
      case"reflection":return"AKIN is noticing";
      case"value":return"Something to try";
      case"cta":return"What this could become";
      default:return"AKIN";
    }
  }

  function renderInteraction(step,interaction,index){
    interaction.innerHTML="";

    if(step.question_text&&step.options?.length){
      const question=document.createElement("p");
      question.className="acquisition-question";
      setFormattedText(question,step.question_text);
      interaction.appendChild(question);
    }

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
      const thought=option.response_text||(step.step_type==="reflection"
        ?"That answer matters more than it looks."
        :"Hold onto that choice for a moment.");
      showResponse(thought,interaction,index);
    },440);
  }

  function showResponse(text,interaction,index){
    const response=document.createElement("div");
    response.className="acquisition-response-wrap";

    const label=document.createElement("span");
    label.className="acquisition-response-label";
    label.textContent="AKIN noticed";

    const responseText=document.createElement("p");
    responseText.className="acquisition-response";
    setFormattedText(responseText,text);

    response.append(label,responseText,createContinueButton("Continue",index));
    interaction.classList.add("is-changing");

    window.setTimeout(()=>{
      interaction.innerHTML="";
      interaction.appendChild(response);
      interaction.classList.remove("is-changing");
      requestAnimationFrame(()=>response.classList.add("is-visible"));
    },360);
  }

  function createContinueButton(label,index){
    const button=document.createElement("button");
    button.type="button";
    button.className="acquisition-continue";
    const text=document.createElement("span");
    text.textContent=label;
    const arrow=document.createElement("span");
    arrow.setAttribute("aria-hidden","true");
    arrow.textContent="→";
    button.append(text,arrow);
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

    const loginWorld=document.getElementById("loginWorld");
    const loginAsset=theme?.assets?.login||getStepAsset(data.steps[currentIndex]);
    if(loginAsset){
      loginWorld.style.setProperty("--login-acquisition-image",`url("${loginAsset}")`);
      loginWorld.classList.add("from-acquisition");
    }

    world.classList.add("is-finishing");
    window.setTimeout(()=>{
      hide();
      world.classList.remove("is-finishing");
      loginWorld.hidden=false;
    },780);
  }

  function updateStage(animate){
    const step=data.steps[currentIndex];
    progress.textContent=`${String(currentIndex+1).padStart(2,"0")} / ${String(data.steps.length).padStart(2,"0")}`;
    stage.classList.toggle("is-moving",animate);
    setBackdrop(getStepAsset(step),!animate&&currentIndex===0);

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
    theme=getAcquisitionTheme(slug);
    currentIndex=0;
    activeBackdrop=0;
    document.getElementById("loginWorld").hidden=true;
    show();
    buildStage();
    return true;
  }

  hide();
  return{hasEntry,start,show,hide};
}
