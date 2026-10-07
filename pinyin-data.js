(() => {
  // Complete syllables checked against the Yabla initial/final chart.
  const words={ba:'八拔把爸',bo:'波博跛播',bao:'包雹宝抱',bai:'掰白百败',ma:'妈麻马骂',mi:'眯迷米密',fei:'飞肥匪费',fan:'帆凡反饭',di:'低笛底地',ti:'踢题体替',ni:'妮泥你逆',liu:'溜留柳六',ge:'哥格舸个',ke:'科咳可课',hu:'呼湖虎户',ji:'鸡急几寄',qi:'七奇起气',xi:'西习洗戏',zao:'遭凿早造',cao:'操曹草糙',sui:'虽随髓岁',rang:'嚷瓤嚷让',wa:'蛙娃瓦袜',yi:'衣姨椅意',lü:'吕吕吕吕',pao:'抛刨跑泡',jia:'家夹甲架',qu:'区渠取去',xu:'虚徐许续',gong:'工龚拱共',kou:'抠口口扣',zhang:'张长掌账',chang:'昌长厂唱',sheng:'生绳省圣',reng:'扔仍扔仍',nü:'女女女女',po:'坡婆叵破',ta:'他塔塔踏',da:'搭答打大',wei:'威围尾卫',ya:'鸭牙哑亚'};
  // Read the marked syllable itself. Characters are a guide, never a substitute for tone.
  const toneVowels={a:'āáǎà',o:'ōóǒò',e:'ēéěè',i:'īíǐì',u:'ūúǔù',ü:'ǖǘǚǜ'};
  function marked(base,tone){let i=base.indexOf('a');if(i<0)i=base.indexOf('e');if(i<0&&base.includes('ou'))i=base.indexOf('o');if(i<0)for(let n=base.length-1;n>=0;n--)if(toneVowels[base[n]]){i=n;break;}return [...base].map((c,n)=>({raw:c,text:n===i?toneVowels[c][tone-1]:c}));}
  const ipa={ba:'pa',bo:'pwɔ',bao:'pɑʊ',bai:'paɪ',ma:'ma',mi:'mi',fei:'feɪ',fan:'fan',di:'ti',ti:'tʰi',ni:'ni',liu:'ljoʊ',ge:'kɤ',ke:'kʰɤ',hu:'xu',ji:'tɕi',qi:'tɕʰi',xi:'ɕi',zao:'tsɑʊ',cao:'tsʰɑʊ',sui:'sweɪ',rang:'ʐɑŋ',wa:'wa',yi:'i',lü:'ly',pao:'pʰɑʊ',jia:'tɕja',qu:'tɕʰy',xu:'ɕy',gong:'kʊŋ',kou:'kʰoʊ',zhang:'tʂɑŋ',chang:'tʂʰɑŋ',sheng:'ʂəŋ',reng:'ʐəŋ',nü:'ny',po:'pʰwɔ',ta:'tʰa',da:'ta',wei:'weɪ',ya:'ja'};
  const contours=['','˥˥','˧˥','˨˩˦','˥˩'];
  const bank=Object.keys(words).flatMap(base=>[1,2,3,4].map(tone=>({id:base.replace('ü','v')+'-'+tone,base,tone,ipa:ipa[base]+contours[tone],parts:marked(base,tone),display:marked(base,tone).map(x=>x.text).join(''),example:words[base][tone-1]||words[base][0]})));
  const names=['','一声 · 平平的','二声 · 向上扬','三声 · 先降再升','四声 · 向下落'];
  function choose(letter){const needle=letter==='v'?'ü':letter;const list=bank.filter(s=>s.base.includes(needle));return list[Math.floor(Math.random()*list.length)]||null;}
  window.PinyinBank={bank,choose,marked,names,source:'https://chinese.yabla.com/chinese-pinyin-chart.php'};
  if(typeof module!=='undefined')module.exports=window.PinyinBank;
})();
