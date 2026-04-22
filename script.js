const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// CURSOR
(function(){
  const dot=document.getElementById('cursor-dot');
  const ring=document.getElementById('cursor-ring');
  let mx=0,my=0,rx=0,ry=0;
  window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
  function loop(){rx+=(mx-rx)*0.18;ry+=(my-ry)*0.18;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(loop);}
  loop();
  document.querySelectorAll('[data-magnetic]').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('hover'));
    el.addEventListener('mouseleave',()=>{ring.classList.remove('hover');el.style.transform='';});
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      const cx=r.left+r.width/2,cy=r.top+r.height/2;
      el.style.transform=`translate(${(e.clientX-cx)*0.25}px,${(e.clientY-cy)*0.25}px)`;
    });
  });
})();

// ANNOUNCE
const dismissBtn = document.getElementById('dismissAnnounce');
if(dismissBtn){
  dismissBtn.addEventListener('click',()=>{
    document.getElementById('announce').classList.add('hide');
    document.querySelector('nav.nav').style.top='0';
  });
}

// NAV SCROLL
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>{nav.classList.toggle('scrolled',window.scrollY>80);});

// THREE.JS
(function(){
  if(reduced) return;
  try {
    const canvas=document.getElementById('three-bg');
    if(!canvas) {
      console.warn('Canvas element not found');
      return;
    }
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,100);
    camera.position.z=18;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

    // Particles - blue
    function makeParticles(count,color,size,zRange,opacity){
      const geo=new THREE.BufferGeometry();
      const pos=new Float32Array(count*3);
      for(let i=0;i<count;i++){
        pos[i*3]=(Math.random()-0.5)*60;
        pos[i*3+1]=(Math.random()-0.5)*40;
        pos[i*3+2]=(Math.random()-0.5)*zRange;
      }
      geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
      const mat=new THREE.PointsMaterial({color,size,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending});
      return new THREE.Points(geo,mat);
    }
    const pBlue=makeParticles(2800,0x3F5D4E,0.05,20,0.55);
    const pViolet=makeParticles(1200,0x7A4A3A,0.05,20,0.5);
    const pNear=makeParticles(200,0x5E5A52,0.18,4,0.05);
    scene.add(pBlue,pViolet,pNear);

    // Grid
    const grid=new THREE.GridHelper(60,60,0xb8b0a2,0xd4cdbf);
    grid.position.y=-8; grid.rotation.x=-Math.PI*0.15;
    grid.material.transparent=true; grid.material.opacity=0.5;
    scene.add(grid);

    // Orbs
    const orbs=[];
    function addOrb(r,x,y,z,color,intensity){
      const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,32),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,transparent:true,opacity:0.18}));
      m.position.set(x,y,z);
      scene.add(m);
      const l=new THREE.PointLight(color,1.5,20);
      l.position.set(x,y,z);
      scene.add(l);
      orbs.push({mesh:m,light:l,bx:x,by:y});
    }
    addOrb(2.5,-12,3,-8,0x3F5D4E,0.3);
    addOrb(1.8,14,-2,-12,0x7A4A3A,0.4);
    addOrb(1.2,2,8,-6,0xB8742E,0.4);
    scene.add(new THREE.AmbientLight(0xffffff,0.15));

    let mouseX=0,mouseY=0;
    window.addEventListener('mousemove',e=>{mouseX=(e.clientX/window.innerWidth-0.5)*2;mouseY=(e.clientY/window.innerHeight-0.5)*2;});
    window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});

    let t=0;
    function animate(){
      t+=0.01;
      pBlue.rotation.y+=0.0003; pBlue.rotation.x+=0.0001;
      pViolet.rotation.y-=0.0002; pViolet.rotation.x+=0.00015;
      pNear.rotation.y+=0.0008;
      grid.position.y=-8+Math.sin(t*0.4)*0.3;
      orbs.forEach((o,i)=>{
        o.mesh.position.x=o.bx+Math.sin(t*0.4+i)*0.8;
        o.mesh.position.y=o.by+Math.cos(t*0.3+i)*0.5;
        o.light.position.copy(o.mesh.position);
      });
      camera.position.x+=(mouseX*2-camera.position.x)*0.03;
      camera.position.y+=(-mouseY*1.5-camera.position.y)*0.03;
      camera.lookAt(0,0,0);
      renderer.render(scene,camera);
      requestAnimationFrame(animate);
    }
    animate();
  } catch(err) {
    console.error('Three.js initialization error:', err);
  }
})();

