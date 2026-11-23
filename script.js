const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=document.documentElement;
const get=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const set=(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}};

/* ===== ACESSIBILIDADE: tema, fonte, contraste ===== */
let S={};try{S=JSON.parse(get('eco'))||{}}catch(e){}
function apply(){
  R.dataset.theme=S.t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  R.dataset.contrast=S.c?'high':'';
  R.style.fontSize=(S.f||100)+'%';
  $('#tema').textContent=R.dataset.theme==='dark'?'☀️ Modo claro':'🌙 Modo escuro';
  $('#alto').setAttribute('aria-pressed',!!S.c);
  set('eco',JSON.stringify(S));
}
$('#tema').onclick=()=>{S.t=R.dataset.theme==='dark'?'light':'dark';apply()};
$('#mais').onclick=()=>{S.f=Math.min(150,(S.f||100)+10);apply()};
$('#menos').onclick=()=>{S.f=Math.max(80,(S.f||100)-10);apply()};
$('#alto').onclick=()=>{S.c=!S.c;apply()};
$('#reset').onclick=()=>{S={};apply()};
$('#btnA11y').onclick=e=>{const p=$('#a11y'),abrir=p.hidden;p.hidden=!abrir;e.currentTarget.setAttribute('aria-expanded',abrir)};
apply();

/* ===== CARROSSEL ===== */
let i=0;const sl=$$('.slide');
function show(n){i=(n+sl.length)%sl.length;sl.forEach((s,j)=>s.classList.toggle('on',j==i));$('#cnt').textContent=(i+1)+' / '+sl.length}
$('.prev').onclick=()=>show(i-1);
$('.next').onclick=()=>show(i+1);
$('#carrossel').onkeydown=e=>{if(e.key=='ArrowLeft')show(i-1);if(e.key=='ArrowRight')show(i+1)};

/* ===== DICAS: abas + pesquisa + favoritos ===== */
const T=[
['Água','Feche a torneira','Ao escovar os dentes ou ensaboar a louça, mantenha a torneira fechada.'],
['Água','Banhos mais curtos','Reduzir o tempo do banho poupa água e também a energia do chuveiro.'],
['Água','Reaproveite a água','A água da máquina de lavar ou da chuva pode lavar o quintal e regar plantas.'],
['Energia','Lâmpadas de LED','Consomem bem menos energia e duram mais que as incandescentes.'],
['Energia','Tire da tomada','Aparelhos em espera ainda consomem energia; desligue o que não está em uso.'],
['Energia','Use a luz natural','Abra as cortinas durante o dia e deixe a luz artificial para a noite.'],
['Lixo','Separe o lixo','Divida recicláveis e orgânicos para facilitar a coleta seletiva.'],
['Lixo','Leve sua sacola','Sacolas reutilizáveis evitam o descarte de muitos sacos plásticos.'],
['Lixo','Faça compostagem','Restos de frutas e legumes viram adubo para as plantas.']];
const C=['Todas','Água','Energia','Lixo'];
let cat='Todas',F=[];try{F=JSON.parse(get('ecoF'))||[]}catch(e){}
function draw(foco){
  const q=$('#q').value.toLowerCase().trim();
  const l=T.filter(t=>(cat=='Todas'||t[0]==cat)&&(t[1]+' '+t[2]).toLowerCase().includes(q));
  $('#res').textContent=l.length+' dica(s) encontrada(s) · '+F.length+' favorita(s)';
  $('#grid').innerHTML=l.map(t=>`<article class="card"><span class="tag">${t[0]}</span><h3>${t[1]}</h3><p>${t[2]}</p><button class="fav" data-k="${t[1]}" aria-pressed="${F.includes(t[1])}">${F.includes(t[1])?'♥ Favorita':'♡ Favoritar'}</button></article>`).join('')||'<p>Nenhuma dica encontrada.</p>';
  if(foco){const b=$(`.fav[data-k="${foco}"]`);if(b)b.focus()}
}
$('#grid').onclick=e=>{
  const b=e.target.closest('.fav');if(!b)return;
  const k=b.dataset.k;F=F.includes(k)?F.filter(x=>x!=k):[...F,k];
  set('ecoF',JSON.stringify(F));draw(k);
};
$('#tabs').innerHTML=C.map((c,n)=>`<button role="tab" aria-selected="${n==0}" tabindex="${n?-1:0}">${c}</button>`).join('');
$$('#tabs button').forEach((b,n,a)=>{
  b.onclick=()=>{cat=C[n];a.forEach((x,j)=>{x.setAttribute('aria-selected',n==j);x.tabIndex=n==j?0:-1});draw()};
  b.onkeydown=e=>{const d={ArrowRight:1,ArrowLeft:-1}[e.key];if(d){const p=a[(n+d+a.length)%a.length];p.focus();p.click()}};
});
$('#q').oninput=()=>draw();
draw();

/* ===== LOGIN (simulado, sem servidor) ===== */
const dlg=$('#login');
function user(){const u=get('ecoU');$('#btnLogin').textContent=u?'Sair ('+u+')':'Entrar'}
$('#btnLogin').onclick=()=>{if(get('ecoU')){set('ecoU',null);user()}else dlg.showModal()};
$('#fechar').onclick=()=>dlg.close();
$('#fLogin').onsubmit=e=>{
  e.preventDefault();
  const m=$('#le').value.trim(),s=$('#ls').value,er=$('#lerr');
  if(!/^\S+@\S+\.\S+$/.test(m)){er.textContent='Digite um e-mail válido.';return}
  if(s.length<6){er.textContent='A senha precisa ter pelo menos 6 caracteres.';return}
  set('ecoU',m.split('@')[0]);er.textContent='';dlg.close();user();
};
user();

/* ===== CONTATO (validação simples) ===== */
$('#fContato').onsubmit=e=>{
  e.preventDefault();
  const ok=$('#cn').value.trim()&&/^\S+@\S+\.\S+$/.test($('#ce').value)&&$('#cm').value.trim().length>=10;
  $('#cmsg').textContent=ok?'Mensagem enviada! (simulação: veja o README para ligar a um serviço real)':'Preencha o nome, um e-mail válido e uma mensagem com 10 ou mais caracteres.';
  if(ok)e.target.reset();
};
