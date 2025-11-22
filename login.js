// === FINAL LOGIN.JS (RAW LINKS, NO CACHE ISSUES) ===
// Works instantly with GitHub Pages + your index.html

const uidInput = document.getElementById('uidInput');
const passInput = document.getElementById('passInput');
const loginBtn = document.getElementById('loginBtn');
const togglePassword = document.getElementById('togglePassword');

const mainPanel = document.getElementById('mainPanel');
const badge = document.getElementById('badge');
const badgeIcon = document.getElementById('badgeIcon');
const badgeHead = document.getElementById('badgeHead');
const badgeSub = document.getElementById('badgeSub');
const ring = document.getElementById('ring');
const burst = document.getElementById('burst');

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

    p.style.left='50%';
    p.style.top='50%';
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

  ring.style.background='rgba(20,255,185,0.18)';
  ring.classList.add('show');
  mainPanel.classList.add('success');

  spawnParticles('rgba(20,255,185,0.95)',10);
  spawnParticles('rgba(0,238,255,0.9)',8);

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
  const uid = uidInput.value.trim();
  const pass = passInput.value.trim();

  if(!uid || !pass){
    showFail('MISSING','Enter UID & Password');
    setTimeout(clearVerifyUI,1400);
    return;
  }

  try{
    // --- Always load fresh RAW JSON ---
    const subsRes = await fetch("https://raw.githubusercontent.com/AbroxAI/abrox-web/main/subscribers.json?now="+Date.now());
    if(!subsRes.ok) return showFail('NETWORK','subscribers.json error');

    const subs = await subsRes.json();

    if(!subs[uid]){
      showFail('ACCESS DENIED','UID not found');
      setTimeout(clearVerifyUI,1400);
      return;
    }

    // --- Load config.env from RAW ---
    const envRes = await fetch("https://raw.githubusercontent.com/AbroxAI/abrox-web/main/config.env?now="+Date.now());
    if(!envRes.ok) return showFail('NETWORK','config.env error');

    const envText = await envRes.text();
    const match = envText.match(/DASHBOARD_PASSWORD=(.*)/);

    if(!match){
      showFail('CONFIG','Password missing in config');
      setTimeout(clearVerifyUI,1400);
      return;
    }

    const correctPass = match[1].trim();

    if(pass !== correctPass){
      showFail('ACCESS DENIED','Incorrect password');
      setTimeout(clearVerifyUI,1400);
      return;
    }

    // SUCCESS
    showSuccess();
    setTimeout(()=>location.href="dashboard.html",1200);

  }catch(err){
    console.error(err);
    showFail('ERROR','Unexpected issue');
    setTimeout(clearVerifyUI,1600);
  }
}

// EVENTS
loginBtn.addEventListener("click", verify);

togglePassword.addEventListener("click", () => {
  passInput.type = passInput.type === "password" ? "text" : "password";
});

// allow enter
uidInput.addEventListener("keydown", e => { if(e.key === "Enter") verify(); });
passInput.addEventListener("keydown", e => { if(e.key === "Enter") verify(); });
