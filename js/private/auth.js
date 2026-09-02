/*   private authentication*/
const configKey="akin_private_access_v1";
const textEncoder=new TextEncoder();
function bytesToBase64(bytes){return btoa(String.fromCharCode(...bytes))}
function base64ToBytes(value){return Uint8Array.from(atob(value),c=>c.charCodeAt(0))}
async function hash(value){const digest=await crypto.subtle.digest("SHA-256",textEncoder.encode(value));return bytesToBase64(new Uint8Array(digest))}
export function getPrivateConfig(){try{return JSON.parse(localStorage.getItem(configKey))}catch{return null}}
export function savePrivateConfig(config){localStorage.setItem(configKey,JSON.stringify(config))}
export function clearPrivateConfig(){localStorage.removeItem(configKey)}
export async function setPin(config,pin){config.pinHash=await hash(pin);savePrivateConfig(config);return config}
export async function verifyPin(pin){const config=getPrivateConfig();return Boolean(config?.pinHash)&&(await hash(pin))===config.pinHash}
export async function setSecret(config,secret){config.secretHash=await hash(secret.trim().toLowerCase());savePrivateConfig(config);return config}
export async function verifySecret(secret){const config=getPrivateConfig();if(!config?.secretHash)return false;return(await hash(secret.trim().toLowerCase()))===config.secretHash}
export function biometricSupported(){return Boolean(window.PublicKeyCredential&&navigator.credentials)}
export async function enrollBiometric(config){
  if(!biometricSupported())throw new Error("Biometrics are not available on this device.");
  const challenge=crypto.getRandomValues(new Uint8Array(32)),userId=crypto.getRandomValues(new Uint8Array(16));
  const credential=await navigator.credentials.create({publicKey:{challenge,rp:{name:"AKIN"},user:{id:userId,name:"akin-private",displayName:"AKIN"},pubKeyCredParams:[{alg:-7,type:"public-key"},{alg:-257,type:"public-key"}],authenticatorSelection:{authenticatorAttachment:"platform",userVerification:"required"},timeout:60000,attestation:"none"}});
  config.biometricEnabled=true;config.credentialId=bytesToBase64(new Uint8Array(credential.rawId));savePrivateConfig(config);return config;
}
export async function verifyBiometric(){
  const config=getPrivateConfig();if(!config?.biometricEnabled||!config.credentialId)return false;
  try{const credential=await navigator.credentials.get({publicKey:{challenge:crypto.getRandomValues(new Uint8Array(32)),allowCredentials:[{id:base64ToBytes(config.credentialId),type:"public-key"}],userVerification:"required",timeout:60000}});return Boolean(credential)}catch{return false}
}
