
/*   xano api*/
const API_BASE="https://x8ki-letl-twmt.n7.xano.io/api:esjA0pTg";
const tokenKey="akin_auth_token";

async function request(path,{method="GET",body=null,authenticated=false}={}){
  const headers={"Content-Type":"application/json"};
  if(authenticated){
    const token=getAuthToken();
    if(!token)throw new Error("You need to sign in again.");
    headers.Authorization=`Bearer ${token}`;
  }

  const response=await fetch(`${API_BASE}${path}`,{
    method,
    headers,
    body:body?JSON.stringify(body):null
  });

  let data=null;
  try{data=await response.json()}catch{}

  if(!response.ok){
    const message=data?.message||data?.error||"Something went wrong. Please try again.";
    const error=new Error(message);
    error.status=response.status;
    error.data=data;
    throw error;
  }

  return data;
}

export function getAuthToken(){return localStorage.getItem(tokenKey)||""}
export function setAuthToken(token){
  if(token)localStorage.setItem(tokenKey,token);
  else localStorage.removeItem(tokenKey);
}
export function clearAuthToken(){localStorage.removeItem(tokenKey)}

export async function signup({firstName,email,password}){
  const data=await request("/w_signup",{
    method:"POST",
    body:{
      first_name:firstName,
      email,
      password,
      country_id:1,
      market_id:1,
      language_id:1,
      locale:"en-PH",
      timezone:"Asia/Manila"
    }
  });
  setAuthToken(data.authToken);
  return data;
}

export async function login({email,password}){
  const data=await request("/auth/login",{
    method:"POST",
    body:{email,password}
  });
  setAuthToken(data.authToken);
  return data;
}

export async function bootstrap(){
  return request("/w_bootstrap",{authenticated:true});
}
