(()=>{'use strict';const config=window.EVENT_CONFIG;const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];const assetUrl=p=>(window.INLINE_ASSETS||{})[p]||p;const track=()=>{};const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
  const artistWords = {mischa:['mischa','maisky'],lily:['lily','maisky'],nicolas:['nicolas','dautricourt'],xuan:['dinh-hoai','xuan']};
  let currentArtist = 0;
  function setArtist(index, focusTab = false) {
    currentArtist = (index + config.artists.length) % config.artists.length;
    const artist = config.artists[currentArtist];
    const photo = $('#spotlight-photo');
    photo.src = artist.image;
    if (!matchMedia('(prefers-reduced-motion:reduce)').matches) { photo.animate([{opacity:.35,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:550,easing:'ease-out'}); }
    photo.alt = 'Ảnh nghệ sĩ từ hồ sơ chương trình: ' + artist.name;
    $('#spotlight-role').textContent = '[ ' + artist.role.toLocaleUpperCase('vi') + ' ]';
    $('#spotlight-bio').textContent = artist.bio;
    $('#artist-position').textContent = String(currentArtist+1).padStart(2,'0') + ' / ' + String(config.artists.length).padStart(2,'0');
    $('.spotlight-copy').dataset.artist = artist.id;
    const title = $('#spotlight-name');
    title.replaceChildren(make('span','sr-only',artist.name));
    artistWords[artist.id].forEach(word => {
      const img = make('img');
      const source = assetUrl('assets/type-' + word + '.svg');
      const svg = new DOMParser().parseFromString(atob(source.split(',')[1]),'image/svg+xml').documentElement;
      const box = svg.getAttribute('viewBox').split(/\s+/).map(Number);
      svg.setAttribute('preserveAspectRatio','xMinYMid meet');
      svg.setAttribute('width',String(box[2]));svg.setAttribute('height',String(box[3]));
      img.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg));
      img.alt = '';img.setAttribute('aria-hidden','true');
      title.append(img);
    });
    $$('.artist-tab').forEach((tab,i) => {
      const active = i === currentArtist;
      tab.classList.toggle('is-active',active);
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex = active ? 0 : -1;
      if(active && focusTab) tab.focus({preventScroll:true});
    });
    $('#artist-panel').setAttribute('aria-labelledby','artist-tab-' + artist.id);
    track('artist_view',{artist_id:artist.id});
  }
  config.artists.forEach((artist,index) => {
    const tab = make('button','artist-tab');
    tab.type = 'button';
    tab.id = 'artist-tab-' + artist.id;
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls','artist-panel');
    tab.append(make('span','',String(index+1).padStart(2,'0')),make('span','',artist.name));
    tab.addEventListener('click',()=>setArtist(index));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight') next=currentArtist+1;
      if(event.key==='ArrowLeft') next=currentArtist-1;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=config.artists.length-1;
      if(next!==undefined){event.preventDefault();setArtist(next,true);}
    });
    $('#artist-grid').append(tab);
  });
  $('#artist-prev').addEventListener('click',()=>setArtist(currentArtist-1));
  $('#artist-next').addEventListener('click',()=>setArtist(currentArtist+1));
  setArtist(0);

// The progress line and slide advance share the same five-second cycle.
const artistBook=make('a','button button-gold artist-book booking-cta','Đặt vé');artistBook.href='https://orchestars.vn/';const bookArrow=make('span','');bookArrow.innerHTML='<svg class="link-arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14"/></svg>';bookArrow.setAttribute('aria-hidden','true');artistBook.append(bookArrow);$('.spotlight-controls').append(artistBook);
let paused=matchMedia('(prefers-reduced-motion:reduce)').matches,visible=false,timer;
function schedule(){clearTimeout(timer);$('#artist-grid').classList.remove('auto-running');void $('#artist-grid').offsetWidth;$('#artist-grid').classList.toggle('auto-running',!paused&&visible&&!document.hidden);if(!paused&&visible&&!document.hidden)timer=setTimeout(()=>{setArtist(currentArtist+1);schedule();},5000);}
function setPaused(value){paused=value;schedule();}

