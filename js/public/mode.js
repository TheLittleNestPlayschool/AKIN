
import{createCardCarousel}from"../shared/cards.js";
import{publicCards}from"./data.js";
import{setupPublicDetail}from"./detail.js";
/*   public mode*/
export function setupPublicMode(){
  const world=document.getElementById("frontWorld"),carouselElement=document.getElementById("frontCarousel"),hint=document.getElementById("frontWanderHint"),layer=document.getElementById("frontDetailLayer"),backButton=document.getElementById("frontDetailBack"),surface=document.getElementById("frontDetailSurface"),category=document.getElementById("frontDetailCategory"),title=document.getElementById("frontDetailTitle"),lead=document.getElementById("frontDetailLead"),body=document.getElementById("frontDetailBody"),action=document.getElementById("frontDetailAction");
  let detail;
  const carousel=createCardCarousel({element:carouselElement,cards:publicCards,hint,onActivate:item=>detail.open(item)});
  detail=setupPublicDetail({frontWorld:world,layer,backButton,surface,category,title,lead,body,action,onOpen:()=>carousel.setEnabled(false),onClose:()=>carousel.setEnabled(true)});
  return{world,carousel,detail};
}
