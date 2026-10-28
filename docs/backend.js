const API_STORE='pzApiBase';
const TOKEN_STORE='pzToken';
const DEFAULT_API='https://pirozhok-api.onrender.com';
const LOCAL_SENTINEL='__local__';
function apiBase(){
  const saved=localStorage.getItem(API_STORE);
  if(saved===LOCAL_SENTINEL)return '';
  return String(saved||DEFAULT_API).replace(/\/$/,'');
}
function apiToken(){return localStorage.getItem(TOKEN_STORE)||''}
function apiEnabled(){return !!apiBase()}
async function apiRequest(path,options={}){
  const base=apiBase();
  if(!base) throw new Error('BACKEND_NOT_CONFIGURED');
  const headers={...(options.headers||{})};
  if(options.body && !headers['Content-Type']) headers['Content-Type']='application/json';
  const token=apiToken();
  if(token) headers.Authorization=`Bearer ${token}`;
  const res=await fetch(base+path,{...options,headers});
  let data=null;
  try{data=await res.json()}catch{}
  if(!res.ok) throw new Error(data?.error||`Request failed (${res.status})`);
  return data;
}
function setApiBase(value){
  const clean=String(value||'').trim().replace(/\/$/,'');
  if(clean)localStorage.setItem(API_STORE,clean);else localStorage.setItem(API_STORE,LOCAL_SENTINEL);
  renderBackendStatus();
}
function useDefaultApi(){localStorage.removeItem(API_STORE);renderBackendStatus()}
function setApiSession(payload){
  if(payload?.token)localStorage.setItem(TOKEN_STORE,payload.token);
  if(payload?.user){
    localStorage.pzuser=JSON.stringify({
      name:payload.user.displayName||payload.user.display_name||payload.user.username,
      user:payload.user.username,
      email:payload.user.email,
      role:payload.user.role||'user'
    });
  }
}
function clearApiSession(){localStorage.removeItem(TOKEN_STORE)}
async function testBackend(showToast=true){
  if(!apiEnabled()){if(showToast)toast('Backend URL is empty');renderBackendStatus('off');return false}
  try{
    const data=await apiRequest('/api/health');
    renderBackendStatus('ok');
    if(showToast)toast(data?.ok===false?'Backend responded':'Backend online');
    return true;
  }catch(e){
    renderBackendStatus('bad');
    if(showToast)toast(e.message==='Failed to fetch'?'Backend unreachable':e.message);
    return false;
  }
}
function renderBackendStatus(force){
  const badge=document.getElementById('backendBadge');
  const text=document.getElementById('backendStatusText');
  const configured=apiEnabled();
  const mode=force||(configured?'set':'off');
  const labels={off:'LOCAL',set:'API',ok:'ONLINE',bad:'OFFLINE'};
  if(badge){badge.textContent=labels[mode]||'API';badge.dataset.state=mode}
  if(text){text.textContent=configured?apiBase():'Local demo mode'}
}
function openBackendSettings(){
  const input=document.getElementById('backendUrl');
  if(input)input.value=apiBase();
  renderBackendStatus();
  backendModal.classList.add('on');
}
function closeBackendSettings(){backendModal.classList.remove('on')}
async function saveBackendSettings(){
  setApiBase(backendUrl.value);
  if(!apiEnabled()){clearApiSession();toast('Local demo mode');return}
  await testBackend(true);
}
async function apiRegisterAccount({displayName,username,email,password}){
  const data=await apiRequest('/api/auth/register',{method:'POST',body:JSON.stringify({displayName,username,email,password})});
  setApiSession(data);return data;
}
async function apiLoginAccount({login,password}){
  const data=await apiRequest('/api/auth/login',{method:'POST',body:JSON.stringify({login,password})});
  setApiSession(data);return data;
}
async function apiLogoutAccount(){
  if(apiEnabled()&&apiToken()){
    try{await apiRequest('/api/auth/logout',{method:'POST'})}catch{}
  }
  clearApiSession();
}
window.addEventListener('DOMContentLoaded',()=>{renderBackendStatus();if(apiEnabled())testBackend(false)});