$$('.artist-tab,#artist-prev,#artist-next').forEach(el=>{el.addEventListener('click',schedule);el.addEventListener('keydown',event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key))schedule();});});


new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.2}).observe($('#artist-panel'));
document.addEventListener('visibilitychange',schedule);matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',e=>{if(e.matches)setPaused(true);});setPaused(paused);
function sizeBios(){const bio=$('#spotlight-bio');const probe=bio.cloneNode(false);probe.removeAttribute('id');probe.style.cssText='position:absolute;visibility:hidden;pointer-events:none;height:auto;min-height:0;width:'+bio.getBoundingClientRect().width+'px';bio.parentNode.append(probe);let height=0;config.artists.forEach(a=>{probe.textContent=a.bio;height=Math.max(height,probe.getBoundingClientRect().height);});probe.remove();bio.style.minHeight=Math.ceil(height)+'px';}
document.fonts.ready.then(sizeBios);let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(sizeBios,120);});sizeBios();
const money=n=>new Intl.NumberFormat('vi-VN').format(n)+' ₫';
const map=$('#tier-map-dots'),NS='http://www.w3.org/2000/svg';
function seatTier(row,n){const r=row.label;if(row.floor===2)return ['A','B'].includes(r)&&n>=9?'upper':['AA','BB','CC','A','B','C','D'].includes(r)?'standard':'economy';return ['A','B','C','D','E','F','G'].includes(r)?'vvip':['H','I'].includes(r)?'locked':['T','U'].includes(r)?'premium2':r==='K'||(['L','M'].includes(r)&&n>=13)||(['N','P'].includes(r)&&n>=11)?'vip':'premium1';}
// Preserve aisle gaps and side balconies while bending rows into an illustrative arc.
let floorRows={1:0,2:0};
window.EVENT_SEAT_ROWS.forEach(row=>{
 const index=floorRows[row.floor]++;
 const radius=row.floor===1?180+index*8:390+index*9;
 let cells=[...row.cells];
 if(row.floor===1&&index<9){cells=cells.filter(Boolean);const pad=Math.floor((33-cells.length)/2);cells=[...Array(pad).fill(null),...cells];}
 row.floor===2&&(cells=Array.from({length:33},(_,i)=>row.cells.find(n=>(n%2?(n-1)/2:33-n/2)===i)||null));
 cells.forEach((n,i)=>{
  if(!n)return;
  const offset=row.floor===1&&index>=9?1:0;
  const angle=(42+96*(i+offset+.5)/33)*Math.PI/180;
  const dot=document.createElementNS(NS,'circle');
  dot.setAttribute('cx',320+Math.cos(angle)*radius*(row.floor===1?.95:.82));
  dot.setAttribute('cy',32+Math.sin(angle)*radius*.94);
  dot.setAttribute('r',row.floor===1?3.4:3.1);
  dot.dataset.tier=seatTier(row,n);dot.classList.add('map-dot');
  dot.dataset.row=row.label;dot.dataset.floor=row.floor;dot.dataset.seat=n;
  const title=document.createElementNS(NS,'title');title.textContent='Tầng '+row.floor+' · Hàng '+row.label+' · Ghế '+n;dot.append(title);map.append(dot);
 });
});
function selectTier(id){const tier=window.EVENT_TIERS.find(t=>t.id===id);$$('.tier-card').forEach(b=>{const active=b.dataset.tier===id;b.classList.toggle('is-selected',active);b.setAttribute('aria-pressed',String(active));});$$('.map-dot').forEach(dot=>dot.classList.toggle('is-highlighted',dot.dataset.tier===id));$('.map-selection').textContent=tier.name+' · '+money(tier.price)+(tier.invitation?' · Khu vé mời':'');$('#tier-map-title').textContent='Đang làm nổi bật khu '+tier.name+' tại tầng '+tier.floor;}
window.EVENT_TIERS.forEach((t,i)=>{const row=make('button','tier-card');row.type='button';row.dataset.tier=t.id;row.setAttribute('aria-controls','tier-map');const top=make('div','tier-top');top.append(make('h3','',t.name));row.append(make('span','tier-index',String(i+1).padStart(2,'0')),top,make('p','tier-price',money(t.price)),make('span','tier-arrow','←'));row.addEventListener('click',()=>selectTier(t.id));$('#tier-grid').append(row);});selectTier('vip');
$('#tier-map').addEventListener('click',event=>{
 const svg=$('#tier-map'),point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;
 const local=point.matrixTransform(svg.getScreenCTM().inverse());
 let nearest=null,distance=Infinity;
 $$('.map-dot').forEach(dot=>{const d=Math.hypot(local.x-Number(dot.getAttribute('cx')),local.y-Number(dot.getAttribute('cy')));if(d<distance){distance=d;nearest=dot;}});
 if(!nearest||distance>14)return;
 const location='Tầng '+nearest.dataset.floor+' · Hàng '+nearest.dataset.row+' · Ghế '+nearest.dataset.seat;
 if(nearest.dataset.tier==='locked'){$('.map-selection').textContent=location+' · Không mở bán';return;}
 selectTier(nearest.dataset.tier);$('.map-selection').textContent+=' · '+location;
});

