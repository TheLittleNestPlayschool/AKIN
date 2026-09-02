
/*   public lesson detail*/
export function setupPublicDetail({frontWorld,layer,backButton,surface,category,title,lead,body,action,onOpen=null,onClose=null}){
  let open=false;
  function openDetail(item){if(!item?.lesson)return;category.textContent=item.type;title.textContent=item.lesson.title;lead.textContent=item.lesson.lead;action.textContent=item.lesson.action;body.innerHTML="";item.lesson.body.forEach(text=>{const paragraph=document.createElement("p");paragraph.textContent=text;body.appendChild(paragraph)});surface.style.setProperty("--detail-bg",item.background);open=true;frontWorld.classList.add("is-detail-open");layer.classList.add("is-visible");layer.setAttribute("aria-hidden","false");if(typeof onOpen==="function")onOpen(item)}
  function closeDetail(){if(!open)return;open=false;frontWorld.classList.remove("is-detail-open");layer.classList.remove("is-visible");layer.setAttribute("aria-hidden","true");if(typeof onClose==="function")onClose()}
  function isOpen(){return open}
  backButton.addEventListener("click",closeDetail);return{open:openDetail,close:closeDetail,isOpen};
}
