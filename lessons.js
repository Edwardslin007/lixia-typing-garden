'use strict';
window.TYPING_GROUPS = [
  {id: 'home', name: '第一站 · 给手指找个家', description: '先认识中间一排，再让手指轻轻回家。', color: 'green'},
  {id: 'upper', name: '第二站 · 向上探探头', description: '手指向上走一步，按完记得回家。', color: 'blue'},
  {id: 'lower', name: '第三站 · 向下走走看', description: '慢慢认识下面一排，集齐 26 个字母。', color: 'orange'},
  {id: 'pinyin', name: '第四站 · 拼音小花园', description: '用你会的拼音，练熟字母和空格。', color: 'green'},
  {id: 'extra', name: '第五站 · 更多小本领', description: '数字、大小写和标点，也来认识一下。', color: 'blue'}
];
window.TYPING_LESSONS = [
  {id: 'fj', group: 'home', title: '找到 F 和 J', keys: 'fj', text: 'fjfj ffjj jfjf jjff fjjf jffj', tip: '摸一摸 F 和 J 的小凸起。左食指放 F，右食指放 J。', meaning: '先认识两个有小凸起的键'},
  {id: 'dk', group: 'home', title: '中指也有家', keys: 'dk', text: 'dkdk ddkk kdkd dkfk jdjk fdkj', tip: '左中指放 D，右中指放 K；食指还在 F 和 J。'},
  {id: 'sl', group: 'home', title: '无名指来报到', keys: 'sl', text: 'slsl ssll lsls sdlf jklf slkd', tip: '左无名指放 S，右无名指放 L。试着只移动要按键的那根手指。'},
  {id: 'a-semicolon', group: 'home', title: '小指找到了家', keys: 'a;', text: 'a;a; aa;; ;a;a asdf jkl; a;fj', tip: '左小指放 A，右小指放分号 ;。不用按 Shift。'},
  {id: 'home-row', group: 'home', title: '八根手指排排坐', keys: 'asdfjkl;', text: 'asdf jkl; fdsa ;lkj afsj dkl; fjdk sl;a', tip: '把八根手指摆在 ASDF 和 JKL;。按完一个键，就回到自己的家。'},
  {id: 'gh', group: 'home', title: '食指走一步', keys: 'gh', text: 'fgf jhj ghgh gfg hjh fghj jhgf', tip: '左食指从 F 去 G，右食指从 J 去 H，按完就回来。'},
  {id: 'ru', group: 'upper', title: '食指向上看', keys: 'ru', text: 'frf juj ruru fur jru rfju urfj', tip: '左食指按 R，右食指按 U。往上伸一伸，再回 F、J。'},
  {id: 'ty', group: 'upper', title: '再探远一点', keys: 'ty', text: 'ftf jyj tyty try fury yurt tuft', tip: 'T 归左食指，Y 归右食指。手不要整只搬走。'},
  {id: 'ei', group: 'upper', title: '中指上楼啦', keys: 'ei', text: 'ded kik eiei ride fire like deer', tip: '左中指从 D 去 E，右中指从 K 去 I，按完回家。'},
  {id: 'wo', group: 'upper', title: '无名指上楼啦', keys: 'wo', text: 'sws lol wowo wool slow flow word', tip: '左无名指按 W，右无名指按 O。'},
  {id: 'qp', group: 'upper', title: '小指也来上楼', keys: 'qp', text: 'aqa ;p; qpqp quit pool puppy quip', tip: '左小指按 Q，右小指按 P。别着急，找准再按。'},
  {id: 'upper-mix', group: 'upper', title: '上面一排认识了', keys: 'qwertyuiop', text: 'qwerty uiop type write quiet flower', tip: '现在上面一排都认识了。每次只看当前要按的字母。'},
  {id: 'vm', group: 'lower', title: '食指向下走', keys: 'vm', text: 'fvf jmj vmvm move vim film milk', tip: '左食指按 V，右食指按 M。按完回到 F、J。'},
  {id: 'cn', group: 'lower', title: '中指向下走', keys: 'cn', text: 'dcd jnj cncn nice can coin dance', tip: 'C 用左中指。N 在右食指负责的区域，按完回 J。'},
  {id: 'xb', group: 'lower', title: '认识 X 和 B', keys: 'xb', text: 'sxs fbf xbxb box baby fox book', tip: 'X 用左无名指，B 用左食指。按完再回家。'},
  {id: 'z', group: 'lower', title: '最后一个字母 Z', keys: 'z', text: 'aza zzz zoo zero maze jazz zebra', tip: 'Z 用左小指。到这里，26 个英文字母都见过啦！'},
  {id: 'alphabet', group: 'lower', title: '字母大集合', keys: 'abcdefghijklmnopqrstuvwxyz', text: 'abcdefghijklmnopqrstuvwxyz flower garden bunny summer', spaces: true, tip: '先一个一个按字母，再试试带空格的小组合。空格用拇指。'},
  {id: 'space', group: 'pinyin', title: '空格来帮忙', keys: ' ', words: [{text: 'ba pa ma fa', meaning: '拼音热身 · b p m f'}, {text: 'bo po mo fo', meaning: '声母和韵母交朋友'}, {text: 'da ta na la', meaning: '每个拼音之间，拇指按空格'}], spaces: true, tip: '拼音之间空一格，用任意一只拇指按空格。直接按英文字母，不选汉字。'},
  {id: 'pinyin-one', group: 'pinyin', title: '拼音小种子', keys: ' ', words: [{text: 'yi wu yu', meaning: '衣 · 乌 · 鱼'}, {text: 'ma mi mu', meaning: '妈 · 米 · 木'}, {text: 'hua cao shu', meaning: '花 · 草 · 树'}, {text: 'lv se', meaning: '绿色 · ü 在键盘上用 v'}], spaces: true, tip: '照着屏幕打拼音字母，不用输入声调。遇到 ü，用 V 键。'},
  {id: 'pinyin-two', group: 'pinyin', title: '我的小伙伴', keys: ' ', words: [{text: 'ba ba', meaning: '爸爸'}, {text: 'ma ma', meaning: '妈妈'}, {text: 'xiao mao', meaning: '小猫'}, {text: 'xiao tu', meaning: '小兔'}, {text: 'peng you', meaning: '朋友'}], spaces: true, tip: '一组拼音就是一个小任务。先按准，再慢慢连起来。'},
  {id: 'pinyin-sentence', group: 'pinyin', title: '拼音小短句', keys: ' ', words: [{text: 'wo ai xue xi', meaning: '我爱学习'}, {text: 'jin tian tian qi hao', meaning: '今天天气好'}, {text: 'wo you yi ge xiao hua yuan', meaning: '我有一个小花园'}], spaces: true, tip: '读一读短句，再一个字母一个字母打出来。空格也要认真按。'},
  {id: 'digits', group: 'extra', title: '数字小台阶', keys: '1234567890', text: '1122 3344 5566 7788 9900 1234567890', tip: '先用字母区上面的数字键。1 左小指；2 左无名指；3 左中指；4、5 左食指。6、7 右食指；8 右中指；9 右无名指；0 右小指。'},
  {id: 'shift', group: 'extra', title: '让字母长大', keys: 'Shift', text: 'Ff Jj Aa Bb Cc Dd Hello Lixia', spaces: true, shift: true, tip: '大写字母：另一只手的小指按住 Shift，再按字母。松开 Shift 就回到小写。'},
  {id: 'punctuation', group: 'extra', title: '给句子画句号', keys: ',.?!', words: [{text: 'hi, lixia.', meaning: '你好，立夏。'}, {text: 'hao peng you!', meaning: '好朋友！'}, {text: 'ni hao ma?', meaning: '你好吗？'}], spaces: true, shift: true, tip: '逗号用右中指，句号用右无名指。? 是 Shift + /，! 是 Shift + 1。'},
  {id: 'numpad', group: 'extra', title: '右边的数字小花园', keys: '1234567890', text: '456 789 123 0 50 68 2026', spaces: true, numpad: true, tip: '照片右侧还有小键盘：右食指放 4、中指放 5、无名指放 6。先让 Num Lock 亮起来，只用右侧数字键；空格仍用拇指。'}
];
