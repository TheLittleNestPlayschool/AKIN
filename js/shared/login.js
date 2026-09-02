/*   login shell*/
export function setupLogin({app,frontWorld}){
  const loginChoice=document.getElementById("loginChoice"),signInForm=document.getElementById("signInForm"),createForm=document.getElementById("createForm"),showSignIn=document.getElementById("showSignIn"),showCreate=document.getElementById("showCreate");
  function showLoginForm(form){loginChoice.hidden=true;signInForm.hidden=form!==signInForm;createForm.hidden=form!==createForm}
  function showLoginChoice(){loginChoice.hidden=false;signInForm.hidden=true;createForm.hidden=true}
  function enterApp(event){event?.preventDefault();app.classList.remove("is-login");frontWorld.setAttribute("aria-hidden","false")}
  showSignIn.addEventListener("click",()=>showLoginForm(signInForm));showCreate.addEventListener("click",()=>showLoginForm(createForm));document.querySelectorAll("[data-login-back]").forEach(button=>button.addEventListener("click",showLoginChoice));signInForm.addEventListener("submit",enterApp);createForm.addEventListener("submit",enterApp);
}
