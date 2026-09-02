/*   reusable spatial card carousel*/
export function createCardCarousel({element,cards,hint=null,onActivate=null}){
  let activeIndex=0,enabled=true,hasInteracted=false,backButton=null,moreButton=null,moving=false,moveTimer=null;
  const moveDuration=1450;
  const cardSurfaces=cards.map(item=>{
    if(Array.isArray(item.photos)&&item.photos.length){
      const photo=item.photos[Math.floor(Math.random()*item.photos.length)];
      return{type:"photo",value:photo};
    }
    return{type:"background",value:item.background||""};
  });
  function build(){
    element.innerHTML="";
    cards.forEach((item,index)=>{
      const article=document.createElement("article");
      article.className="experience";
      article.dataset.index=index;
      article.dataset.cardId=item.id;
      const surface=cardSurfaces[index];
      const surfaceStyle=surface.type==="photo"?`--card-image:url('${surface.value}')`:`--card-bg:${surface.value}`;
      article.innerHTML=`<div class="card"><div class="card-surface ${surface.type==="photo"?"has-photo":""}" style="${surfaceStyle}"></div><div class="card-type">${item.type}</div><div class="card-content"><div class="card-kicker">${item.kicker}</div><h2 class="card-title">${item.title}</h2><p class="card-copy">${item.copy}</p><div class="card-pills">${item.pills.map(pill=>`<span class="card-pill">${pill}</span>`).join("")}</div></div></div>`;
      article.addEventListener("click",()=>{
        if(!enabled||moving||Number(article.dataset.index)!==activeIndex)return;
        if(typeof onActivate==="function")onActivate(item,activeIndex);
      });
      element.appendChild(article);
    });
    backButton=createNavigationButton("back");
    moreButton=createNavigationButton("more");
    element.append(backButton,moreButton);
    render();
  }
  function createNavigationButton(direction){
    const isMore=direction==="more";
    const button=document.createElement("button");
    button.type="button";
    button.className=`carousel-nav-handle carousel-nav-${direction}`;
    button.setAttribute("aria-label",isMore?"Show more":"Go back");
    button.innerHTML=`<span class="card-nav-handle-label">${isMore?"More":"Back"}</span>`;
    button.addEventListener("pointerdown",event=>event.stopPropagation());
    button.addEventListener("click",event=>{
      event.preventDefault();
      event.stopPropagation();
      move(isMore?1:-1);
    });
    return button;
  }
  function hideNavigation(){
    backButton?.classList.remove("is-visible");
    moreButton?.classList.remove("is-visible");
    if(backButton)backButton.disabled=true;
    if(moreButton)moreButton.disabled=true;
  }
  function syncNavigation(){
    if(moving||!enabled){hideNavigation();return;}
    const canBack=activeIndex>0;
    const canMore=activeIndex<cards.length-1;
    backButton?.classList.toggle("is-visible",canBack);
    moreButton?.classList.toggle("is-visible",canMore);
    if(backButton)backButton.disabled=!canBack;
    if(moreButton)moreButton.disabled=!canMore;
  }
  function render(){
    const cardElements=[...element.querySelectorAll(".experience")];
    cardElements.forEach((card,index)=>{
      const offset=index-activeIndex;
      if(offset<-2||offset>2){
        card.style.opacity="0";
        card.style.pointerEvents="none";
        card.style.transform=`translate(-50%,-50%) translateX(${offset*64}%) scale(.74)`;
        card.style.filter="blur(9px)";
        card.style.zIndex="1";
        card.dataset.pos=offset;
        return;
      }
      const x=offset*73,scale=offset===0?1:.86,rotate=offset*-2.6,z=offset===0?0:-90,y=Math.abs(offset)*10;
      card.style.opacity=offset===0?"1":".46";
      card.style.pointerEvents=offset===0&&enabled&&!moving?"auto":"none";
      card.style.filter=offset===0?"blur(0)":"blur(1.4px)";
      card.style.transform=`translate(-50%,-50%) translate3d(${x}%,${y}px,${z}px) rotate(${rotate}deg) scale(${scale})`;
      card.style.zIndex=offset===0?"10":"7";
      card.dataset.pos=offset;
    });
    syncNavigation();
  }
  function move(direction){
    if(!enabled||moving)return;
    const next=Math.min(cards.length-1,Math.max(0,activeIndex+direction));
    if(next===activeIndex)return;
    moving=true;
    hideNavigation();
    activeIndex=next;
    render();
    hideHint();
    window.clearTimeout(moveTimer);
    moveTimer=window.setTimeout(()=>{moving=false;render();},moveDuration);
  }
  function hideHint(){if(hasInteracted||!hint)return;hasInteracted=true;hint.style.opacity="0";}
  function reset(index=0){window.clearTimeout(moveTimer);moving=false;activeIndex=Math.min(cards.length-1,Math.max(0,index));render();}
  function setEnabled(value){window.clearTimeout(moveTimer);moving=false;enabled=Boolean(value);render();}
  function getActiveIndex(){return activeIndex;}
  function getActiveCard(){return cards[activeIndex];}
  build();
  return{reset,move,render,setEnabled,getActiveIndex,getActiveCard,hideHint};
}
