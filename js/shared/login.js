
/*   login shell*/
import{signup,login,bootstrap}from"./api.js";

export function setupLogin({app,frontWorld,onEnter=null}){
  const loginChoice=document.getElementById("loginChoice");
  const signInForm=document.getElementById("signInForm");
  const createForm=document.getElementById("createForm");
  const showSignIn=document.getElementById("showSignIn");
  const showCreate=document.getElementById("showCreate");

  function showLoginForm(form){
    loginChoice.hidden=true;
    signInForm.hidden=form!==signInForm;
    createForm.hidden=form!==createForm;
    clearError(signInForm);
    clearError(createForm);
  }

  function showLoginChoice(){
    loginChoice.hidden=false;
    signInForm.hidden=true;
    createForm.hidden=true;
    clearError(signInForm);
    clearError(createForm);
  }

  function getError(form){
    let error=form.querySelector(".login-error");
    if(!error){
      error=document.createElement("p");
      error.className="login-error";
      error.setAttribute("role","alert");
      form.querySelector("button[type='submit']").before(error);
    }
    return error;
  }

  function clearError(form){
    const error=form.querySelector(".login-error");
    if(error)error.textContent="";
  }

  function setBusy(form,busy){
    const button=form.querySelector("button[type='submit']");
    form.querySelectorAll("input,button").forEach(item=>item.disabled=busy);
    if(button){
      if(!button.dataset.label)button.dataset.label=button.textContent;
      button.textContent=busy?"One moment…":button.dataset.label;
    }
  }

  function enterApp(data){
    app.classList.remove("is-login");
    frontWorld.setAttribute("aria-hidden","false");
    if(typeof onEnter==="function")window.setTimeout(()=>onEnter(data),450);
  }

  async function finishAuthentication(authAction,form,credentials){
    clearError(form);
    setBusy(form,true);
    try{
      await authAction(credentials);
      const bootstrapData=await bootstrap();
      enterApp(bootstrapData);
    }catch(error){
      getError(form).textContent=error.message||"Something went wrong. Please try again.";
      setBusy(form,false);
    }
  }

  showSignIn.addEventListener("click",()=>showLoginForm(signInForm));
  showCreate.addEventListener("click",()=>showLoginForm(createForm));
  document.querySelectorAll("[data-login-back]").forEach(button=>button.addEventListener("click",showLoginChoice));

  signInForm.addEventListener("submit",event=>{
    event.preventDefault();
    const email=signInForm.querySelector("input[type='email']").value.trim();
    const password=signInForm.querySelector("input[type='password']").value;
    finishAuthentication(login,signInForm,{email,password});
  });

  createForm.addEventListener("submit",event=>{
    event.preventDefault();
    const inputs=createForm.querySelectorAll("input");
    const firstName=inputs[0].value.trim();
    const email=inputs[1].value.trim();
    const password=inputs[2].value;
    finishAuthentication(signup,createForm,{firstName,email,password});
  });
}
