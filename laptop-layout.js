(() => {
 const keys=[];const add=(code,label,x,y,w=1,h=1,upper='',char='')=>keys.push({code,label,x,y,w,h,upper,char});
 ['Esc',...Array.from({length:11},(_,i)=>'F'+(i+1)),'Insert','Home','End','Delete'].forEach((label,i)=>add(i===0?'Escape':i===12?'Insert':label,i===12?'Insert':label,i*15/16,0,15/16,1,i===0?'Fn Lock':i===12?'F12':''));
 [['LaunchApp2','计算器'],['NumpadParenLeft','('],['NumpadParenRight',')'],['NumpadBackspace','bkspc']].forEach(([c,l],i)=>add(c,l,15.4+i,0));
 function row(y,list){let x=0;for(const [code,label,w=1,upper='',char='']of list){add(code,label,x,y,w,1,upper,char);x+=w;}}
 row(1,[['Backquote','`',1,'~','`'],...[...'1234567890'].map((c,i)=>['Digit'+c,c,1,'!@#$%^&*()'[i],c]),['Minus','-',1,'_','-'],['Equal','=',1,'+','='],['Backspace','backspace',2]]);
 row(2,[['Tab','tab',1.4],...[...'qwertyuiop'].map(c=>['Key'+c.toUpperCase(),c.toUpperCase(),1,'',c]),['BracketLeft','[',1,'{','['],['BracketRight',']',1,'}',']'],['Backslash','\\',1.6,'|','\\']]);
 row(3,[['CapsLock','caps lock',1.8],...[...'asdfghjkl'].map(c=>['Key'+c.toUpperCase(),c.toUpperCase(),1,'',c]),['Semicolon',';',1,':',';'],['Quote',"'",1,'"',"'"],['Enter','enter',2.2]]);
 row(4,[['ShiftLeft','shift',2.2],...[...'zxcvbnm'].map(c=>['Key'+c.toUpperCase(),c.toUpperCase(),1,'',c]),['Comma',',',1,'<',','],['Period','.',1,'>','.'],['Slash','/',1,'?','/'],['ShiftRight','shift',2.8]]);
 row(5,[['ControlLeft','ctrl',1.2],['Fn','fn'],['MetaLeft','Win'],['AltLeft','alt'],['Space','空格',5.1,'',' '],['AltRight','alt'],['ContextMenu','AI']]);
 [['PageUp','pg up'],['ArrowUp','↑'],['PageDown','pg dn']].forEach(([c,l],i)=>add(c,l,11.3+i*3.7/3,5,3.7/3,.46));
 [['ArrowLeft','←'],['ArrowDown','↓'],['ArrowRight','→']].forEach(([c,l],i)=>add(c,l,11.3+i*3.7/3,5.52,3.7/3,.48));
 [['NumLock','num lock'],['NumpadDivide','/'],['NumpadMultiply','*'],['NumpadSubtract','−']].forEach(([c,l],i)=>add(c,l,15.4+i,1));
 [7,8,9,4,5,6,1,2,3].forEach((n,i)=>add('Numpad'+n,String(n),15.4+i%3,2+Math.floor(i/3),1,1,{7:'home',8:'↑',9:'pg up',4:'←',5:'',6:'→',1:'end',2:'↓',3:'pg dn'}[n],String(n)));
 add('NumpadAdd','+',18.4,2,1,2);add('NumpadEnter','enter',18.4,4,1,2);add('Numpad0','0',15.4,5,2,1,'insert','0');add('NumpadDecimal','.',17.4,5,1,1,'delete','.');
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function html(teaching=false){return keys.map(k=>{const finger=k.char?window.GardenApp?.fingerFor(k.char,k.code.startsWith('Numpad')):null;const tone={LP:'#f6e8dc',LR:'#f0e8cc',LM:'#e1eef6',LI:'#e8f0d5',RI:'#d8eeeb',RM:'#e1eef6',RR:'#f0e8cc',RP:'#f6e8dc',TH:'#e8efdf'}[finger]||'#f0f4e9';return `<${teaching?'button':'span'} class="${teaching?'teach-key':'key'} laptop-key ${k.char?'':'utility'} ${['KeyF','KeyJ','Numpad5'].includes(k.code)?'home-key anchor-key':''}" ${teaching?'data-teach':'data-code'}="${k.code}" style="--keytone:${tone};--kx:${k.x/19.4*100};--ky:${k.y/6*100};--kw:${k.w/19.4*100};--kh:${k.h/6*100}" ${teaching?`aria-label="${escape(k.label)}，点击听讲解"`:''}>${k.upper?`<small>${escape(k.upper)}</small>`:''}<span>${escape(k.label)}</span></${teaching?'button':'span'}>`;}).join('');}
 window.LaptopLayout={keys,html};
})();