// GSAP + SPLITTING
gsap.registerPlugin(ScrollTrigger);
Splitting();

// hero headline reveal
{
  const chars=document.querySelectorAll('#heroH1 .char');
  gsap.set(chars,{y:120,opacity:0,rotationX:-90});
  gsap.to(chars,{y:0,opacity:1,rotationX:0,stagger:0.025,duration:0.9,ease:'power3.out',delay:0.2});
  gsap.fromTo('.hero .subhead',{y:20,opacity:0},{y:0,opacity:1,duration:0.8,delay:1.0,ease:'power2.out'});
  gsap.fromTo('.cta-row,.trust,.hero-badge',{y:20,opacity:0},{y:0,opacity:1,duration:0.7,delay:1.2,ease:'power2.out',stagger:0.1});
  // wave on gradient line after reveal
  setTimeout(()=>{
    const waveChars=document.querySelectorAll('#heroH1 .l.gradient .char');
    waveChars.forEach((c,i)=>{
      gsap.to(c,{y:-6,duration:0.8,ease:'sine.inOut',yoyo:true,repeat:-1,delay:i*0.06});
    });
  },1800);
}

// CTA headline split
{
  const chars=document.querySelectorAll('#ctaH2 .char');
  gsap.set(chars,{y:80,opacity:0,rotationX:-60});
  ScrollTrigger.create({trigger:'#cta',start:'top 70%',once:true,onEnter:()=>{gsap.to(chars,{y:0,opacity:1,rotationX:0,stagger:0.018,duration:0.7,ease:'power3.out'});}});
}

// default reveal 
document.querySelectorAll('.sec-head, .step-num, .step-title, .step-body, .step-stat, .compare, .privacy-grid > *, .pricing-grid > *, .stats-grid > *').forEach(el=>{
  gsap.fromTo(el,{y:40,opacity:0,filter:'blur(6px)'},{y:0,opacity:1,filter:'blur(0px)',duration:0.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
});

// bento cards stagger 
gsap.fromTo('.bento .card-3d',{y:50,opacity:0},{y:0,opacity:1,stagger:0.08,duration:0.7,ease:'power2.out',scrollTrigger:{trigger:'.bento',start:'top 80%',once:true}});

// compare rows stagger
gsap.fromTo('#compareBody tr',{x:-20,opacity:0},{x:0,opacity:1,stagger:0.05,duration:0.5,scrollTrigger:{trigger:'.compare',start:'top 75%',once:true}});

// 3D TILT 
document.querySelectorAll('.card-3d').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-0.5;
    const y=(e.clientY-r.top)/r.height-0.5;
    el.style.transition='';
    el.style.transform=`perspective(1000px) rotateX(${-y*12}deg) rotateY(${x*12}deg) translateZ(15px) scale(1.02)`;
    const shine=el.querySelector('.card-shine');
    if(shine) shine.style.background=`radial-gradient(circle at ${(x+0.5)*100}% ${(y+0.5)*100}%, rgba(255,255,255,0.10) 0%, transparent 60%)`;
  });
  el.addEventListener('mouseleave',()=>{
    el.style.transition='transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    el.style.transform='perspective(1000px) rotateX(0) rotateY(0) translateZ(0) scale(1)';
    const shine=el.querySelector('.card-shine');
    if(shine) shine.style.background='';
  });
});

// MARQUEE CONTENT 
{
  const items=[
    ['R','Saved me 2hrs debugging','@raghav_codes'],
    ['J','This is what Copilot should have been','@devjulia'],
    ['A','Summarized my paper in 8 seconds','@anika_phd'],
    ['C','Game changer for analytics','@chen_analyst'],
    ['M','AI that comes to ME','@marco_dev'],
    ['P','Focus sessions 40% longer','@priya_writer'],
    ['S','Grafana spike explained instantly','@sid_ops'],
    ['F','Wellbeing nudges are a nice touch','@fatima_ux'],
  ];
  const make=()=>items.map(i=>`<div class="mq-item"><div class="mq-avatar">${i[0]}</div>"${i[1]}"<span class="h">${i[2]}</span></div>`).join('');
  document.getElementById('mq1').innerHTML=make()+make();
  document.getElementById('mq2').innerHTML=make()+make();
}

