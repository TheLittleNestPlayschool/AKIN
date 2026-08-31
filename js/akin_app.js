import{
  frontCards,
  personalCards
}from"./akin_data.js";

import{
  createCardCarousel
}from"./akin_cards.js";

import{
  setupLogin
}from"./akin_login.js";

import{
  applyTimeAtmosphere
}from"./akin_atmosphere.js";

import{
  setupFrontDetail
}from"./akin_front_detail.js";


const app=document.getElementById("app");
const frontWorld=document.getElementById("frontWorld");
const personalWorld=document.getElementById("personalWorld");
const akinEntryButton=document.getElementById("akinEntryButton");
const breakoutButton=document.getElementById("breakoutButton");

const frontCarouselElement=document.getElementById("frontCarousel");
const personalCarouselElement=document.getElementById("personalCarousel");

const frontWanderHint=document.getElementById("frontWanderHint");
const personalWanderHint=document.getElementById("personalWanderHint");

const frontDetailLayer=document.getElementById("frontDetailLayer");
const frontDetailBack=document.getElementById("frontDetailBack");
const frontDetailSurface=document.getElementById("frontDetailSurface");
const frontDetailCategory=document.getElementById("frontDetailCategory");
const frontDetailTitle=document.getElementById("frontDetailTitle");
const frontDetailLead=document.getElementById("frontDetailLead");
const frontDetailBody=document.getElementById("frontDetailBody");
const frontDetailAction=document.getElementById("frontDetailAction");

let personalOpen=false;
let frontDetail;


/*   front carousel*/

const frontCarousel=createCardCarousel({
  element:frontCarouselElement,
  cards:frontCards,
  hint:frontWanderHint,
  onActivate:item=>{
    frontDetail.open(item);
  }
});


/*   front lesson*/

frontDetail=setupFrontDetail({
  frontWorld,
  layer:frontDetailLayer,
  backButton:frontDetailBack,
  surface:frontDetailSurface,
  category:frontDetailCategory,
  title:frontDetailTitle,
  lead:frontDetailLead,
  body:frontDetailBody,
  action:frontDetailAction,

  onOpen:()=>{
    frontCarousel.setEnabled(false);
  },

  onClose:()=>{
    if(!personalOpen){
      frontCarousel.setEnabled(true);
    }
  }
});


/*   personal carousel*/

const personalCarousel=createCardCarousel({
  element:personalCarouselElement,
  cards:personalCards,
  hint:personalWanderHint
});

personalCarousel.setEnabled(false);


/*   open personal akin*/

function openPersonal(){
  if(personalOpen) return;

  if(frontDetail.isOpen()){
    frontDetail.close();
  }

  personalOpen=true;

  frontCarousel.hideHint();
  frontCarousel.setEnabled(false);
  personalCarousel.setEnabled(true);

  frontWorld.classList.add("is-behind");
  personalWorld.classList.add("is-visible");

  personalWorld.setAttribute(
    "aria-hidden",
    "false"
  );
}


/*   quick breakout*/

function breakout(){
  if(!personalOpen) return;

  app.classList.add("is-breaking-out");

  frontCarousel.reset(0);
  personalCarousel.reset(0);

  personalOpen=false;

  personalWorld.classList.remove("is-visible");
  personalWorld.setAttribute("aria-hidden","true");

  frontWorld.classList.remove("is-behind");

  personalCarousel.setEnabled(false);
  frontCarousel.setEnabled(true);

  window.setTimeout(()=>{
    app.classList.remove("is-breaking-out");
  },220);
}


/*   controls*/

akinEntryButton.addEventListener(
  "click",
  openPersonal
);

breakoutButton.addEventListener(
  "click",
  breakout
);


/*   login*/

setupLogin({
  app,
  frontWorld
});


/*   atmosphere*/

applyTimeAtmosphere();
