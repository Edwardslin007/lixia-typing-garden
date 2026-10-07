from pathlib import Path
import shutil,json,hashlib
root=Path('.');out=root/'dist';out.mkdir(exist_ok=True)
files=['index.html','styles.css','v3.css','v4.css','account.css','account.js','laptop-layout.js','lessons.js','pinyin-data.js','effects.js','app.js','expansion.js','revision4.js','hands-photo.js','cloud-config.json']
for name in files:shutil.copy2(root/name,out/name)
for f in (root/'assets').rglob('*'):
 if not f.is_file():continue
 rel=f.relative_to(root/'assets');name=rel.as_posix()
 keep=('/'not in name and f.suffix in ['.png','.webp'])or name=='audio/manifest.json'or name.startswith('release-voices/')or name.startswith('study/')or (name.startswith('teaching/')and f.suffix in ['.mp3','.json'])or (name.startswith('mimo/english-')and f.suffix=='.wav')
 if keep:
  dest=out/'assets'/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,dest)
 # A local rebuild can retain artifacts from an earlier build. Only remove excluded
 # public-copy files; source assets and recordings remain untouched.
for f in (out/'assets').rglob('*'):
 if not f.is_file():continue
 name=f.relative_to(out/'assets').as_posix()
 keep=('/'not in name and f.suffix in ['.png','.webp'])or name=='audio/manifest.json'or name.startswith('release-voices/')or name.startswith('study/')or (name.startswith('teaching/')and f.suffix in ['.mp3','.json'])or (name.startswith('mimo/english-')and f.suffix=='.wav')
 if not keep:
  if not f.resolve().is_relative_to(out.resolve()):raise ValueError('Outside public build')
  f.unlink()
for p in out.rglob('*'):
 if p.is_file()and p.suffix in ['.js','.json']:
  text=p.read_text(encoding='utf8');text=text.replace('"/assets/','"assets/').replace("'/assets/","'assets/");p.write_text(text,encoding='utf8')
(out/'.nojekyll').write_text('',encoding='utf8')
manifest={p.relative_to(out).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for p in out.rglob('*')if p.is_file()}
(root/'releases').mkdir(exist_ok=True)
(root/'releases'/'V1.0-files.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8');print('Pages files',len(manifest),'MB',round(sum(p.stat().st_size for p in out.rglob('*')if p.is_file())/1e6,2))