// HOW IT WORKS — sync stages with steps 
{
  const steps=document.querySelectorAll('.how-step');
  const stages=document.querySelectorAll('.how-stage');
  steps.forEach((step,i)=>{
    ScrollTrigger.create({
      trigger:step,start:'top 60%',end:'bottom 40%',
      onEnter:()=>{stages.forEach((s,j)=>s.classList.toggle('active',j===i));},
      onEnterBack:()=>{stages.forEach((s,j)=>s.classList.toggle('active',j===i));}
    });
  });
}


// STATS COUNTER 
{
  const stats=document.querySelectorAll('.stat .num');
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el=e.target;
        const target=parseInt(el.dataset.count);
        const prefix=el.dataset.prefix||'';
        const suffix=el.dataset.suffix||'';
        const dur=1800;
        const start=performance.now();
        function tick(now){
          const t=Math.min(1,(now-start)/dur);
          const eased=1-Math.pow(1-t,3);
          const v=Math.floor(target*eased);
          el.textContent=prefix+v+suffix;
          if(t<1) requestAnimationFrame(tick);
          else {
            el.textContent=prefix+target+suffix;
            el.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:300});
          }
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      }
    });
  },{threshold:0.5});
  stats.forEach(s=>obs.observe(s));
}




/* ===== HORIZONTAL SCROLL ===== */
if(!reduced && window.innerWidth>768){
  gsap.to('.h-panels',{
    xPercent:-80,ease:'none',
    scrollTrigger:{trigger:'.h-section',start:'top top',end:'bottom top',scrub:1,pin:'.h-pin',anticipatePin:1}
  });
}

/* ===== PRIVACY CHECKS ===== */
{
  const checks=document.querySelectorAll('.check-svg');
  ScrollTrigger.create({trigger:'#privList',start:'top 75%',once:true,onEnter:()=>{
    checks.forEach((c,i)=>setTimeout(()=>c.classList.add('in'),i*120));
  }});
}

/* ===== PRICING TOGGLE ===== */
{
  const btns=document.querySelectorAll('.bill-toggle button');
  btns.forEach(b=>b.addEventListener('click',()=>{
    btns.forEach(x=>x.classList.remove('act'));
    b.classList.add('act');
    const ann=b.dataset.bill==='a';
    const proP=document.getElementById('proPrice');
    const proS=document.getElementById('proStrike');
    const proB=document.getElementById('proBilled');
    const teams=document.getElementById('teamsAmt');
    if(ann){
      proP.textContent='$9.60';proS.style.display='inline';proB.textContent='billed annually';teams.textContent='$23';
    } else {
      proP.textContent='$12';proS.style.display='none';proB.textContent='billed monthly';teams.textContent='$29';
    }
  }));
}

/* ===== WAITLIST ===== */
document.getElementById('waitlist').addEventListener('submit',e=>{
  e.preventDefault();
  e.target.classList.add('success');
});

/* ===== EASTER EGG ===== */
{
  const egg=document.getElementById('egg');
  const eggResp=document.getElementById('eggResp');
  const kbd=document.getElementById('kbdModal');
  function triggerEgg(){
    egg.classList.add('show');
    eggResp.innerHTML='';
    const text='You\'re viewing the VEIL.AI landing page. I see a Three.js hero scene, an interactive demo with 4 scenarios, a horizontal scroll showcase, and a pricing section. The current page is highly polished and uses a deep-space dark theme. Would you like to know more about any feature?';
    let i=0;
    function step(){
      if(i>=text.length){eggResp.innerHTML=text;return;}
      i+=Math.ceil(Math.random()*2);
      eggResp.innerHTML=text.slice(0,i)+'<span class="tcursor"></span>';
      setTimeout(step,30+Math.random()*20);
    }
    step();
  }
  document.addEventListener('keydown',e=>{
    if(e.ctrlKey&&e.shiftKey&&e.code==='Space'){e.preventDefault();triggerEgg();}
    else if(e.key==='?'&&!e.target.matches('input,textarea')){e.preventDefault();kbd.classList.add('show');}
    else if(e.key==='Escape'){egg.classList.remove('show');kbd.classList.remove('show');}
  });
  egg.addEventListener('click',e=>{if(e.target===egg) egg.classList.remove('show');});
  kbd.addEventListener('click',e=>{if(e.target===kbd) kbd.classList.remove('show');});
}

/* OS dropdown */
document.getElementById('dlBtn').addEventListener('click',e=>{
  e.stopPropagation();
  document.getElementById('osDrop').classList.toggle('open');
});
document.addEventListener('click',()=>document.getElementById('osDrop').classList.remove('open'));