$('#menu-toggle').addEventListener('click',()=>{const open=$('#mobile-menu').hidden;$('#mobile-menu').hidden=!open;$('#menu-toggle').setAttribute('aria-expanded',String(open));});$$('#mobile-menu a').forEach(a=>a.addEventListener('click',()=>{$('#mobile-menu').hidden=true;$('#menu-toggle').setAttribute('aria-expanded','false');}));
const reduced=matchMedia('(prefers-reduced-motion:reduce)');let queued=false;function scroll(){queued=false;const y=scrollY;$('#site-header').classList.toggle('is-fixed',y>125);if(!reduced.matches&&innerWidth>680)$('.hero-portrait').style.setProperty('--portrait-y',Math.min(y,850)*.05+'px');}addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(scroll);}},{passive:true});scroll();
if(!reduced.matches&&'IntersectionObserver'in window){document.body.classList.add('motion-ready');const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');obs.unobserve(e.target);}}),{threshold:.08});$$('.about-copy,.artists-heading,.venue-block,.tier-card').forEach(e=>{e.classList.add('reveal');obs.observe(e);});}
})();
if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{document.body.classList.toggle('past-hero',!entries[0].isIntersecting);},{threshold:0}).observe(document.querySelector('.hero'));

const motionSections = document.querySelectorAll('.hero,.about,.closing');
if ('IntersectionObserver' in window) { const motionVisibility = new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('motion-offscreen',!e.isIntersecting))); motionSections.forEach(e=>motionVisibility.observe(e)); }
document.addEventListener('visibilitychange',()=>document.body.classList.toggle('page-hidden',document.hidden));

(()=>{const track=document.querySelector('#journey-track');const prev=document.querySelector('#journey-prev'),next=document.querySelector('#journey-next');function update(){prev.disabled=track.scrollLeft<2;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;}function move(direction){const step=track.querySelector('.journey-card').getBoundingClientRect().width+parseFloat(getComputedStyle(track).gap);track.scrollBy({left:direction*step,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});}prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));track.addEventListener('scroll',update,{passive:true});track.addEventListener('keydown',e=>{if(e.target===track&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}});addEventListener('resize',update);update();})();

(()=>{const target=Date.parse('2026-11-02T20:00:00+07:00');let timer;function update(){const remaining=Math.max(0,Math.floor((target-Date.now())/1000));const values={days:Math.floor(remaining/86400),hours:Math.floor(remaining/3600)%24,minutes:Math.floor(remaining/60)%60,seconds:remaining%60};for(const [key,value]of Object.entries(values))document.querySelector('[data-count="'+key+'"]').textContent=String(value).padStart(2,'0');if(!remaining){document.querySelector('.countdown-date').textContent='Đã đến giờ diễn · 20:00 · 02.11.2026';clearInterval(timer);}}function start(){clearInterval(timer);update();if(!document.hidden&&Date.now()<target)timer=setInterval(update,1000);}document.addEventListener('visibilitychange',start);start();})();
