(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const lessons = window.TYPING_LESSONS;
  const groups = window.TYPING_GROUPS;
  const effects = window.GardenEffects;
  const STORAGE_KEY = window.AccountSession?.storageKey || 'lixia-typing-garden-v1';
  const fingers = {
    LP: {name:'左手小指',short:'左小指',style:'pinky',color:'#e3a687',home:'a'},
    LR: {name:'左手无名指',short:'左无名指',style:'ring',color:'#c6ae52',home:'s'},
    LM: {name:'左手中指',short:'左中指',style:'middle',color:'#76a4c5',home:'d'},
    LI: {name:'左手食指',short:'左食指',style:'index-left',color:'#98b85f',home:'f'},
    RI: {name:'右手食指',short:'右食指',style:'index-right',color:'#6aaf9d',home:'j'},
    RM: {name:'右手中指',short:'右中指',style:'middle',color:'#76a4c5',home:'k'},
    RR: {name:'右手无名指',short:'右无名指',style:'ring',color:'#c6ae52',home:'l'},
    RP: {name:'右手小指',short:'右小指',style:'pinky',color:'#e3a687',home:';'},
    TH: {name:'任意一只拇指',short:'拇指',style:'thumb',color:'#a1af9b',home:' '}
  };
  const fingerKeys = {LP:'`1qaz',LR:'2wsx',LM:'3edc',LI:'45rtfgvb',RI:'67yuhjnm',RM:'8ik,',RR:'9ol.',RP:"0-=p[]\\;' /"};
  const shifted = {'!':'1','@':'2','#':'3','$':'4','%':'5','^':'6','&':'7','*':'8','(':'9',')':'0','_':'-','+':'=','{':'[','}':']','|':'\\',':':';','"':"'",'<':',','>':'.','?':'/','~':'`'};
  const codeChars = {Space:' ',Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',Backslash:'\\',Backquote:'`'};
  const svg = (body, cls = '', extra = '') => `<svg class="${cls}" viewBox="0 0 64 64" ${extra}>${body}</svg>`;
  const starSvg = active => svg('<path d="m32 6 8 17 19 3-14 14 3 19-16-9-16 9 3-19L5 26l19-3Z"/>',`star-icon${active ? '' : ' dim'}`,'aria-hidden="true"');
  const starsHtml = value => `<span class="star-row">${[1,2,3].map(n=>starSvg(n<=value)).join('')}</span>`;
  const lockSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
  const escapeHtml = text => String(text).replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const defaults = () => ({version:1,guideSeen:false,lastLesson:'fj',flowers:0,flowerEvents:[],completions:{},sessions:[],keyStats:{},daily:{},spelling:{correct:0,sessions:0},growth:{correct:{},pinyin:{},english:{},codes:{}},exams:[],rankings:[],settings:{autoNext:false,examMinutes:10,gameLevel:'letters',goal:5,hints:true,numpad:true,breakReminder:true,letterMode:'english',keyPronunciation:true,voicePrompts:true,typingSound:true,volume:75,hands:true,spellingHints:true,teachingVoice:true,animations:true,rabbitAnimation:true}});
  const boundedNumber = (n,max=1e9) => typeof n === 'number' && Number.isFinite(n) ? Math.max(0,Math.min(max,n)) : 0;
  function sanitize(raw) {
    if (!raw || raw.version !== 1 || typeof raw !== 'object') throw new Error('这份记录不是小花园的备份，或版本不匹配。');
    const out = defaults();
    out.guideSeen = raw.guideSeen === true;
    out.lastLesson = lessons.some(l=>l.id===raw.lastLesson) ? raw.lastLesson : 'fj';
    out.flowers = Math.floor(boundedNumber(raw.flowers));
    const settings = raw.settings || {};
    out.settings.goal = [5,8,10].includes(settings.goal) ? settings.goal : 5;
    out.settings.letterMode = 'english';
    out.settings.volume = typeof settings.volume==='number'?boundedNumber(settings.volume,100):75;
    for (const key of ['hints','numpad','breakReminder','keyPronunciation','voicePrompts','typingSound','hands','animations','rabbitAnimation']) if (typeof settings[key]==='boolean') out.settings[key]=settings[key];
    if(!Object.hasOwn(settings,'keyPronunciation'))out.settings.numpad=true;
    for (const lesson of lessons) {
      const c = raw.completions?.[lesson.id];
      if (c && typeof c==='object') out.completions[lesson.id] = {stars:Math.min(3,Math.max(1,Math.floor(boundedNumber(c.stars,3)))),bestAccuracy:boundedNumber(c.bestAccuracy,100),count:Math.max(1,Math.floor(boundedNumber(c.count))),date:/^\d{4}-\d{2}-\d{2}$/.test(c.date) ? c.date : today()};
    }
    if (Array.isArray(raw.sessions)) out.sessions = raw.sessions.slice(-500).flatMap(s=>{
      if (!s || (!lessons.some(l=>l.id===s.lessonId) && s.lessonId !== 'review') || !/^\d{4}-\d{2}-\d{2}$/.test(s.date)) return [];
      return [{lessonId:s.lessonId,date:s.date,accuracy:boundedNumber(s.accuracy,100),correct:boundedNumber(s.correct,10000),wrong:boundedNumber(s.wrong,100000),timeMs:boundedNumber(s.timeMs,3600000),speed:boundedNumber(s.speed,10000),flowers:boundedNumber(s.flowers,1000),stars:Math.min(3,Math.max(1,Math.floor(boundedNumber(s.stars,3))))}];
    });
    for (const [key,stats] of Object.entries(raw.keyStats || {})) if (/^[a-zA-Z0-9 ;,.?!]$/.test(key) && stats && typeof stats==='object') out.keyStats[key] = {attempts:boundedNumber(stats.attempts),wrong:Math.min(boundedNumber(stats.attempts),boundedNumber(stats.wrong))};
    for (const [day,stats] of Object.entries(raw.daily || {}).slice(-400)) if (/^\d{4}-\d{2}-\d{2}$/.test(day) && stats && typeof stats==='object') out.daily[day] = {timeMs:boundedNumber(stats.timeMs,86400000),flowers:Math.floor(boundedNumber(stats.flowers,10000))};
    out.flowers = Math.max(out.flowers,out.sessions.length);
    if(Array.isArray(raw.flowerEvents))out.flowerEvents=raw.flowerEvents.slice(-4000).flatMap((event,index)=>{
      if(!event||!/^\d{4}-\d{2}-\d{2}$/.test(event.date)||(!lessons.some(l=>l.id===event.lessonId)&&!['review','legacy'].includes(event.lessonId)))return [];
      return [{id:String(event.id||'restored-'+index).replace(/[^a-zA-Z0-9-]/g,'').slice(0,80),lessonId:event.lessonId,date:event.date,stage:Math.floor(boundedNumber(event.stage,2000)),correct:Math.floor(boundedNumber(event.correct,10000)),legacy:event.legacy===true}];
    });
    out.flowers=Math.max(out.flowers,out.flowerEvents.length);
    if(out.flowers&&!out.flowerEvents.length)out.flowerEvents=Array.from({length:Math.min(4000,out.flowers)},(_,index)=>({id:'legacy-'+index,lessonId:out.sessions[index]?.lessonId||'legacy',date:out.sessions[index]?.date||today(),stage:1,correct:out.sessions[index]?.correct||0,legacy:true}));
    for(const type of ['correct','pinyin','english'])for(const [key,n]of Object.entries(raw.growth?.[type]||{}))if(/^[a-zA-Z0-9 `~!@#$%^&*()_+\-=[\]{};:'",.<>/?|\\]$/.test(key))out.growth[type][key]=boundedNumber(n);
    if(!raw.growth)for(const [key,stat]of Object.entries(out.keyStats))out.growth.correct[key.toLowerCase()]=Math.max(0,stat.attempts-stat.wrong);
    for(const [code,n]of Object.entries(raw.growth?.codes||{}))if(/^[A-Za-z0-9]+$/.test(code))out.growth.codes[code]=boundedNumber(n);
    if(!raw.growth?.codes)for(const [key,n]of Object.entries(out.growth.correct)){const code=/^[a-z]$/.test(key)?'Key'+key.toUpperCase():/^\d$/.test(key)?'Digit'+key:key===' '?'Space':null;if(code)out.growth.codes[code]=(out.growth.codes[code]||0)+n;}
    out.settings.autoNext=settings.autoNext===true;out.settings.examMinutes=[5,10,15].includes(settings.examMinutes)?settings.examMinutes:10;out.settings.gameLevel=['letters','mixed','symbols'].includes(settings.gameLevel)?settings.gameLevel:'letters';
    out.exams=Array.isArray(raw.exams)?raw.exams.slice(-100).filter(r=>r&&['chinese','english','knowledge'].includes(r.type)&&Number.isFinite(r.correct)).map(r=>({type:r.type,date:String(r.date||''),correct:boundedNumber(r.correct,50),wrong:boundedNumber(r.wrong,10000),seconds:boundedNumber(r.seconds,900),passed:r.passed===true})):[];
    out.rankings=Array.isArray(raw.rankings)?raw.rankings.slice(-100).filter(r=>r&&Number.isFinite(r.score)).map(r=>({name:String(r.name||'立夏').slice(0,12),score:boundedNumber(r.score,1e6),date:String(r.date||''),level:['letters','mixed','symbols'].includes(r.level)?r.level:'letters',collected:boundedNumber(r.collected,10000)})):[];
    out.spelling={correct:boundedNumber(raw.spelling?.correct),sessions:boundedNumber(raw.spelling?.sessions)};
    out.settings.spellingHints=raw.settings?.spellingHints!==false;out.settings.teachingVoice=raw.settings?.teachingVoice!==false;
    return out;
  }
  let data = defaults(), storageHealthy = true;
  try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) data = sanitize(JSON.parse(raw)); } catch { storageHealthy=false; }
  let session = null, currentView = 'practice', restElapsed = 0, lastTick = Date.now(), saveTicks = 0, toastTimeout, lastResult = null, flowerVisibleCount = 24, lastMistakeVoice = 0, pendingResultTimer;
  function save(options={}) {
    try { localStorage.setItem(STORAGE_KEY,JSON.stringify(data)); storageHealthy=true; }
    catch { storageHealthy=false; }
    window.AccountSession?.observe(data,options);updateStorageStatus();
  }
  function updateStorageStatus() {
    $('storage-status').textContent = storageHealthy ? '记录保存在此 Chrome 的本机数据里。清理浏览器数据前，请先备份。' : '浏览器暂时无法保存进度。请先用“备份练习记录”下载记录。';
    document.querySelector('.local-note').lastChild.textContent = storageHealthy ? '进度自动保存在这台电脑' : '暂时无法保存，请在家长小窗备份';
  }
  function dayData() { const day=today(); if (!data.daily[day]) data.daily[day]={timeMs:0,flowers:0}; return data.daily[day]; }
  function recommended() { return lessons.find(l=>!data.completions[l.id]) || lessons[lessons.length-1]; }
  function unlocked(index) { return index===0 || !!data.completions[lessons[index-1].id]; }
  function chooseSavedLesson() { const i=lessons.findIndex(l=>l.id===data.lastLesson); return i>=0&&unlocked(i) ? lessons[i] : recommended(); }
  function tasksFor(lesson) {
    if (lesson.words) return lesson.words.map(w=>({...w}));
    if (!lesson.spaces) return lesson.text.split(/\s+/).filter(Boolean).map(text=>({text,meaning:lesson.meaning || '认准字母，一个一个按'}));
    const tasks=[],words=lesson.text.split(' ');let text='';
    for (const word of words) { if (text && text.length+word.length+1>32) { tasks.push({text,meaning:'字母之间不用空格，单词之间空一格'});text=word; } else text+=(text?' ':'')+word; }
    if (text) tasks.push({text,meaning:lesson.meaning || '字母之间不用空格，单词之间空一格'});
    return tasks;
  }
  function beginLesson(lesson,autostart=false) {
    clearTimeout(pendingResultTimer);
    pause(false); closeDialogs();
    const tasks=tasksFor(lesson);
    session={lesson,tasks,taskIndex:0,charIndex:0,correct:0,wrong:0,combo:0,bestCombo:0,timeMs:0,running:false,started:false,finished:false,lastInputAt:0,total:tasks.reduce((sum,t)=>sum+t.text.length,0),errors:{},needsFix:false,flowersEarned:0,awardedCorrect:0};
    if (lesson.id!=='review') { data.lastLesson=lesson.id;save(); }
    showView('practice',false); renderLesson(); updateDaily();
    if (autostart) start();
  }
  function currentTask() { return session?.tasks[session.taskIndex]; }
  function expected() { return currentTask()?.text[session.charIndex] || ''; }
  function physicalChar(char) { return shifted[char] || char.toLowerCase(); }
  function fingerFor(char,useNumpad=session?.lesson.numpad) {
    if (char===' ') return 'TH';
    const physical=physicalChar(char);
    if (useNumpad && /\d/.test(char)) { if ('147'.includes(char)) return 'RI';if ('258'.includes(char)) return 'RM';if ('369'.includes(char)) return 'RR';return 'TH'; }
    return Object.keys(fingerKeys).find(id=>fingerKeys[id].includes(physical)) || 'RP';
  }
  function needsShift(char) { return /[A-Z]/.test(char) || Object.hasOwn(shifted,char); }
  function keyName(char) { return char===' ' ? '空格' : char===';' ? ';（分号）' : char===',' ? ',（逗号）' : char==='.' ? '.（句号）' : char.toUpperCase(); }
  function shiftCode(char) { return ['LP','LR','LM','LI'].includes(fingerFor(char)) ? 'ShiftRight' : 'ShiftLeft'; }
  function codeFor(char) {
    const c=physicalChar(char);
    if (/^[a-z]$/.test(c)) return 'Key'+c.toUpperCase();
    if (/^\d$/.test(c)) return session?.lesson.numpad ? 'Numpad'+c : 'Digit'+c;
    return Object.keys(codeChars).find(code=>codeChars[code]===c);
  }
  function renderLesson() {
    if (!session) return;
    const lesson=session.lesson,index=lessons.findIndex(l=>l.id===lesson.id),group=groups.find(g=>g.id===lesson.group);
    $('lesson-badge').textContent=lesson.id==='review'?'专属复习 · 慢慢按准':`第 ${index+1} 关 · ${group.name.split('·')[1].trim()}`;
    $('lesson-title').textContent=lesson.title;
    $('lesson-description').textContent=lesson.tip;
    document.querySelector('.keyboard-footnote').textContent=lesson.numpad?'右手中指找数字 5，食指、无名指回到 4、6。数字 0 用右拇指，空格用任意一只拇指。':'F、J 的小横线，就是手指的“家”。空格用拇指。刚开始可以看键盘，熟悉后再试着少看一点。';
    $('ime-warning').hidden=true;$('caps-warning').hidden=true;
    $('start-button').hidden=false;$('start-button').textContent='开始这关';
    $('pause-button').disabled=true;$('pause-button').textContent='暂停';
    $('input-help').textContent='先点“开始这关”，再按实体键盘。';
    $('coach-title').textContent=lesson.numpad?'数字键也有自己的家':lesson.shift?'让两只手配合起来':'准确，比快更重要';
    $('coach-text').textContent=lesson.numpad?'右中指摸到数字 5 的小凸起，其他手指放在 4 和 6。Num Lock 要打开。':lesson.shift?'按大写字母时，让另一只手的小指帮你按住 Shift。按完就松开。':'按错也没关系，找一找亮着的键，再试一次。花会等你慢慢长大。';
    buildKeyboard();renderTarget();renderStats();setFeedback('慢慢来，按对一个就向前一步。');
  }
  function renderTarget() {
    const char=expected(),task=currentTask();if (!task) return;
    $('target-key').textContent=char===' '?'空格':char;
    $('target-key').classList.toggle('long-key',char===' ');
    const finger=fingers[fingerFor(char)];
    $('target-detail').textContent=session.lesson.numpad&&char==='0'?'右手拇指':finger.name;
    $('word-meaning').textContent=task.meaning || `第 ${session.taskIndex+1} / ${session.tasks.length} 组 · 慢慢按准`;
    $('sequence').innerHTML=[...task.text].map((ch,i)=>`<span class="letter${ch===' '?' is-space':''}${i<session.charIndex?' correct':i===session.charIndex?' current':''}" ${i===session.charIndex?'aria-current="true"':''}>${ch===' '?'␣':escapeHtml(ch)}</span>`).join('');
    const shift=needsShift(char);
    $('finger-hint').textContent=shift ? `用${shiftCode(char)==='ShiftLeft'?'左':'右'}手小指按住 Shift，再用${finger.name}按 ${keyName(physicalChar(char))}。` : char===' ' ? '用任意一只拇指轻轻按空格。' : session.lesson.numpad&&char==='0'?'用右手拇指按数字 0，再回到原位。':`用${finger.name}轻轻按 ${keyName(char)}，再回到原位。`;
    highlightKeyboard();
    effects.setTarget(char,fingerFor(char),!!session.lesson.numpad);
  }
  function setFeedback(message,error=false) { $('feedback').textContent=message;$('feedback').classList.toggle('error',error); }
  function renderStats() {
    if (!session) return;
    const attempts=session.correct+session.wrong;
    $('accuracy-stat').textContent=attempts?`${Math.round(session.correct/attempts*100)}%`:'—';
    $('speed-stat').textContent=session.timeMs>=3000?String(Math.round(session.correct/(session.timeMs/60000))):'—';
    const seconds=Math.floor(session.timeMs/1000);
    $('time-stat').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
    $('combo-stat').textContent=session.combo;
    $('progress-label').textContent=`${session.correct} / ${session.total}`;
    const percent=Math.round(session.correct/session.total*100);
    $('lesson-progress').style.width=percent+'%';document.querySelector('.progress-track').setAttribute('aria-valuenow',percent);
    const size=Math.min(8,session.total-session.awardedCorrect),filled=session.correct-session.awardedCorrect;
    $('mini-goal-label').textContent=session.finished?`本关收集了 ${session.flowersEarned} 朵小红花`:`再按准 ${Math.max(0,size-filled)} 个键，收集一朵小红花`;
    $('mini-goal-dots').innerHTML=Array.from({length:session.finished?8:size},(_,i)=>`<i class="${session.finished||i<filled?'filled':''}"></i>`).join('');
    $('mini-goal-dots').setAttribute('aria-label',session.finished?'小目标已完成':`本次小目标已按准 ${filled} / ${size} 个键`);
  }
  function buildKeyboard() {
    $('keyboard-main').classList.add('laptop-board');$('keyboard-main').innerHTML=window.LaptopLayout.html(false);$('keyboard-numpad').hidden=true;document.querySelector('.keyboard-shell').classList.remove('with-numpad');
    $('finger-legend').innerHTML=Object.entries(fingers).map(([id,f])=>`<span class="finger-item" data-finger="${id}" style="--dot:${f.color}">${f.short}</span>`).join('');
    applyHints();
  }
  function highlightKeyboard() {
    document.querySelectorAll('.current-key,.shift-key,.active-finger').forEach(el=>el.classList.remove('current-key','shift-key','active-finger'));
    if (!data.settings.hints || !expected()) return;
    const char=expected(),code=codeFor(char);
    document.querySelectorAll(`[data-code="${code}"]`).forEach(el=>el.classList.add('current-key'));
    document.querySelector(`[data-finger="${fingerFor(char)}"]`)?.classList.add('active-finger');
    if (needsShift(char)) document.querySelector(`[data-code="${shiftCode(char)}"]`)?.classList.add('shift-key');
  }
  function applyHints() {
    $('hint-button').textContent='练习设置';
    $('practice-view').classList.toggle('reduced-hint',!data.settings.hints);
    $('keyboard-note').textContent=data.settings.hints?'颜色告诉你：该用哪根手指':'提示已关闭 · 试着少看键盘';
    highlightKeyboard();
    if(expected())effects.setTarget(expected(),fingerFor(expected()),!!session.lesson.numpad);
  }
  function start() {
    if (!session || session.finished) return;
    effects.unlock();
    if (!data.guideSeen) { openDialog('guide-dialog');return; }
    session.running=true;session.started=true;session.lastInputAt=Date.now();lastTick=Date.now();
    $('practice-pad').classList.add('is-running');$('start-button').hidden=true;$('pause-button').disabled=false;$('pause-button').textContent='暂停';
    $('input-help').textContent='用实体键盘练习 · 空格 = ␣ · Esc 暂停';
    $('practice-pad').focus({preventScroll:true});
    setFeedback(session.needsFix?'找准亮着的键，再试一次。':'准备好啦，先按屏幕上的这个键。');
    const cue=session.lesson.id==='review'?'review':session.lesson.numpad?'start-numpad':session.lesson.id==='digits'?'start-digits':session.lesson.id==='shift'?'start-shift':session.lesson.id==='punctuation'?'start-symbols':session.lesson.group==='pinyin'?'start-pinyin':session.lesson.group==='upper'?'start-upper':session.lesson.group==='lower'?'start-lower':'start-home';
    void effects.speak(cue);
  }
  function pause(announce=true) {
    if (!session?.running) return;
    accountTime();session.running=false;
    $('practice-pad').classList.remove('is-running');document.querySelectorAll('.pressed-key,.error-key').forEach(el=>el.classList.remove('pressed-key','error-key'));$('start-button').hidden=false;$('start-button').textContent='继续练习';$('pause-button').disabled=true;
    $('input-help').textContent='已经暂停，练习时间也停下了。';
    if (announce) {setFeedback('不着急，点“继续练习”就能接着来。');void effects.speak('pause');}
    save();
  }
  function accountTime() {
    const now=Date.now(),delta=Math.min(Math.max(0,now-lastTick),1500);lastTick=now;
    if (session?.running) { session.timeMs+=delta;dayData().timeMs+=delta;restElapsed+=delta; }
  }
  function closeDialogs() { document.querySelectorAll('dialog[open]').forEach(d=>d.close()); }
  function openDialog(id) { pause(false); const dialog=$(id);if (!dialog.open) dialog.showModal();if(id==='guide-dialog')void effects.speak('guide');if(id==='numpad-dialog')void effects.speak('start-numpad');if(id==='rest-dialog')void effects.speak('break'); }
  function collectFlower() {
    if(!session||session.correct<=session.awardedCorrect)return;
    session.awardedCorrect=session.correct;session.flowersEarned++;data.flowers++;dayData().flowers++;
    data.flowerEvents.push({id:Date.now()+'-'+data.flowers,lessonId:session.lesson.id,date:today(),stage:session.flowersEarned,correct:session.correct,legacy:false});
    if(data.flowerEvents.length>4000)data.flowerEvents.shift();
    save();updateDaily();renderPocket();effects.collectAnimation();
  }
  function onKey(event) {
    if (!session?.running || currentView!=='practice' || document.querySelector('dialog[open]') || !$('practice-pad').contains(event.target)) return;
    if (event.ctrlKey||event.metaKey||event.altKey) return;
    if (event.key==='Escape') {event.preventDefault();effects.clickSound();pause();return;}
    if (event.key==='Tab') return;
    if (event.key==='Shift') {document.querySelector(`[data-code="${event.code}"]`)?.classList.add('pressed-key');effects.clickSound();effects.pronounce('Shift');effects.pressFinger(event.code==='ShiftLeft'?'LP':'RP','Shift');return;}
    if (event.key==='CapsLock'){effects.clickSound();effects.pronounce('CapsLock');effects.pressFinger('LP','Caps Lock');}
    if (event.getModifierState?.('CapsLock')) { $('caps-warning').hidden=false;setFeedback('请先关掉 Caps Lock，用 Shift 练习大写字母。');void effects.speak('capslock',{throttle:10000});return; }
    $('caps-warning').hidden=true;
    if (event.key==='CapsLock') return;
    if (event.isComposing || ['Process','Unidentified','Dead'].includes(event.key) || event.keyCode===229) { $('ime-warning').hidden=false;setFeedback('切到英文输入后，再来试一次。');void effects.speak('ime',{throttle:12000});return; }
    if (event.repeat) {event.preventDefault();setFeedback('每次轻按一下，松开后再按下一个。');void effects.speak('repeat',{throttle:10000});return;}
    if (event.key==='Backspace') {event.preventDefault();effects.clickSound();effects.pronounce('Backspace');effects.pressFinger('RP','退格');setFeedback('按错的键没有写进去，不用删除。直接按正确的键就好。');void effects.speak('backspace',{throttle:10000});return;}
    if (session.lesson.numpad && /^Numpad\d$/.test(event.code) && event.key.length!==1) {setFeedback('请先按 Num Lock 打开右侧数字键，再试一次。',true);void effects.speak('numlock',{throttle:8000});return;}
    if(['NumLock','Enter'].includes(event.key)){effects.clickSound();effects.pronounce(event.key);effects.pressFinger(event.key==='NumLock'?'RI':'RP',event.key);return;}
    if (event.key.length!==1) return;
    event.preventDefault();session.lastInputAt=Date.now();accountTime();
    const keypadFinger={NumpadDivide:'RM',NumpadMultiply:'RR',NumpadSubtract:'RP',NumpadAdd:'RP',NumpadDecimal:'RR'}[event.code];
    effects.clickSound();effects.pronounce(event.key);effects.pressFinger(keypadFinger||fingerFor(event.key,event.code.startsWith('Numpad')),event.key,event.code.startsWith('Numpad'));effects.rabbitTap();
    if (session.lesson.numpad && /^\d$/.test(event.key) && !event.code.startsWith('Numpad')) {setFeedback('这一关请用照片右侧的数字小键盘。',true);void effects.speak('top-row',{throttle:8000});return;}
    $('ime-warning').hidden=true;
    const char=expected(),keyEl=document.querySelector(`[data-code="${event.code}"]`);
    keyEl?.classList.add('pressed-key');
    const stat=data.keyStats[char] || (data.keyStats[char]={attempts:0,wrong:0});stat.attempts++;
    if (event.key===char) {
      window.GardenPlus?.correct(event.key,event.code);session.correct++;session.combo++;session.bestCombo=Math.max(session.bestCombo,session.combo);session.charIndex++;session.needsFix=false;
      if(session.correct%8===0)collectFlower();
      if (session.charIndex>=currentTask().text.length) {session.taskIndex++;session.charIndex=0;}
      if (session.taskIndex>=session.tasks.length) {finish();return;}
      renderTarget();renderStats();
      setFeedback(session.combo%8===0?`已经连续按对 ${session.combo} 个啦，真认真！`:'按对啦，继续下一步。');
    } else {
      session.wrong++;session.combo=0;session.needsFix=true;stat.wrong++;session.errors[char]=(session.errors[char]||0)+1;
      document.querySelector('.letter.current')?.classList.add('wrong');keyEl?.classList.add('error-key');renderStats();
      setFeedback(needsShift(char)&&event.key===physicalChar(char)?`这个是大写或符号，要按住另一只手的 Shift。再试一次。`:event.shiftKey&&!needsShift(char)?'先松开 Shift，再直接按这个键。':`这次按了 ${keyName(event.key)}。找一找 ${keyName(char)}，再试一次就好。`,true);
      if(Date.now()-lastMistakeVoice>=4500){lastMistakeVoice=Date.now();void effects.speak(needsShift(char)&&event.key===physicalChar(char)?'shift-help':event.shiftKey&&!needsShift(char)?'release-shift':'mistake-'+((session.wrong-1)%3+1));}
    }
  }
  function finish() {
    accountTime();session.running=false;session.finished=true;$('practice-pad').classList.remove('is-running');
    const accuracy=Math.round(session.correct/(session.correct+session.wrong)*100),stars=accuracy>=95?3:accuracy>=85?2:1,speed=Math.round(session.correct/(Math.max(1000,session.timeMs)/60000));
    if(session.correct>session.awardedCorrect)collectFlower();
    const record={lessonId:session.lesson.id,date:today(),accuracy,correct:session.correct,wrong:session.wrong,timeMs:Math.round(session.timeMs),speed,stars,flowers:session.flowersEarned};
    data.sessions.push(record);if (data.sessions.length>500) data.sessions.shift();
    if (session.lesson.id!=='review') {
      const previous=data.completions[session.lesson.id]||{stars:0,bestAccuracy:0,count:0};
      data.completions[session.lesson.id]={stars:Math.max(previous.stars,stars),bestAccuracy:Math.max(previous.bestAccuracy,accuracy),count:previous.count+1,date:today()};
      const nextIndex=lessons.findIndex(l=>l.id===session.lesson.id)+1;if (nextIndex<lessons.length&&unlocked(nextIndex)) data.lastLesson=lessons[nextIndex].id;
    }
    save();window.GardenPlus?.renderProgress();renderStats();updateDaily();renderMap();renderGarden();
    $('target-key').textContent='✓';$('target-detail').textContent='完成啦';$('finger-hint').textContent='这份认真，变成了小红花。';setFeedback('你的小红花，都收入小口袋啦！');
    $('start-button').hidden=false;$('start-button').textContent='再练一次';$('pause-button').disabled=true;$('input-help').textContent='完成啦，可以看看花园或继续闯关。';
    $('result-flower').innerHTML=effects.redFlower('red-flower result-red-flower');
    $('result-title').textContent='小红花，为你绽放！';
    $('result-message').textContent=`你完成了“${session.lesson.title}”，按准 ${session.correct} 个键，收集了 ${session.flowersEarned} 朵小红花！`;
    $('result-stars').innerHTML=[1,2,3].map(n=>starSvg(n<=stars)).join('');$('result-stars').setAttribute('aria-label',`获得 ${stars} 颗星，满分 3 颗星`);
    $('result-stats').innerHTML=`<div><strong>${accuracy}%</strong><span>准确率</span></div><div><strong>${session.correct}</strong><span>正确按键</span></div><div><strong>${Math.max(1,Math.round(session.timeMs/1000))} 秒</strong><span>认真练习</span></div>`;
    const weak=Object.entries(session.errors).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([c])=>keyName(c));
    $('result-advice').textContent=accuracy<85?`已经坚持完成啦。${weak.length?'下次多找一找 '+weak.join('、')+'。':''}建议先再练一次，把准确率提高到 85% 以上。`:accuracy<95?'已经很稳啦！再慢一点点，试试让更多按键一次就对。':'准确率很棒！下一关继续保持放松，按完回到手指的家。';
    const index=lessons.findIndex(l=>l.id===session.lesson.id);
    $('next-button').textContent=session.lesson.id==='review'?'继续闯关':index===lessons.length-1?'去我的花园':'下一关';
    lastResult={lesson:session.lesson,index,record};
    const finishedSession=session;
    pendingResultTimer=setTimeout(()=>{if(session===finishedSession&&currentView==='practice'){openDialog('result-dialog');window.GardenPlus?.completed(lastResult);void effects.speak(accuracy>=95?'complete-high':accuracy>=85?'complete-steady':'complete-kind');}},data.settings.animations&&!matchMedia('(prefers-reduced-motion: reduce)').matches?1750:0);
  }
  function updateDaily() {
    const daily=dayData();$('daily-minutes').textContent=(daily.timeMs/60000).toFixed(1).replace(/\.0$/,'');$('daily-goal').textContent=data.settings.goal;
    $('daily-progress').style.width=Math.min(100,daily.timeMs/(data.settings.goal*60000)*100)+'%';$('daily-flowers').textContent=daily.flowers+' 朵';
    $('daily-message').textContent=daily.timeMs>=data.settings.goal*60000?'今天的小目标达成啦，记得休息一下。':daily.timeMs>0?'每一小步，都算数。':'先坐好，再慢慢按准。';
    $('flower-count').textContent=data.flowers;
    renderPocket();
    const weak=weakKeys();$('review-note').textContent=weak.length?'这次练：'+weak.slice(0,4).map(keyName).join('、'):'还没有难住你的键，先练一关吧';
  }
  function weakKeys() { return Object.entries(data.keyStats).filter(([,s])=>s.wrong>0).sort((a,b)=>(b[1].wrong/(b[1].attempts+2))-(a[1].wrong/(a[1].attempts+2))||b[1].wrong-a[1].wrong).map(([char])=>char).slice(0,6); }
  function renderPocket(){
    $('pocket-count').textContent=data.flowers+' 朵';
    $('pocket-flowers').innerHTML=data.flowerEvents.length?data.flowerEvents.slice(-12).map((event,index)=>effects.redFlower('red-flower pocket-red-flower',`第 ${Math.max(1,data.flowers-Math.min(12,data.flowerEvents.length)+index+1)} 朵小红花`)).join(''):'<span class="pocket-empty">第一朵小红花，正在等你。</span>';
  }
  function startReview() {
    const weak=weakKeys();
    if (!weak.length) {toast('先完成一关，按错过的键会变成专属小练习。');return;}
    const tasks=[];for (let i=0;i<4;i++) tasks.push({text:Array.from({length:9},(_,j)=>weak[(i+j)%weak.length]).join(''),meaning:'这些键以前有点难，今天再认识一次'});
    const lesson={id:'review',group:'home',title:'容易按错的键，再练练',tip:'这次只练你容易按错的键。慢慢找到它，用提示的手指轻轻按。',words:tasks,spaces:true,shift:weak.some(needsShift)};
    beginLesson(lesson,true);
  }
  function renderMap() {
    const recommendation=recommended();
    $('lesson-map').innerHTML=groups.map(group=>`<section class="lesson-group"><div class="group-header"><h2>${group.name}</h2><p>${group.description}</p></div><div class="lesson-grid">${lessons.filter(l=>l.group===group.id).map(lesson=>{
      const i=lessons.indexOf(lesson),complete=data.completions[lesson.id],available=unlocked(i),next=lesson.id===recommendation.id;
      const keyText=lesson.keys===' '?'拼音 + 空格':lesson.keys==='Shift'?'Shift + 字母':lesson.keys.length>12?'A – Z':lesson.keys.toUpperCase();
      return `<button class="lesson-tile${!available?' locked':''}${next?' recommended':''}" data-lesson="${lesson.id}" ${!available?'disabled':''} aria-label="第 ${i+1} 关 ${lesson.title}，${complete?'已完成 '+complete.stars+' 颗星':available?'可以开始':'完成前一关后解锁'}"><span class="tile-meta">第 ${i+1} 关 ${complete?starsHtml(complete.stars):!available?lockSvg:''}</span><span class="tile-keys">${escapeHtml(keyText)}</span><h3>${lesson.title}</h3><span class="tile-status">${complete?'已完成 · 可以再练':next?'现在就从这里开始':available?'可以练习':'完成前一关后解锁'}</span></button>`;
    }).join('')}</div></section>`).join('');
    $('lesson-map').querySelectorAll('[data-lesson]').forEach(button=>button.addEventListener('click',()=>{const lesson=lessons.find(l=>l.id===button.dataset.lesson);if (unlocked(lessons.indexOf(lesson)))beginLesson(lesson,true);}));
  }
  function renderGarden() {
    const complete=Object.keys(data.completions).length,totalTime=Object.values(data.daily).reduce((sum,d)=>sum+d.timeMs,0),practicedDays=Object.values(data.daily).filter(d=>d.timeMs>0).length;
    $('garden-summary').innerHTML=`<div><strong>${data.flowers}</strong><span>朵认真收集的小红花</span></div><div><strong>${complete} / ${lessons.length}</strong><span>关已经学过</span></div><div><strong>${Math.round(totalTime/60000)}</strong><span>分钟的认真</span></div><div><strong>${practicedDays}</strong><span>天来照顾花园</span></div>`;
    const visible=data.sessions.slice(-24).reverse(),flowers=data.flowerEvents.slice(-flowerVisibleCount).reverse();
    $('garden-description').textContent=data.flowers?`已经收集 ${data.flowers} 朵小红花！每一朵都算数，按准 8 个键就能再获得一朵。`:'每按准 8 个键，就收集一朵小红花。小目标的进步也会保存。';
    $('flower-bed').innerHTML=flowers.length?flowers.map((event,index)=>`<div class="flower-tile red-flower-tile">${effects.redFlower('red-flower collected-red-flower')}<span class="flower-order">第 ${Math.max(1,data.flowers-index)} 朵</span><strong>${escapeHtml(lessons.find(l=>l.id===event.lessonId)?.title|| (event.lessonId==='review'?'专属复习':'之前的练习'))}</strong><small>${event.legacy?'原有奖励':event.date.slice(5)+' · 小目标 '+event.stage}</small></div>`).join(''):'<div class="garden-empty"><h2>第一朵小红花，正在等你。</h2><p>从 F 和 J 开始，按准 8 个键就能收集到它。</p><button class="primary-button" id="first-flower-button">去收集第一朵小红花</button></div>';
    $('more-flowers-button').hidden=flowers.length>=data.flowerEvents.length;
    $('first-flower-button')?.addEventListener('click',()=>beginLesson(recommended(),true));
    $('history-list').innerHTML=visible.length?visible.slice(0,8).map(s=>`<div class="history-row"><div><strong>${escapeHtml(lessons.find(l=>l.id===s.lessonId)?.title||'专属复习')}</strong><small>${s.date} · ${Math.max(1,Math.round(s.timeMs/1000))} 秒</small></div><div class="history-numbers"><span>${s.accuracy}% 准确率</span><span>${s.correct} 个键</span>${starsHtml(s.stars)}</div></div>`).join(''):'<p class="empty-history">还没有练习记录。完成第一关后，这里就会记住你的进步。</p>';
  }
  function showView(view,scroll=true) {
    if (!['practice','map','garden','settings','teaching','exam','game','growth','spelling'].includes(view)) return;
    if(view!=='practice')clearTimeout(pendingResultTimer);
    if (view!=='practice') pause(false);
    window.dispatchEvent(new CustomEvent('garden-view',{detail:view}));currentView=view;document.querySelectorAll('.page-view').forEach(el=>el.hidden=el.id!==view+'-view');
    document.querySelectorAll('.nav-button').forEach(button=>{const active=button.dataset.view===view;button.classList.toggle('active',active);if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
    if (view==='map') renderMap();if(view==='garden')renderGarden();
    if (view==='settings') applySettings();
    if (scroll) {window.scrollTo({top:0,behavior:'instant'});$('main').focus({preventScroll:true});}
  }
  function parentReport() {
    const weak=weakKeys(),completed=Object.keys(data.completions).length,last=data.sessions.at(-1),mastered=Object.values(data.completions).filter(c=>c.stars>=2).length;
    $('parent-report').innerHTML=`<strong>已经学过 ${completed} / ${lessons.length} 关，其中 ${mastered} 关准确率达 85%。</strong><br>${last?`最近一关：${escapeHtml(lessons.find(l=>l.id===last.lessonId)?.title||'专属复习')}，准确率 ${last.accuracy}%。`:'她还没有完成练习，从第 1 关开始就好。'}<br>${weak.length?'建议多练的键：'+weak.map(keyName).map(escapeHtml).join('、')+'。':'先关注坐姿和手指分工，熟悉后再尝试关闭提示。'}<br>星星只看准确率：完成得 1 星，85% 得 2 星，95% 得 3 星。`;
    $('goal-select').value=data.settings.goal;$('break-checkbox').checked=data.settings.breakReminder;$('numpad-checkbox').checked=data.settings.numpad;updateStorageStatus();
  }
  function toast(message) { clearTimeout(toastTimeout);$('toast').textContent=message;$('toast').hidden=false;toastTimeout=setTimeout(()=>$('toast').hidden=true,4200); }
  function restoreBackup(file) {
    if (!file) return;
    if(file.size>2e6){toast('这份文件太大了，请选择小花园导出的记录。');return;}
    file.text().then(text=>{
      const restored=sanitize(JSON.parse(text));
      if (!confirm(`备份里有 ${restored.flowers} 朵花和 ${Object.keys(restored.completions).length} 关记录。恢复会替换当前记录，确定恢复吗？`)) return;
      pause(false);data=restored;restElapsed=0;save({replace:true});closeDialogs();beginLesson(chooseSavedLesson());applySettings();renderMap();renderGarden();toast('记录恢复啦，可以接着练习。');
    }).catch(()=>toast('这份记录无法读取，请选择小花园导出的 JSON 文件。')).finally(()=>$('import-input').value='');
  }
  const settingCheckboxes={'key-pronunciation-checkbox':'keyPronunciation','voice-prompts-checkbox':'voicePrompts','typing-sound-checkbox':'typingSound','hands-checkbox':'hands','hints-checkbox':'hints','animations-checkbox':'animations','rabbit-checkbox':'rabbitAnimation','numpad-checkbox':'numpad','break-checkbox':'breakReminder'};
  function applySettings() {
    for(const [id,key] of Object.entries(settingCheckboxes))$(id).checked=data.settings[key];
    document.querySelectorAll('input[name="letter-mode"]').forEach(input=>input.checked=input.value===data.settings.letterMode);
    $('volume-range').value=data.settings.volume;$('volume-value').textContent=data.settings.volume+'%';$('goal-select').value=data.settings.goal;
    $('mode-shortcut').textContent=data.settings.letterMode==='english'?'英文模式':'拼音模式';
    effects.syncSettings();window.GardenPlus?.syncSettings();applyHints();updateDaily();
  }

  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>showView(button.dataset.view)));
  document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();showView('practice');});
  $('start-button').addEventListener('click',()=>session?.finished?beginLesson(session.lesson,true):start());
  $('pause-button').addEventListener('click',()=>pause());
  $('practice-pad').addEventListener('keydown',onKey);
  $('practice-pad').addEventListener('keyup',event=>document.querySelectorAll(`[data-code="${event.code}"]`).forEach(el=>el.classList.remove('pressed-key','error-key')));
  $('practice-pad').addEventListener('compositionstart',()=>{if(session?.running)$('ime-warning').hidden=false;});
  $('practice-pad').addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;if(!session?.running && session?.started && !session.finished)start();else $('practice-pad').focus({preventScroll:true});});
  $('practice-pad').addEventListener('focusout',()=>queueMicrotask(()=>{if(session?.running&&!$('practice-pad').contains(document.activeElement))pause();}));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pause(false);effects.stopAudio();}});window.addEventListener('blur',()=>{pause(false);effects.stopAudio();});window.addEventListener('pagehide',()=>{pause(false);effects.stopAudio();save();});
  $('hint-button').addEventListener('click',()=>showView('settings'));
  $('guide-button').addEventListener('click',()=>{effects.unlock();openDialog('guide-dialog');});
  $('guide-done-button').addEventListener('click',()=>{data.guideSeen=true;save();$('guide-dialog').close();start();});
  $('parent-button').addEventListener('click',()=>{parentReport();openDialog('parent-dialog');});
  $('parent-settings-button').addEventListener('click',()=>{closeDialogs();showView('settings');});
  $('continue-button').addEventListener('click',()=>beginLesson(recommended(),true));
  $('review-button').addEventListener('click',startReview);
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.close).close()));
  $('retry-button').addEventListener('click',()=>beginLesson(lastResult.lesson,true));
  $('next-button').addEventListener('click',()=>{const {lesson,index}=lastResult;closeDialogs();if(lesson.id==='review')beginLesson(recommended(),true);else if(index<lessons.length-1)beginLesson(lessons[index+1],true);else showView('garden');});
  $('result-garden-button').addEventListener('click',()=>{closeDialogs();showView('garden');});
  $('rest-stop-button').addEventListener('click',()=>{closeDialogs();showView('garden');toast('今天的认真已经记住啦，明天再来种花。');});
  $('rest-continue-button').addEventListener('click',()=>{restElapsed=0;closeDialogs();start();});
  $('goal-select').addEventListener('change',event=>{data.settings.goal=Number(event.target.value);save();updateDaily();});
  for(const [id,key] of Object.entries(settingCheckboxes))$(id).addEventListener('change',event=>{data.settings[key]=event.target.checked;save();applySettings();if(key==='numpad'){buildKeyboard();renderTarget();}});
  document.querySelectorAll('input[name="letter-mode"]').forEach(input=>input.addEventListener('change',()=>{if(input.checked){data.settings.letterMode=input.value;save();applySettings();}}));
  $('volume-range').addEventListener('input',event=>{data.settings.volume=Number(event.target.value);save();applySettings();});
  for(const id of ['numpad-guide-button','settings-numpad-guide-button'])$(id).addEventListener('click',()=>{effects.unlock();openDialog('numpad-dialog');});
  $('numpad-done-button').addEventListener('click',()=>{$('numpad-dialog').close();if(currentView==='practice'&&session?.started&&!session.finished)start();});
  $('more-flowers-button').addEventListener('click',()=>{flowerVisibleCount+=24;renderGarden();});
  $('export-button').addEventListener('click',()=>{save();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`立夏的打字花园-记录-${today()}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('练习记录已下载，请保存好这份备份。');});
  $('import-input').addEventListener('change',event=>restoreBackup(event.target.files[0]));
  $('reset-button').addEventListener('click',()=>{if(!confirm('清空后，所有花朵、关卡和练习记录都会删除，无法撤销。建议先备份。确定清空吗？'))return;pause(false);data=defaults();restElapsed=0;save({replace:true});closeDialogs();beginLesson(lessons[0]);applySettings();renderMap();renderGarden();toast('已清空记录，从第一颗小种子重新开始。');});
  $('home-fingers').innerHTML=['LP','LR','LM','LI','RI','RM','RR','RP'].map(id=>{const f=fingers[id];return `<div class="home-finger"><strong ${['LI','RI'].includes(id)?'class="anchor"':''} style="--key-bg:${id.includes('I')?'#d8ebcc':'#f0f4e7'}">${escapeHtml(f.home.toUpperCase())}</strong><span>${f.short}</span></div>`;}).join('');
  effects.init({settings:()=>data.settings});
  setInterval(()=>{
    if (!session?.running) {lastTick=Date.now();return;}
    if (Date.now()-session.lastInputAt>15000) {pause(false);setFeedback('先歇一歇，点“继续练习”就能接着来。');void effects.speak('idle');return;}
    accountTime();renderStats();updateDaily();if(++saveTicks%5===0)save();
    if (data.settings.breakReminder&&restElapsed>=data.settings.goal*60000) {$('rest-minutes').textContent=data.settings.goal;restElapsed=0;openDialog('rest-dialog');}
  },500);
  window.GardenApp={acceptCloudData(raw){data=sanitize(raw);save();updateDaily();renderMap();renderGarden();window.GardenPlus?.renderGrowth();},get data(){return data;},save,showView,pause,toast,get currentView(){return currentView;},get session(){return session;},beginLesson,lessons,fingerFor,codeFor,physicalChar};
  beginLesson(chooseSavedLesson());applySettings();renderMap();renderGarden();updateStorageStatus();
  if (!storageHealthy)toast('进度暂时无法保存，请在家长小窗备份记录。');
})();
