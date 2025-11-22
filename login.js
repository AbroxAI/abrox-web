// login.js
// Externalized login logic for ABROX AI login page
// Keep this file in the same directory as index.html (GitHub root of the page).

// Helper references
const uidInput = document.getElementById('uidInput');
const passInput = document.getElementById('passInput');
const loginBtn = document.getElementById('loginBtn');
const mainPanel = document.getElementById('mainPanel');
const badge = document.getElementById('badge');
const badgeIcon = document.getElementById('badgeIcon');
const badgeHead = document.getElementById('badgeHead');
const badgeSub = document.getElementById('badgeSub');
const ring = document.getElementById('ring');
const burst = document.getElementById('burst');
const togglePassword = document.getElementById('togglePassword');

function clearVerifyUI(){
  badge.className = 'badge';
  badgeIcon.textContent = '';
  badgeHead.textContent = '';
  badgeSub.textContent = '';
  ring.classList.remove('show');
  mainPanel.classList.remove('success','shake');
  burst.innerHTML = '';
}

function spawnParticles(color, count=18){
  burst.innerHTML = '';
  for(let i=0;i<count;i++){
    const p=document.createElement('div');
    p.className='particle';
    p.style.background=color;

    // start near center
    p.style.left = '50%';
    p.style.top = '50%';
    burst.appendChild(p);

    const angle=Math.random()*Math.PI*2;
    const dist=40+Math.random()*72;
    const dur=600+Math.random()*420;

    p.animate([
      { transform:`translate(-50%,-50%) scale(.6)`, opacity:1 },
      { transform:`translate(${Math.cos(angle)*dist - 50}%,${Math.sin(angle)*dist - 50}%) scale(1)`, opacity:0 }
    ],{ duration:dur, easing:'cubic-bezier(.2,.9,.2,1)' });

    setTimeout(()=>p.remove(),dur+80);
  }
}

function showSuccess(h='ACCESS VERIFIED', s='Identity Matched • Redirecting…'){
  clearVerifyUI();
  badge.classList.add('show','success');
  badgeIcon.textContent='✓';
  badgeHead.textContent=h;
  badgeSub.textContent=s;

  // make success green for clarity
  ring.style.background='rgba(20,255,185,0.18)'; // soft green ring
  ring.classList.add('show');
  mainPanel.classList.add('success');

  spawnParticles('rgba(20,255,185,0.95)',10); // green particles
  spawnParticles('rgba(0,238,255,0.9)',8);   // cyan accent particles

  setTimeout(()=>badge.classList.add('show'),80);
}

function showFail(h='ACCESS DENIED', s='Credentials Incorrect'){
  clearVerifyUI();
  badge.classList.add('show','fail');
  badgeIcon.textContent='✕';
  badgeHead.textContent=h;
  badgeSub.textContent=s;

  ring.style.background='rgba(255,59,59,0.22)';
  ring.classList.add('show');
  spawnParticles('rgba(255,59,59,0.95)',18);
  mainPanel.classList.add('shake');

  setTimeout(()=>badge.classList.add('show'),40);
}

async function verify(){
  const uid = (uidInput && uidInput.value || '').trim();
  const pass = (passInput && passInput.value || '').trim();

  if(!uid || !pass){
    showFail('MISSING','Enter UID & Password');
    setTimeout(clearVerifyUI,1400);
    return;
  }

  try{
    // subscribers.json (checks UID)
    const s = await fetch("https://raw.githubusercontent.com/AbroxAI/abrox-web/main/subscribers.json",{cache:"no-store"});
    if(!s.ok) return showFail('NETWORK','Failed to load subscribers');

    const subs = await s.json();
    if(!subs[uid]){
      showFail('ACCESS DENIED','UID not found');
      setTimeout(clearVerifyUI,1400);
      return;
    }

    // config.env (formerly .env) — fetch password
    const e = await fetch("https://raw.githubusercontent.com/AbroxAI/abrox-web/main/config.env",{cache:"no-store"});
    if(!e.ok) return showFail('NETWORK','Failed to load config');

    const envText = await e.text();
    const m = envText.match(/DASHBOARD_PASSWORD=(.*)/);
    if(!m) return showFail('CONFIG','Password missing');

    const correct = m[1].trim();

    if(pass !== correct){
      showFail('ACCESS DENIED','Incorrect password');
      setTimeout(clearVerifyUI,1400);
      return;
    }

    // success
    showSuccess();
    setTimeout(()=>location.href="dashboard.html",1200);

  }catch(err){
    console.error('verify error', err);
    showFail('ERROR','Unexpected issue');
    setTimeout(clearVerifyUI,1600);
  }
}

// wire up events
if(loginBtn) loginBtn.addEventListener("click", verify);
if(togglePassword){
  togglePassword.onclick = () => {
    if(!passInput) return;
    passInput.type = passInput.type === "password" ? "text" : "password";
  };
}

// allow Enter key to submit while focused on fields
if(uidInput) uidInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') verify(); });
if(passInput) passInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') verify(); });
