(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const textEscape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pinyinNames={a:'a · 单韵母',b:'b · 声母',c:'c · 声母',d:'d · 声母',e:'e · 单韵母',f:'f · 声母',g:'g · 声母',h:'h · 声母',i:'i · 单韵母',j:'j · 声母',k:'k · 声母',l:'l · 声母',m:'m · 声母',n:'n · 声母',o:'o · 单韵母',p:'p · 声母',q:'q · 声母',r:'r · 声母',s:'s · 声母',t:'t · 声母',u:'u · 单韵母',v:'ü · v 键',w:'w · 乌的音',x:'x · 声母',y:'y · 衣的音',z:'z · 声母'};
  const specialKeys={' ':'space',';':'semicolon',',':'comma','.':'period','?':'question','!':'exclamation',Shift:'shift',Enter:'enter',Backspace:'backspace',CapsLock:'capslock',NumLock:'numlock',Escape:'escape','+':'plus','-':'minus','*':'multiply','/':'divide'};
  const fingerPositions={LP:{x:29,y:57,h:58},LR:{x:57,y:34,h:78},LM:{x:86,y:21,h:91},LI:{x:115,y:39,h:77},RI:{x:216,y:39,h:77},RM:{x:245,y:21,h:91},RR:{x:274,y:34,h:78},RP:{x:303,y:57,h:58}};
  const FINGER_NAMES={LP:'左手小指',LR:'左手无名指',LM:'左手中指',LI:'左手食指',RI:'右手食指',RM:'右手中指',RR:'右手无名指',RP:'右手小指',TH:'拇指'};
  const HOME_KEYS={LP:'A',LR:'S',LM:'D',LI:'F',RI:'J',RM:'K',RR:'L',RP:';'};
  let options,manifest=null,context=null,keyAudio,guideAudio,activeGuide=null,voiceEnabledByGesture=false;
  let cueTimes={},fingerTimers=new Map(),rabbitTimer,celebrationNumber=0;
  const settings=()=>options?.settings()||{};
  const motionAllowed=()=>settings().animations!==false&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  const safeVolume=()=>Math.max(0,Math.min(1,(Number(settings().volume)||0)/100));
  function redFlower(cls='red-flower',label=''){
    return `<svg class="${cls}" viewBox="0 0 64 64" ${label?`role="img" aria-label="${textEscape(label)}"`:'aria-hidden="true"'}><path d="M32 9C37-2 53 3 49 16c13-2 20 13 9 21 7 12-5 24-17 17-7 12-23 8-23-5C5 54-3 39 7 31-3 20 9 7 21 14c1-12 11-16 11-5Z" fill="#ee534f" stroke="#ce383e" stroke-width="1.5"/><path d="M32 17v7m14 4-7 2m-2 14-3-6m-17-7 7 2m-2 12 5-7" stroke="#ffaba0" stroke-width="2" stroke-linecap="round"/><circle cx="32" cy="32" r="11" fill="#ffe3a0" stroke="#dca755" stroke-width="1.5"/><path d="m27 32 3 3 7-7" fill="none" stroke="#cf792b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  function bagIcon(){return `<svg class="pouch-icon" viewBox="0 0 88 90" aria-hidden="true"><path d="m28 9 32 1-9 15 11 8C85 54 82 85 44 85S3 55 25 33l12-8Z" fill="#f7dcb3" stroke="#b78148" stroke-width="2.5"/><path d="M28 27h31M35 27l-8 13m23-13 9 12" stroke="#cf5252" stroke-width="4" stroke-linecap="round"/><g transform="translate(18 36) scale(.82)">${redFlower().replace(/<svg[^>]*>|<\/svg>/g,'')}</g></svg>`;}
  function makeHands(){$('hand-visual').innerHTML='<span class="hands-loading">立体双手正在准备…</span>'; }
  function ensureAudioContext(){
    try{if(!context)context=new(window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{});}catch{}
    return context;
  }
  function unlock(){voiceEnabledByGesture=true;ensureAudioContext();}
  function guideCaption(text,state='playing'){$('voice-caption').textContent=text;$('voice-status').dataset.state=state;}
  function updateReadiness(){
    const ready=$('audio-readiness');if(!ready)return;
    ready.textContent=manifest?'MiMo 女声已连接。首次合成需联网，播放过的语音会缓存在这台电脑。':'语音还在准备。请稍后点“试听女声鼓励”，或重新打开网页。';
    ready.dataset.ready=String(!!manifest);
  }
  const audioCache=new Map();let keyTicket=0,guideTicket=0;
  const releaseVoices=fetch('assets/release-voices/manifest.json').then(r=>{if(!r.ok)throw Error('voice bank missing');return r.json();});
  async function audioURL(id,text){const bank=await releaseVoices;const known=bank[id];if(known)return known.url;if(id.startsWith('english/')&&/^[a-z]$/.test(id.slice(8)))return 'assets/mimo/english-'+id.slice(8)+'.wav';if(id.startsWith('study/'))return 'assets/'+id+'.wav';if(id==='guide'&&text){const key=id+text;if(!audioCache.has(key))audioCache.set(key,fetch(window.AccountSession.apiBase+'/tts',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+window.AccountSession.token},body:JSON.stringify({text})}).then(async r=>{const j=await r.json();if(!r.ok)throw Error(j.error);return j.url;}).catch(e=>{audioCache.delete(key);throw e;}));return audioCache.get(key);}throw Error('这段语音尚未准备。');}
  async function playFile(player,clipId,isGuide=false,text=null){
    const ticket=isGuide?++guideTicket:++keyTicket;player.pause();
    try{const url=await audioURL(clipId,text);if(ticket!==(isGuide?guideTicket:keyTicket))return false;
      player.src=url;player.currentTime=0;player.volume=safeVolume()*(isGuide?.9:activeGuide?.3:.78);player.dataset.clip=clipId;player.dataset.provider='MiMo';await player.play();return true;
    }catch(error){if(error.name==='AbortError')return false;$('audio-readiness').textContent='MiMo 语音暂时不可用：'+error.message;if(isGuide){activeGuide=null;guideCaption('文字提示仍然可以使用。','idle');}return false;}
  }
  async function speak(id,{force=false,throttle=0,priority=true}={}){
    if((settings().voicePrompts===false&&!force)||!voiceEnabledByGesture||safeVolume()===0)return false;
    const clip=manifest?.clips['prompts/'+id];if(!clip)return false;
    const now=Date.now();if(throttle&&now-(cueTimes[id]||0)<throttle)return false;
    if(!priority&&activeGuide)return false;
    cueTimes[id]=now;activeGuide=id;guideCaption(clip.text);keyAudio.volume=safeVolume()*.23;
    return await playFile(guideAudio,'prompts/'+id,true);
  }
  function pronounce(char,{force=false,mode:readMode}={}){
    if((settings().keyPronunciation===false&&!force)||!voiceEnabledByGesture||safeVolume()===0)return;
    const mode='english',base=char.toLowerCase(),syllable=null;const id=/^[a-z0-9]$/.test(base)?'english/'+base:specialKeys[char]?'keys/'+specialKeys[char]:null;if(!id)return;
    GardenEffects.lastKey={char:base,mode,id,syllable};void playFile(keyAudio,id);
  }
  async function speakText(text,{force=false}={}){if((settings().voicePrompts===false&&!force)||!voiceEnabledByGesture||safeVolume()===0)return false;activeGuide='guide';guideCaption(text);return playFile(guideAudio,'guide',true,text);}
  let teachingManifest=null,teachingBuffers=new Map(),teachingSource,teachingSerial=0;
  async function prepareTeaching(){const r=await fetch('assets/teaching/manifest.json');if(!r.ok)throw Error('教学语音库未加载');teachingManifest=await r.json();const ctx=ensureAudioContext();await Promise.all(Object.entries(teachingManifest).map(async([code,clip])=>{const response=await fetch(clip.url);const buffer=await ctx.decodeAudioData(await response.arrayBuffer());teachingBuffers.set(code,buffer);}));GardenEffects.teachingDecodedCount=teachingBuffers.size;GardenEffects.teachingContext=ctx;GardenEffects.teachingReady=true;window.dispatchEvent(new Event('teaching-ready'));return true;}
  async function teachKey(code,text,{force=false}={}){const serial=++teachingSerial;if((settings().teachingVoice===false&&!force)||safeVolume()===0)return;unlock();const started=performance.now();if(!GardenEffects.teachingReady){guideCaption('教学语音正在准备，准备好会自动读出这个键。');try{await GardenEffects.teachingPromise;}catch{guideCaption('教学语音没有加载好，请重新打开页面。','idle');return;}}if(serial!==teachingSerial)return;const buffer=teachingBuffers.get(code);if(!buffer)return;guideAudio.pause();try{teachingSource?.stop();}catch{}const ctx=ensureAudioContext(),source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;gain.gain.value=safeVolume()*.9;source.connect(gain);gain.connect(ctx.destination);source.start();teachingSource=source;guideCaption(text);GardenEffects.lastTeaching={code,delayMs:performance.now()-started};GardenEffects.guidePlayCount++;source.onended=()=>{if(teachingSource===source)guideCaption('按一个键，听它的小本领。','idle');};}
  async function playStudy(id){unlock();stopAudio();return playFile(guideAudio,'study/'+id,true);}
  function clickSound(force=false){
    if((settings().typingSound===false&&!force)||safeVolume()===0)return;
    const ctx=ensureAudioContext();if(!ctx)return;
    const now=ctx.currentTime,buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.036),ctx.sampleRate),samples=buffer.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*Math.exp(-i/(ctx.sampleRate*.006));
    const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;filter.type='highpass';filter.frequency.value=800;gain.gain.value=safeVolume()*.18;source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);source.start(now);
    const tone=ctx.createOscillator(),toneGain=ctx.createGain();tone.type='triangle';tone.frequency.setValueAtTime(260,now);tone.frequency.exponentialRampToValueAtTime(120,now+.035);toneGain.gain.setValueAtTime(safeVolume()*.025,now);toneGain.gain.exponentialRampToValueAtTime(.0001,now+.04);tone.connect(toneGain);toneGain.connect(ctx.destination);tone.start(now);tone.stop(now+.045);
    GardenEffects.clickCount=(GardenEffects.clickCount||0)+1;
  }
  function chime(){
    if(settings().typingSound===false||safeVolume()===0)return;
    const ctx=ensureAudioContext();if(!ctx)return;
    [523.25,659.25,783.99,1046.5].forEach((frequency,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+i*.075;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(.001,t);gain.gain.exponentialRampToValueAtTime(safeVolume()*.065,t+.018);gain.gain.exponentialRampToValueAtTime(.001,t+.42);osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+.45);});
  }
  function setTarget(char,finger,numpad=false){
    const id=finger==='TH'?(numpad&&char==='0'?'THR':'THL'):finger;window.RealHands?.setTarget(settings().hints!==false?id:null);
    $('hand-caption').textContent=settings().hints===false?'双手放松，按完回家。':(finger==='TH'&&numpad&&char==='0'?'右手拇指':FINGER_NAMES[finger])+' → '+(char===' '?'空格':char.toUpperCase());
    $('hand-visual').setAttribute('aria-label',`双手示范，下一个键 ${char===' '?'空格':char.toUpperCase()}，用${FINGER_NAMES[finger]}`);
  }
  function pressFinger(finger,char,numpad=false){
    if(settings().hands===false)return;const id=finger==='TH'?(numpad?'THR':'THL'):finger;
    if(motionAllowed())window.RealHands?.press(id,char,numpad);
    $('hand-caption').textContent=(finger==='TH'&&numpad?'右手拇指':FINGER_NAMES[finger])+' 按 '+(char===' '?'空格':char.toUpperCase());GardenEffects.lastFinger={finger:id,char,numpad};
  }
  function rabbitTap(){
    const rabbit=$('rabbit-sprite');clearTimeout(rabbitTimer);rabbit.classList.add('rabbit-fast');rabbitTimer=setTimeout(()=>rabbit.classList.remove('rabbit-fast'),320);
  }
  function syncSettings(){
    const s=settings();$('hand-demo').hidden=s.hands===false;
    document.body.classList.toggle('no-effects',s.animations===false);document.body.classList.toggle('rabbit-paused',s.rabbitAnimation===false);
    if(s.animations===false){$('reward-layer').getAnimations({subtree:true}).forEach(a=>a.cancel());$('reward-layer').replaceChildren();}
    if(s.voicePrompts===false){guideTicket++;guideAudio?.pause();activeGuide=null;guideCaption('语音提醒已关闭，可在设置中开启。','idle');}
    else if(!activeGuide)guideCaption('温柔女声，陪你慢慢练','idle');
    if(s.keyPronunciation===false){keyTicket++;keyAudio?.pause();}
    if(keyAudio)keyAudio.volume=safeVolume()*(activeGuide?.23:.78);if(guideAudio)guideAudio.volume=safeVolume()*.9;
    updateReadiness();
  }
  function collectAnimation(){
    const layer=$('reward-layer'),pouch=$('flower-pouch'),source=$('practice-pad');if(!layer||!pouch||!source)return;
    chime();const s=source.getBoundingClientRect();let d=pouch.getBoundingClientRect();if(d.top<0||d.bottom>innerHeight)d=$('flower-count').getBoundingClientRect();const from={x:s.left+s.width*.55,y:s.top+s.height*.43},to={x:d.left+Math.min(45,d.width*.5),y:d.top+d.height*.5};
    const bloom=document.createElement('div');bloom.className='reward-bloom';bloom.innerHTML=`<div class="reward-aura"></div>${redFlower('red-flower reward-main-flower')}<strong>小红花 +1</strong><span>这份认真，收入小口袋</span>`;
    bloom.style.left=from.x+'px';bloom.style.top=from.y+'px';layer.append(bloom);GardenEffects.awardAnimationCount=(GardenEffects.awardAnimationCount||0)+1;
    if(++celebrationNumber%2===0)void speak('milestone-2',{priority:false});else void speak('milestone-1',{priority:false});
    if(!motionAllowed()){bloom.classList.add('reward-static');setTimeout(()=>bloom.remove(),550);return;}
    const reducedSmall=innerWidth<700;
    for(let i=0;i<(reducedSmall?12:22);i++){
      const particle=document.createElement('i'),angle=i*Math.PI*2/(reducedSmall?12:22),radius=60+Math.random()*65;
      particle.className='reward-particle';particle.style.background=['#ef655b','#ffd262','#92c78b','#eaaa52'][i%4];particle.style.left=from.x+'px';particle.style.top=from.y+'px';layer.append(particle);
      const motion=particle.animate([{transform:'translate(-50%,-50%) scale(.2)',opacity:0},{transform:`translate(calc(-50% + ${Math.cos(angle)*radius}px),calc(-50% + ${Math.sin(angle)*radius}px)) rotate(${i*25}deg) scale(1)`,opacity:1,offset:.42},{transform:`translate(calc(-50% + ${Math.cos(angle)*radius*1.3}px),calc(-50% + ${Math.sin(angle)*radius*1.3+50}px)) rotate(${i*38}deg) scale(.4)`,opacity:0}],{duration:1050+Math.random()*200,easing:'cubic-bezier(.15,.65,.3,1)'});motion.finished.then(()=>particle.remove(),()=>particle.remove());
    }
    const dx=to.x-from.x,dy=to.y-from.y;
    const flight=bloom.animate([{transform:'translate(-50%,-50%) scale(.25) rotate(-12deg)',opacity:0},{transform:'translate(-50%,-50%) scale(1.12) rotate(5deg)',opacity:1,offset:.22},{transform:'translate(-50%,-50%) scale(1) rotate(0)',opacity:1,offset:.52},{transform:`translate(calc(-50% + ${dx*.35}px),calc(-50% + ${Math.min(-70,dy*.55)}px)) scale(.7) rotate(15deg)`,opacity:1,offset:.75},{transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.08) rotate(35deg)`,opacity:0}],{duration:1700,easing:'cubic-bezier(.28,.08,.35,1)'});
    flight.finished.then(()=>{bloom.remove();pouch.animate([{transform:'scale(1)'},{transform:'scale(1.09) rotate(-3deg)'},{transform:'scale(1)'}],{duration:330,easing:'ease-out'});}).catch(()=>bloom.remove());
  }
  function stopAudio(){teachingSerial++;try{teachingSource?.stop();}catch{}keyTicket++;guideTicket++;keyAudio?.pause();guideAudio?.pause();activeGuide=null;guideCaption(settings().voicePrompts===false?'语音提醒已关闭，可在设置中开启。':'温柔女声，陪你慢慢练','idle');}
  function init(config){
    options=config;makeHands();$('pouch-flower').innerHTML=bagIcon();$('settings-red-flower').innerHTML=redFlower();
    keyAudio=new Audio();keyAudio.id='key-pronunciation-audio';keyAudio.preload='auto';keyAudio.hidden=true;document.body.append(keyAudio);
    guideAudio=new Audio();guideAudio.id='female-guide-audio';guideAudio.preload='auto';guideAudio.hidden=true;document.body.append(guideAudio);
    guideAudio.addEventListener('ended',()=>{activeGuide=null;keyAudio.volume=safeVolume()*.78;guideCaption(settings().voicePrompts===false?'语音提醒已关闭，可在设置中开启。':'温柔女声，陪你慢慢练','idle');});
    guideAudio.addEventListener('error',()=>{activeGuide=null;guideCaption('这段语音暂时没有加载好，文字提示仍然可以使用。','idle');});
    keyAudio.addEventListener('playing',()=>{GardenEffects.keyPlayCount=(GardenEffects.keyPlayCount||0)+1;keyAudio._hearing={...GardenEffects.lastKey};if(keyAudio._hearing.syllable)window.GardenPlus?.showPinyin(keyAudio._hearing);});
    keyAudio.addEventListener('ended',()=>{const h=keyAudio._hearing;if(h&&keyAudio.volume>0&&settings().keyPronunciation!==false)window.GardenPlus?.heard(h);});
    window.addEventListener('hands-ready',()=>{const a=window.GardenApp;if(a?.session)setTarget(a.session.tasks[a.session.taskIndex]?.text[a.session.charIndex]||'f',a.fingerFor(a.session.tasks[a.session.taskIndex]?.text[a.session.charIndex]||'f'),!!a.session.lesson.numpad);});
    guideAudio.addEventListener('playing',()=>{GardenEffects.guidePlayCount=(GardenEffects.guidePlayCount||0)+1;});
    GardenEffects.ready=fetch('assets/audio/manifest.json').then(r=>{if(!r.ok)throw Error('audio manifest unavailable');return r.json();}).then(data=>{manifest=data;updateReadiness();return data;}).catch(()=>{updateReadiness();return null;});
    const side=document.querySelector('.side-column'),coach=document.querySelector('.coach-card');side.prepend(coach);coach.after(document.querySelector('.flower-pocket-card'));
    syncSettings();
    $('pronunciation-select').innerHTML=[...'abcdefghijklmnopqrstuvwxyz0123456789'].map(c=>`<option value="${c}" ${c==='f'?'selected':''}>${c.toUpperCase()}</option>`).join('');
    $('pronunciation-test-button').addEventListener('click',()=>{unlock();pronounce($('pronunciation-select').value,{force:true});});
    $('voice-test-button').addEventListener('click',()=>{unlock();void speak('mistake-1',{force:true});});
    $('typing-test-button').addEventListener('click',()=>{unlock();clickSound(true);});
  }
  window.GardenEffects={init,unlock,syncSettings,setTarget,pressFinger,pronounce,speak,speakText,teachKey,prepareTeaching,playStudy,clickSound,rabbitTap,collectAnimation,redFlower,pinyinNames,stopAudio,lastKey:null,lastFinger:null,keyPlayCount:0,guidePlayCount:0,clickCount:0,awardAnimationCount:0,ready:Promise.resolve(null)};
  const GardenEffects=window.GardenEffects;
})();
