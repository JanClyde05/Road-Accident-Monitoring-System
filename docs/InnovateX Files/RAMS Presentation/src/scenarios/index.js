import { icon } from '../icons.js';

const stories = {
  pairing: {
    label: 'Pairing',
    title: 'Before the trip',
    duration: 10,
    phases: [
      [0, 'Prepare', 'The wearer opens the Android companion with the wearable nearby.'],
      [0.31, 'Connect', 'The phone connects to the wearable over Bluetooth Low Energy.'],
      [0.69, 'Monitor', 'The phone supplies motion and location. The wearable provides the LoRa link.'],
    ],
  },
  motorcycle: {
    label: 'Motorcycle',
    title: 'Motorcycle slide',
    duration: 9,
    phases: [
      [0, 'Approach', 'A rider travels along the corridor with a paired phone and wearable.'],
      [
        0.48,
        'Loss of balance',
        'The motorcycle leans, falls and slides. The rider’s orientation changes with it.',
      ],
      [
        0.76,
        'After the slide',
        'The bike settles. A candidate event can be assessed from the phone’s motion and speed context.',
      ],
    ],
  },
  car: {
    label: 'Car',
    title: 'Junction collision',
    duration: 9,
    phases: [
      [0, 'Approach', 'Two vehicles enter the junction from different directions.'],
      [0.5, 'Contact', 'The vehicles meet at the junction and change course abruptly.'],
      [
        0.72,
        'After contact',
        'The cars slow to a stop. The person carrying the phone may be unable to make a call.',
      ],
    ],
  },
  pedestrian: {
    label: 'Pedestrian',
    title: 'Pedestrian crossing',
    duration: 9,
    phases: [
      [0, 'Approach', 'A pedestrian is crossing while a car approaches the marked lane.'],
      [0.5, 'Contact', 'The vehicle reaches the pedestrian, who loses balance.'],
      [
        0.74,
        'After the fall',
        'The pedestrian’s phone moves with them. The request for help depends on the sensed event and a working link.',
      ],
    ],
  },
  fall: {
    label: 'Fall',
    title: 'A fall while walking',
    duration: 9,
    phases: [
      [0, 'Walking', 'The wearer is on foot. There is no vehicle contact in this sequence.'],
      [0.45, 'Loss of footing', 'A step slips and the wearer reaches out to brace. The phone changes orientation with the body.'],
      [0.71, 'Ground contact', 'The wearer comes to rest on their side. A phone moving with the body can record the impact and the resulting change in orientation.'],
    ],
  },
};
const css = `
.story-film{--frame-line:#344a54;overflow:hidden}.story-tabs{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}.story-tabs button,.story-player button{font:inherit;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#c4d4da;border:1px solid var(--frame-line);background:#101f28;border-radius:4px;min-height:32px;padding:4px 9px;font-size:12px}.story-tabs button[aria-pressed=true]{color:#95f0e4;background:#193d40;border-color:#547c7c}.story-tabs button:hover,.story-player button:hover{border-color:#78bbb6}.story-cinema{position:relative;isolation:isolate;width:100%;height:clamp(190px,32vh,395px);overflow:hidden;background:#0b171e}.story-cinema video,.story-cinema img{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.story-cinema video[hidden],.story-cinema img[hidden],.story-label[hidden]{display:none}.story-anchor,.story-tag{font:10px var(--mono,monospace);text-transform:uppercase;color:#cce4e7;letter-spacing:.055em;line-height:1.3}.story-tag{position:absolute;top:12px;left:14px;z-index:1;background:#0a151edb;padding:5px 8px;border-left:2px solid #81ded5}.story-label{position:absolute;z-index:1;pointer-events:none;transform:translate(1px,-100%);display:flex;align-items:flex-start;color:#9cf2e3}.story-label i{height:19px;width:20px;transform:skewX(-32deg);border-left:1px solid currentColor;border-top:1px solid currentColor;transform-origin:bottom}.story-label b{display:block;position:relative;top:-7px;margin-left:9px;padding:2px 5px;background:#12272bdd;color:#a6f5e8;font:9px var(--mono,monospace);text-transform:uppercase}.story-copy{padding:12px 18px 11px;border-top:1px solid var(--frame-line);min-height:80px}.story-copy h3{font-size:17px;margin:0 0 4px;letter-spacing:-.035em}.story-copy p{font-size:13px;line-height:1.45;color:#b1c4ce;margin:0}.story-player{display:flex;align-items:center;gap:9px;border-top:1px solid var(--frame-line);padding:8px 14px;color:#b5c6cf}.story-player button{min-width:33px;width:33px;min-height:32px;height:32px;padding:7px}.story-player svg{width:15px;height:15px}.story-player input{min-width:45px;flex:1;accent-color:#79e2d7;cursor:pointer}.story-player output{font:11px var(--mono,monospace);white-space:nowrap}.story-film .plate-head{padding:12px 16px}.story-film .plate-head strong{white-space:nowrap}.story-static{padding:0 14px 8px;color:#a2bac7;font:10px var(--mono,monospace)}
@media(max-width:780px){.story-cinema{height:clamp(195px,60vw,285px)}.story-film .plate-head{padding:10px 12px;gap:8px;flex-wrap:wrap}.story-tabs{gap:3px}.story-tabs button{min-height:32px;font-size:11px;padding:4px 7px}.story-copy{min-height:80px;padding:10px 13px}.story-player{padding:6px 10px}.story-tag{font-size:9px;top:9px;left:9px}}
@media(min-width:781px) and (max-height:760px){.story-cinema{height:clamp(175px,30vh,230px)}.story-copy{min-height:66px;padding:8px 15px}.story-film .plate-head{padding:9px 14px}}
`;
function ensureStyle() {
  if (document.getElementById('rams-scenario-style')) return;
  const style = document.createElement('style');
  style.id = 'rams-scenario-style';
  style.textContent = css;
  document.head.append(style);
}

