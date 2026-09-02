import{createCardCarousel}from"../shared/cards.js";
import{privateCards}from"./data.js";
/*   private mode*/
export function setupPrivateMode({app,publicMode}){
  const world=document.getElementById("personalWorld"),breakoutButton=document.getElementById("breakoutButton"),carouselElement=document.getElementById("personalCarousel"),hint=document.getElementById("personalWanderHint");
  const carousel=createCardCarousel({element:carouselElement,cards:privateCards,hint});
  let open=false;carousel.setEnabled(false);
  function enter(){if(open)return;if(publicMode.detail.isOpen())publicMode.detail.close();open=true;publicMode.carousel.hideHint();publicMode.carousel.setEnabled(false);carousel.setEnabled(true);publicMode.world.classList.add("is-behind");world.classList.add("is-visible");world.setAttribute("aria-hidden","false")}
  function breakout(){if(!open)return;app.classList.add("is-breaking-out");publicMode.carousel.reset(0);carousel.reset(0);open=false;world.classList.remove("is-visible");world.setAttribute("aria-hidden","true");publicMode.world.classList.remove("is-behind");carousel.setEnabled(false);publicMode.carousel.setEnabled(true);window.setTimeout(()=>app.classList.remove("is-breaking-out"),220)}
  breakoutButton.addEventListener("click",breakout);
  return{world,carousel,enter,breakout,isOpen:()=>open};
}
