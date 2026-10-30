(function(){
const F=(window.FIELDS||[]).slice().sort((a,b)=>(a.phase-b.phase)||(a.order-b.order));
const T=window.TOOLS||[],D=window.DEEP||{},G=window.GLOSSARY||[], CFG=window.LIB_CONFIG||{};
const $=s=>document.querySelector(s), main=$("#main");
let P={done:{},quiz:{},chk:{},last:""};
try{Object.assign(P,JSON.parse(localStorage.getItem("mklib")||"{}"))}catch(e){}
const save=()=>{try{localStorage.setItem("mklib",JSON.stringify(P))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const inl=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/`(.+?)`/g,"<code>$1</code>");
const fa=n=>String(n).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);
const norm=s=>String(s).toLowerCase().replace(/ي/g,"ی").replace(/ك/g,"ک").replace(/‌/g," ");

const L=[];
F.forEach(f=>f.lessons.forEach((l,i)=>{l.id=f.id+"-"+(i+1);l.f=f;l.i=i;L.push(l)}));
const byId=id=>L.find(l=>l.id===id), fById=id=>F.find(f=>f.id===id);
const fDone=f=>f.lessons.filter(l=>P.done[l.id]).length;

function md(t){
  let h="",ul=false;
  const close=()=>{if(ul){h+="</ul>";ul=false}};
  t.trim().split("\n").forEach(r=>{
    r=r.trim();
    if(!r){close();return}
    if(r.startsWith("## ")){close();h+="<h3>"+inl(r.slice(3))+"</h3>"}
    else if(r.startsWith("- ")){if(!ul){h+="<ul>";ul=true}h+="<li>"+inl(r.slice(2))+"</li>"}
    else if(r.startsWith("> ")){close();h+='<div class="tip">'+inl(r.slice(2))+"</div>"}
    else{close();h+="<p>"+inl(r)+"</p>"}
  });
  close();return h;
}
const bar=p=>'<div class="bar"><i style="width:'+p+'%"></i></div>';

function side(cur){
  const g={1:"شروع سریع",2:"هسته مارکتینگ",3:"تخصص‌ها",4:"رشد شخصی"};
  let h='<a href="#/" class="'+(cur==="home"?"on":"")+'">🏠 خانه</a><a href="#/tools" class="'+(cur==="tools"?"on":"")+'">🧰 ابزارها ('+fa(T.length)+')</a><a href="#/templates" class="'+(cur==="tpl"?"on":"")+'">📄 قالب‌ها</a><a href="#/practice" class="'+(cur==="pr"?"on":"")+'">🛠 تمرین‌ها</a><a href="#/glossary" class="'+(cur==="gl"?"on":"")+'">📖 واژه‌نامه</a>',ph=0;
  F.forEach(f=>{
    if(f.phase!==ph){ph=f.phase;h+="<h4>"+g[ph]+"</h4>"}
    h+='<a href="#/f/'+f.id+'" class="'+(cur===f.id?"on":"")+'"><span>'+f.icon+" "+esc(f.title)+"</span><small>"+fa(fDone(f))+"/"+fa(f.lessons.length)+"</small></a>";
  });
  $("#side").innerHTML=h;
}

function home(){
  const tot=L.length,d=L.filter(l=>P.done[l.id]).length,pct=Math.round(d/tot*100);
  const next=byId(P.last&&P.last.startsWith("l/")?P.last.slice(2):"")||L.find(l=>!P.done[l.id])||L[0];
  const g={1:"شروع سریع",2:"هسته مارکتینگ",3:"تخصص‌ها",4:"رشد شخصی"};
  let h='<div class="hero"><h1>'+(CFG.name?"سلام "+esc(CFG.name)+" 👋":"سلام 👋")+'</h1><p class="lead">'+esc(CFG.note||"")+"</p>"+bar(pct)+
    "<p>"+fa(d)+" از "+fa(tot)+" درس خونده‌شده ("+fa(pct)+"٪)</p>"+
    '<a class="btn" href="#/l/'+next.id+'">'+(d?"ادامه بده: ":"شروع کن: ")+esc(next.title)+"</a></div>";
  [1,2,3,4].forEach(p=>{
    h+="<h2>"+g[p]+'</h2><div class="grid">';
    F.filter(f=>f.phase===p).forEach(f=>{
      const n=fDone(f),t=f.lessons.length;
      h+='<a class="card" href="#/f/'+f.id+'"><div class="ic">'+f.icon+"</div><b>"+esc(f.title)+"</b><span>"+esc(f.summary)+"</span>"+bar(n/t*100)+"<span>"+fa(n)+" از "+fa(t)+" درس</span></a>";
    });
    h+="</div>";
  });
  h+='<div class="note">پیشنهاد مسیر: از «شروع سریع» شروع کن، بعد «هسته»، و تخصص‌ها رو بر اساس پروژه‌هایی که تو آژانس بهشون می‌رسی بخون. لازم نیست ترتیب رو رعایت کنی.</div>';
  main.innerHTML=h;side("home");
}

function field(id){
  const f=fById(id);if(!f)return home();
  const n=fDone(f),t=f.lessons.length;
  let h='<div class="crumb"><a href="#/">خانه</a> › '+esc(f.title)+"</div><h1>"+f.icon+" "+esc(f.title)+'</h1><p class="lead">'+esc(f.summary)+"</p>"+bar(n/t*100)+"<h2>درس‌ها</h2>";
  f.lessons.forEach((l,i)=>{
    h+='<a class="lrow '+(P.done[l.id]?"d":"")+'" href="#/l/'+l.id+'"><span class="n">'+(P.done[l.id]?"✓":fa(i+1))+"</span><span>"+esc(l.title)+"</span><small>"+fa(l.min||5)+" دقیقه</small></a>";
  });
  if(f.tools&&f.tools.length){h+="<h2>ابزارها</h2><div>";f.tools.forEach(x=>{const k=x.split(" — ");h+='<div class="tool"><b>'+esc(k[0])+"</b><span>"+esc(k[1]||"")+"</span></div>"});h+="</div>"}
  const rt=T.filter(t=>(t.fields||[]).includes(f.id));
  if(rt.length)h+="<h2>راهنمای تصویری ابزارها</h2><div>"+rt.map(t=>'<a class="chip" href="#/t/'+t.id+'">'+esc(t.name)+"</a>").join("")+"</div>";
  if(f.soft&&f.soft.length){h+="<h2>مهارت‌های نرم این حوزه</h2><div>"+f.soft.map(s=>'<span class="chip">'+esc(s)+"</span>").join("")+"</div>"}
  if(f.checklists)f.checklists.forEach((c,ci)=>{
    h+="<h2>📋 "+esc(c.title)+"</h2><div>";
    c.items.forEach((it,ii)=>{const k=f.id+"."+ci+"."+ii;h+='<label class="chk"><input type="checkbox" data-k="'+k+'" '+(P.chk[k]?"checked":"")+"><span>"+inl(it)+"</span></label>"});
    h+="</div>";
  });
  main.innerHTML=h;side(f.id);
  main.querySelectorAll("input[data-k]").forEach(i=>i.onchange=()=>{if(i.checked)P.chk[i.dataset.k]=1;else delete P.chk[i.dataset.k];save()});
}

function lesson(id){
  const l=byId(id);if(!l)return home();
  const f=l.f,ix=L.indexOf(l),pv=L[ix-1],nx=L[ix+1];
  P.last="l/"+id;save();
  let h='<div class="crumb"><a href="#/">خانه</a> › <a href="#/f/'+f.id+'">'+esc(f.title)+"</a> › درس "+fa(l.i+1)+"</div><h1>"+esc(l.title)+'</h1><p class="lead">'+fa(l.min||5)+' دقیقه مطالعه</p><div class="body">'+md(l.body)+"</div>";
  const dp=(D[f.id]||[])[l.i];
  if(dp){
    h+='<button id="dpb" class="btn ghost deepbtn">📚 محتوای عمیق‌تر و به‌روزتر</button><div id="dpp" class="deep" hidden><h2 style="margin-top:0">'+esc(dp.title)+'</h2><div class="body">'+md(dp.body)+'</div>'+
      (dp.sources&&dp.sources.length?'<h3>منابع</h3><ul class="src">'+dp.sources.map(s=>'<li><a href="'+esc(s[1])+'" target="_blank" rel="noopener noreferrer">'+esc(s[0])+'</a></li>').join("")+'</ul>':"")+'</div>';
  }
  if(l.quiz&&l.quiz.length){
    h+='<div class="quiz"><h3 style="margin-top:0">آزمون کوتاه</h3>';
    l.quiz.forEach((q,qi)=>{
      h+='<div class="qq" data-a="'+q[2]+'"><p>'+inl(q[0])+"</p>"+q[1].split("|").map((o,oi)=>'<button class="qo" data-o="'+oi+'">'+inl(o)+"</button>").join("")+'<div class="qe" hidden>'+inl(q[3]||"")+"</div></div>";
    });
    h+='<p id="qs" class="lead" style="margin:0"></p></div>';
  }
  h+='<button id="dn" class="btn '+(P.done[id]?"done":"")+'">'+(P.done[id]?"✓ خوندم":"علامت بزن: خوندم")+'</button><div class="nav">'+
    (pv?'<a class="btn ghost" href="#/l/'+pv.id+'">→ قبلی</a>':"")+(nx?'<a class="btn" href="#/l/'+nx.id+'">بعدی ←</a>':"")+"</div>";
  main.innerHTML=h;side(f.id);
  const db=$("#dpb");if(db)db.onclick=()=>{const p=$("#dpp");p.hidden=!p.hidden;db.textContent=p.hidden?"📚 محتوای عمیق‌تر و به‌روزتر":"🔼 بستن محتوای عمیق"};
  let ans=0,ok=0;const qs=main.querySelectorAll(".qq");
  qs.forEach(q=>q.querySelectorAll(".qo").forEach(b=>b.onclick=()=>{
    const a=+q.dataset.a;
    q.querySelectorAll(".qo").forEach(x=>{x.disabled=true;if(+x.dataset.o===a)x.classList.add("ok")});
    if(+b.dataset.o===a)ok++;else b.classList.add("bad");
    q.querySelector(".qe").hidden=false;ans++;
    if(ans===qs.length){$("#qs").textContent="نتیجه: "+fa(ok)+" از "+fa(qs.length);P.quiz[id]=ok;
      if(!P.done[id]){P.done[id]=1;$("#dn").className="btn done";$("#dn").textContent="✓ خوندم"}save();side(f.id)}
  }));
  $("#dn").onclick=e=>{if(P.done[id])delete P.done[id];else P.done[id]=1;save();lesson(id);window.scrollTo(0,document.body.scrollHeight)};
}


function tools(){
  let h="<h1>🧰 ابزارها</h1><p class=lead>هر ابزار: چیه، بخش‌های صفحه‌ش، قدم‌به‌قدم کار با اون و سؤال تمرینی.</p>";
  const cats={};T.forEach(t=>(cats[t.cat]=cats[t.cat]||[]).push(t));
  Object.keys(cats).forEach(c=>{h+="<h2>"+esc(c)+'</h2><div class="grid">';cats[c].forEach(t=>h+='<a class="card" href="#/t/'+t.id+'"><b dir="ltr" style="text-align:right">'+esc(t.name)+"</b><span>"+esc(t.what.slice(0,90))+"…</span><span>"+esc(t.price||"")+"</span></a>");h+="</div>"});
  if(!T.length)h+="<p>به‌زودی…</p>";
  main.innerHTML=h;side("tools");
}
function tool(id){
  const t=T.find(x=>x.id===id);if(!t)return tools();
  const rg=(t.screen&&t.screen.regions)||[];
  let h='<div class="crumb"><a href="#/tools">ابزارها</a> › '+esc(t.cat)+'</div><h1 dir="ltr" style="text-align:right">'+esc(t.name)+'</h1><p class="lead">'+esc(t.what)+"</p><p><span class=chip>"+esc(t.price||"")+"</span>"+(t.whoUses?" "+esc(t.whoUses):"")+"</p>";
  h+='<div id="shot"></div>';
  if(rg.length)h+="<h2>بخش‌های اصلی صفحه</h2><div class=body><ul>"+rg.map(r=>"<li><b>"+esc(r.label)+"</b> — "+esc(r.desc)+"</li>").join("")+"</ul></div>";
  if(t.steps&&t.steps.length)h+="<h2>قدم‌به‌قدم</h2><ol class=steps>"+t.steps.map(s=>"<li>"+inl(s)+"</li>").join("")+"</ol>";
  if(t.terms&&t.terms.length){h+="<h2>اصطلاحات کلیدی</h2>";t.terms.forEach(x=>h+='<div class="gl"><b>'+esc(x[0])+"</b><span>"+inl(x[1])+"</span></div>")}
  if(t.mistakes&&t.mistakes.length)h+="<h2>اشتباه‌های رایج</h2><div class=body><ul>"+t.mistakes.map(s=>"<li>"+inl(s)+"</li>").join("")+"</ul></div>";
  if(t.qa&&t.qa.length){h+="<h2>سؤال تمرینی</h2>";t.qa.forEach(x=>h+='<details class="qa"><summary>'+inl(x[0])+"</summary><p>"+inl(x[1])+"</p></details>")}
  if(t.url)h+='<p style="margin-top:24px"><a class="btn ghost" target="_blank" rel="noopener noreferrer" href="'+esc(t.url)+'">سایت رسمی (نیاز به اینترنت)</a></p>';
  main.innerHTML=h;side("tools");
  const im=new Image(),ex=["png","jpg","jpeg","webp"];let k=0;
  im.alt=t.name+" — تصویر صفحه";im.className="shot";
  im.onload=()=>{const s=$("#shot");if(s)s.appendChild(im)};
  im.onerror=()=>{if(++k<ex.length)im.src="images/tools/"+t.id+"."+ex[k]};
  im.src="images/tools/"+t.id+"."+ex[0];
}

const TP=window.TEMPLATES||[],PR=window.PRACTICE||[];
function templates(){
  let h="<h1>📄 قالب‌های آماده</h1><p class=lead>کپی کن یا دانلود کن (متنی یا CSV برای Excel/Sheets). جاهای [داخل کروشه] رو پر کن.</p>";
  const cats={};TP.forEach(t=>(cats[t.cat||"عمومی"]=cats[t.cat||"عمومی"]||[]).push(t));
  Object.keys(cats).forEach(c=>{h+="<h2>"+esc(c)+"</h2>";cats[c].forEach(t=>{
    h+='<details class="qa"><summary>'+esc(t.title)+"</summary><p>"+esc(t.desc||"")+'</p><pre class="tpl">'+esc(t.content)+'</pre><p><button class="btn ghost" data-cp="'+t.id+'">کپی</button> <button class="btn" data-dl="'+t.id+'">دانلود '+(t.kind==="csv"?"CSV":"TXT")+"</button></p></details>"})});
  if(!TP.length)h+="<p>به‌زودی…</p>";
  main.innerHTML=h;side("tpl");
  main.querySelectorAll("[data-cp]").forEach(b=>b.onclick=()=>{const t=TP.find(x=>x.id===b.dataset.cp);const ok=()=>{b.textContent="کپی شد ✓"};try{navigator.clipboard.writeText(t.content).then(ok,()=>{})}catch(e){}});
  main.querySelectorAll("[data-dl]").forEach(b=>b.onclick=()=>{const t=TP.find(x=>x.id===b.dataset.dl);const bl=new Blob(["\ufeff"+t.content],{type:(t.kind==="csv"?"text/csv":"text/plain")+";charset=utf-8"});const u=URL.createObjectURL(bl),a=document.createElement("a");a.href=u;a.download=t.file||t.id+(t.kind==="csv"?".csv":".txt");document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),500)});
}
function practice(){
  let h="<h1>🛠 تمرین‌های عملی</h1><p class=lead>پروژه‌های کوچک برای اینکه از دانستن برسی به انجام‌دادن. هر تمرین معیار خودسنجی داره.</p><div class=grid>";
  PR.forEach(p=>{const n=p.rubric.filter((_,i)=>P.chk["p."+p.id+"."+i]).length;h+='<a class="card" href="#/p/'+p.id+'"><b>'+esc(p.title)+"</b><span>"+esc(p.level)+" · "+esc(p.time)+"</span>"+bar(n/p.rubric.length*100)+"</a>"});
  h+="</div>";if(!PR.length)h+="<p>به‌زودی…</p>";
  main.innerHTML=h;side("pr");
}
function pitem(id){
  const p=PR.find(x=>x.id===id);if(!p)return practice();
  let h='<div class="crumb"><a href="#/practice">تمرین‌ها</a></div><h1>'+esc(p.title)+'</h1><p class="lead">'+esc(p.level)+" · "+esc(p.time)+'</p><h2>سناریو</h2><div class="body">'+md(p.scenario)+"</div><h2>کارها</h2><ol class=steps>"+p.tasks.map(x=>"<li>"+inl(x)+"</li>").join("")+"</ol><h2>خروجی‌ها</h2><div class=body><ul>"+p.deliverables.map(x=>"<li>"+inl(x)+"</li>").join("")+"</ul></div><h2>خودسنجی</h2>";
  p.rubric.forEach((x,i)=>{const k="p."+p.id+"."+i;h+='<label class="chk"><input type="checkbox" data-k="'+k+'" '+(P.chk[k]?"checked":"")+"><span>"+inl(x)+"</span></label>"});
  if(p.hint)h+='<details class="qa" style="margin-top:16px"><summary>راهنما / پاسخ نمونه</summary><div class="body">'+md(p.hint)+"</div></details>";
  if((p.fields||[]).length)h+="<h2>درس‌های مرتبط</h2><div>"+p.fields.map(f=>fById(f)?'<a class="chip" href="#/f/'+f+'">'+esc(fById(f).title)+"</a>":"").join("")+"</div>";
  main.innerHTML=h;side("pr");
  main.querySelectorAll("input[data-k]").forEach(i=>i.onchange=()=>{if(i.checked)P.chk[i.dataset.k]=1;else delete P.chk[i.dataset.k];save()});
}

