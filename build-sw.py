#!/usr/bin/env python3
"""Regenerate sw.js with the full file list. Run after changing any content: python3 build-sw.py"""
import os,hashlib,json
root=os.path.dirname(os.path.abspath(__file__))
skip={"sw.js","build-sw.py",".DS_Store","README.md"}
files=[]
for d,_,fs in os.walk(root):
    for f in fs:
        if f in skip or f.startswith("."):continue
        files.append(os.path.relpath(os.path.join(d,f),root).replace(os.sep,"/"))
files.sort()
h=hashlib.md5()
for f in files:h.update(open(os.path.join(root,f),"rb").read())
ver=h.hexdigest()[:10]
sw=f'''const V="mk-{ver}";
const FILES={json.dumps(["./"]+files,ensure_ascii=False)};
self.addEventListener("install",e=>{{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))}});
self.addEventListener("activate",e=>{{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))}});
self.addEventListener("fetch",e=>{{
  if(e.request.method!=="GET")return;
  const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  e.respondWith(caches.match(e.request,{{ignoreSearch:true}}).then(r=>r||fetch(e.request).then(n=>{{const c=n.clone();caches.open(V).then(x=>x.put(e.request,c));return n}}).catch(()=>caches.match("./index.html"))));
}});
'''
open(os.path.join(root,"sw.js"),"w").write(sw)
print("sw.js:",len(files),"files, version",ver)