export function scenarios(panel, {initial}={}) {
  ensureStyle();
  const names=initial==='pairing'?['pairing']:['motorcycle','car','pedestrian','fall'];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  panel.innerHTML=`<div class="plate story-film"><div class="plate-head"><strong>${initial==='pairing'?'Wearer setup':'Road scenarios'}</strong>${names.length===1?'<span class="tiny">Bluetooth Low Energy</span>':'<div class="story-tabs" aria-label="Choose a scenario">'+names.map(n=>'<button data-story="'+n+'">'+stories[n].label+'</button>').join('')+'</div>'}</div>
    <div class="story-cinema" role="img"><img alt=""><div class="story-tag">Illustrative sequence</div></div>
    <div class="story-copy"><h3></h3><p></p></div><div class="story-player">
    <button data-action="play" aria-label="Play scenario"></button>
    <button data-action="restart" aria-label="Replay scenario" title="Replay scenario">${icon('reset')}</button>
    <input aria-label="Scenario timeline" type="range" min="0" max="100" step="1" value="0"><output></output></div></div>`;
  const film=panel.querySelector('.story-film'), cinema=film.querySelector('.story-cinema'), poster=cinema.querySelector('img');
  const tag=cinema.querySelector('.story-tag'),play=film.querySelector('[data-action=play]'), range=film.querySelector('input');
  let id,video,stills=false,playing=false,disposed=false,frame=0,prior=0,progress=0,phase=-1,previousSecond=-1,suspended=false;
  const clock=sec=>'0:'+String(Math.floor(sec)).padStart(2,'0');
  const blocked=()=>document.hidden||Boolean(document.querySelector('dialog[open]'));
  function display(){
    const {duration,phases,title}=stories[id],next=phases.findLastIndex(([start])=>progress+1e-6>=start);
    if(next!==phase){
      phase=next;film.querySelector('.story-copy h3').textContent=phases[next][1];
      film.querySelector('.story-copy p').textContent=phases[next][2];
      cinema.setAttribute('aria-label',title+'. '+phases[next][2]);
      poster.src='public/scenarios/'+id+'-'+next+'.webp';
    }
    const tick=Math.round(progress*100);
    if(Number(range.value)!==tick)range.value=tick;
    const second=Math.floor(progress*duration);
    if(second!==previousSecond){
      previousSecond=second;film.querySelector('output').textContent=clock(second)+' / '+clock(duration);
      range.setAttribute('aria-valuetext',phases[next][1]+', '+clock(second));
    }
  }
  function button(){
    const action=playing?'Pause scenario':progress>=1?'Replay scenario from start':'Play scenario';
    play.setAttribute('aria-label',action);play.title=action;
    play.innerHTML=icon(playing?'pause':progress>=1?'reset':'play');
  }
  function pause(){
    playing=false;suspended=false;cancelAnimationFrame(frame);prior=0;
    video?.pause();button();
  }
  function update(now){
    if(disposed||!playing)return;
    if(blocked()){
      if(!suspended){video?.pause();suspended=true;}
      prior=0;
    }else{
      if(suspended){suspended=false;if(!stills)runVideo(video);}
      if(stills){if(prior)progress=Math.min(1,progress+(now-prior)/1000/stories[id].duration);}
      prior=now;display();
    }
    if(progress>=1){pause();return;}
    if(stills)frame=requestAnimationFrame(update);
  }
  async function runVideo(current){
    try{await current.play();}
    catch(err){
      if(disposed||current!==video||err.name==='AbortError')return;
      if(err.name==='NotAllowedError'){pause();return;}
      useStills();
    }
  }
  function start(){
    if(progress>=1)seek(0);
    playing=true;button();prior=0;cancelAnimationFrame(frame);
    if(stills)frame=requestAnimationFrame(update);
    else if(!blocked())runVideo(video);
  }
  function seek(value){
    progress=value;display();
    if(!stills&&video?.readyState>=1)video.currentTime=Math.min(value*stories[id].duration,video.duration||stories[id].duration);
    button();
  }
  function useStills(){
    stills=true;video.pause();video.hidden=true;poster.hidden=false;tag.textContent='Illustrated storyboard';prior=0;
    cancelAnimationFrame(frame);if(playing)frame=requestAnimationFrame(update);
    display();
  }
  function discardVideo(){
    if(!video)return;
    video.onerror=video.onloadedmetadata=video.onloadeddata=video.onended=video.ontimeupdate=null;
    video.pause();video.removeAttribute('src');video.load();video.remove();
  }
  function select(name){
    pause();discardVideo();id=name;progress=0;phase=previousSecond=-1;stills=false;
    film.querySelectorAll('[data-story]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.story===id));
    tag.textContent='Illustrative sequence';poster.hidden=false;display();button();
    const current=document.createElement('video');video=current;current.muted=true;current.playsInline=true;
    current.preload='auto';current.disablePictureInPicture=true;current.setAttribute('aria-hidden','true');
    current.poster=poster.src;cinema.prepend(current);
    current.onerror=()=>{if(current===video&&!disposed)useStills();};
    current.onloadedmetadata=()=>{if(current===video&&!stills&&progress>0)seek(progress);};
    current.onloadeddata=()=>{if(current===video&&!stills){poster.hidden=true;}};
    current.ontimeupdate=()=>{if(current===video&&playing&&!stills&&!current.seeking){progress=Math.min(1,current.currentTime/stories[id].duration);display();}};
    current.onended=()=>{if(current===video){progress=1;display();pause();}};
    if(!current.canPlayType('video/mp4')){useStills();return;}
    current.src='public/scenarios/'+id+'.mp4';
    if(!reduce.matches)start();
  }
  play.onclick=()=>playing?pause():start();
  film.querySelector('[data-action=restart]').onclick=()=>{pause();seek(0);start();};
  film.querySelectorAll('[data-story]').forEach(b=>{b.onclick=()=>select(b.dataset.story);});
  range.oninput=()=>{pause();seek(Number(range.value)/100);};
  function preference(e){if(e.matches)pause();}
  function visibility(){
    if(!playing)return;
    if(blocked()){video?.pause();suspended=true;prior=0;}
    else if(suspended){suspended=false;if(!stills)runVideo(video);}
  }
  const modalChanges=new MutationObserver(visibility);
  modalChanges.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',visibility);
  reduce.addEventListener('change',preference);select(names.includes(initial)?initial:names[0]);
  return ()=>{disposed=true;pause();discardVideo();modalChanges.disconnect();document.removeEventListener('visibilitychange',visibility);reduce.removeEventListener('change',preference);};
}