function glossary(){
  let h="<h1>📖 واژه‌نامه</h1><p class=lead>اصطلاحاتی که تو آژانس زیاد می‌شنوی.</p>";
  G.slice().sort((a,b)=>a[0].localeCompare(b[0])).forEach(g=>h+='<div class="gl"><b>'+esc(g[0])+"</b><span>"+inl(g[1])+"</span></div>");
  main.innerHTML=h;side("gl");
}

function search(q){
  const n=norm(q.trim());let h="<h1>نتیجه جستجو</h1>";
  if(n.length<2){main.innerHTML=h+"<p>حداقل دو حرف بنویس.</p>";return}
  let c=0;
  L.forEach(l=>{if(norm(l.title+" "+l.body+" "+(((D[l.f.id]||[])[l.i]||{}).body||"")).includes(n)){c++;h+='<div class="hit"><a href="#/l/'+l.id+'"><b>'+esc(l.title)+"</b></a><br><small>"+esc(l.f.title)+"</small></div>"}});
  G.forEach(g=>{if(norm(g[0]+" "+g[1]).includes(n)){c++;h+='<div class="hit"><b dir="ltr">'+esc(g[0])+"</b> — "+inl(g[1])+"<br><small>واژه‌نامه</small></div>"}});
  F.forEach(f=>(f.tools||[]).forEach(t=>{if(norm(t).includes(n)){c++;h+='<div class="hit"><a href="#/f/'+f.id+'">'+esc(t.split(" — ")[0])+"</a><br><small>ابزار · "+esc(f.title)+"</small></div>"}}));
  T.forEach(t=>{if(norm(t.name+" "+t.what).includes(n)){c++;h+='<div class="hit"><a href="#/t/'+t.id+'"><b>'+esc(t.name)+"</b></a><br><small>ابزار · "+esc(t.cat)+"</small></div>"}});
  TP.forEach(t=>{if(norm(t.title+" "+(t.desc||"")).includes(n)){c++;h+='<div class="hit"><a href="#/templates"><b>'+esc(t.title)+"</b></a><br><small>قالب</small></div>"}});
  PR.forEach(p=>{if(norm(p.title+" "+p.scenario).includes(n)){c++;h+='<div class="hit"><a href="#/p/'+p.id+'"><b>'+esc(p.title)+"</b></a><br><small>تمرین</small></div>"}});
  if(!c)h+="<p>چیزی پیدا نشد.</p>";
  main.innerHTML=h;
}

function route(){
  document.body.classList.remove("open");
  const r=(location.hash||"#/").slice(2).split("/");
  if(r[0]==="f")field(r[1]);else if(r[0]==="l")lesson(r[1]);else if(r[0]==="glossary")glossary();else if(r[0]==="tools")tools();else if(r[0]==="templates")templates();else if(r[0]==="practice")practice();else if(r[0]==="p")pitem(r[1]);else if(r[0]==="t")tool(r[1]);else home();
  window.scrollTo(0,0);
}
addEventListener("hashchange",route);
$("#menu").onclick=()=>document.body.classList.toggle("open");
$("#scrim").onclick=()=>document.body.classList.remove("open");
$("#q").oninput=e=>{const v=e.target.value;if(v.trim())search(v);else route()};
const th=()=>{let t="";try{t=localStorage.getItem("mkth")||""}catch(e){}if(!t)t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.dataset.theme=t};
th();
$("#theme").onclick=()=>{const t=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=t;try{localStorage.setItem("mkth",t)}catch(e){}};
route();
if("serviceWorker" in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
