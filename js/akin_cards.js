
/*   reusable spatial card carousel*/
export function createCardCarousel({element,cards,hint=null,onActivate=null}){
  let activeIndex=0,enabled=true,hasInteracted=false;
  /*   choose card surfaces once per carousel load*/
  const cardSurfaces=cards.map(item=>{
    if(Array.isArray(item.photos)&&item.photos.length){
      const photo=item.photos[Math.floor(Math.random()*item.photos.length)];
      return{type:"photo",value:photo};
    }
    return{type:"background",value:item.background||""};
  });
  /*   build cards*/
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
      article.addEventListener("click",event=>{
        if(event.target.closest(".card-nav-handle")||!enabled||Number(article.dataset.index)!==activeIndex)return;
        if(typeof onActivate==="function")onActivate(item,activeIndex);
      });
      element.appendChild(article);
    });
    render();
  }
  /*   navigation handle*/
  function syncNavigation(card,offset){
    card.querySelector(":scope > .card-nav-handle")?.remove();
    card.classList.remove("has-nav-handle-left","has-nav-handle-right");
    if(!enabled||(offset!==-1&&offset!==1))return;
    const isMore=offset===1;
    const button=document.createElement("button");
    button.type="button";
    button.className="card-nav-handle";
    button.setAttribute("aria-label",isMore?"Show more":"Go back");
    button.innerHTML=`<span class="card-nav-handle-label">${isMore?"More":"Back"}</span>`;
    button.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();move(isMore?1:-1);});
    card.classList.add(isMore?"has-nav-handle-right":"has-nav-handle-left");
    card.appendChild(button);
  }
  /*   render positions*/
  function render(){
    const cardElements=[...element.querySelectorAll(".experience")];
    cardElements.forEach((card,index)=>{
      const offset=index-activeIndex;
      if(offset<-2||offset>2){
        card.style.opacity="0";
        card.style.pointerEvents="none";
        card.style.transform=`translate(-50%,-50%) translateX(${offset*64}%) scale(.74)`;
        card.style.filter="blur(9px)";
        card.dataset.pos=offset;
        syncNavigation(card,offset);
        return;
      }
      const x=offset*73,scale=offset===0?1:.86,rotate=offset*-2.6,z=offset===0?0:-90,y=Math.abs(offset)*10,opacity=offset===0?1:.46;
      card.style.opacity=opacity;
      card.style.pointerEvents=(enabled&&Math.abs(offset)<=1)?"auto":"none";
      card.style.filter="blur(0)";
      card.style.transform=`translate(-50%,-50%) translate3d(${x}%,${y}px,${z}px) rotate(${rotate}deg) scale(${scale})`;
      card.style.zIndex=10-Math.abs(offset);
      card.dataset.pos=offset;
      syncNavigation(card,offset);
    });
  }
  /*   move carousel*/
  function move(direction){
    if(!enabled)return;
    const next=Math.min(cards.length-1,Math.max(0,activeIndex+direction));
    if(next===activeIndex)return;
    activeIndex=next;
    render();
    hideHint();
  }
  /*   hint*/
  function hideHint(){if(hasInteracted||!hint)return;hasInteracted=true;hint.style.opacity="0";}
  /*   public controls*/
  function reset(index=0){activeIndex=Math.min(cards.length-1,Math.max(0,index));render();}
  function setEnabled(value){enabled=Boolean(value);render();}
  function getActiveIndex(){return activeIndex;}
  function getActiveCard(){return cards[activeIndex];}
  build();
  return{reset,move,render,setEnabled,getActiveIndex,getActiveCard,hideHint};
}
