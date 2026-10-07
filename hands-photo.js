(() => {
 const host=document.getElementById('hand-visual');host.innerHTML='<div class="photo-hands" role="img" aria-label="写实双手分帧打字示范"><span class="photo-finger-light"></span></div>';
 const el=host.firstElementChild,frame={LP:1,LR:2,LM:3,LI:4,RI:5,RM:6,RR:7,RP:8,THL:9,THR:10},pos={LP:[18,49],LR:[25,42],LM:[33,39],LI:[40,39],RI:[60,39],RM:[67,39],RR:[75,42],RP:[82,49],THL:[43,61],THR:[57,61]};let timer;
 function show(n){el.style.backgroundPosition=(n%4/3*100)+'% '+(Math.floor(n/4)/2*100)+'%';el.dataset.frame=n;}
 window.RealHands={setTarget(id){const p=pos[id];el.classList.toggle('has-target',!!p);if(p){el.style.setProperty('--fx',p[0]+'%');el.style.setProperty('--fy',p[1]+'%');}},press(id){clearTimeout(timer);show(frame[id]||0);el.classList.add('photo-press');timer=setTimeout(()=>{show(0);el.classList.remove('photo-press');},220);},kind:'photographic-atlas'};
 show(0);window.dispatchEvent(new Event('hands-ready'));
})();
