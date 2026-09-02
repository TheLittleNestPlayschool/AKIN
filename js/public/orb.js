
/*   public orb quotes*/
const quotes=["You do not have to solve everything today.","A small pause can change the next moment.","You can begin again from here.","Not everything needs your attention at once.","A little space can make things clearer."];
export function setupPublicOrb(){
  const orb=document.getElementById("akinEntryButton");
  let bubble=null,timer=null,last=-1;
  function showQuote(){
    if(!bubble){bubble=document.createElement("div");bubble.className="orb-quote";bubble.setAttribute("aria-live","polite");orb.parentElement.appendChild(bubble)}
    let next=Math.floor(Math.random()*quotes.length);if(next===last)next=(next+1)%quotes.length;last=next;
    bubble.textContent=quotes[next];bubble.classList.add("is-visible");window.clearTimeout(timer);timer=window.setTimeout(()=>bubble.classList.remove("is-visible"),3600);
  }
  function hideQuote(){bubble?.classList.remove("is-visible")}
  return{orb,showQuote,hideQuote,getQuoteElement:()=>bubble};
}
