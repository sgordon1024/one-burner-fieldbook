'use strict';
{
 const input=document.querySelector('#recipe-search');
 if(input){
  document.querySelector('.filter').hidden=false;
  const buttons=[...document.querySelectorAll('[data-filter]')];
  const cards=[...document.querySelectorAll('#recipe-grid .card')];
  const status=document.querySelector('#filter-status');
  status.hidden=false;
  let kind='All';
  function render(){
   const words=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
   let show=0;
   cards.forEach(card=>{
    const match=(kind==='All'||kind===card.dataset.kind)&&words.every(t=>card.dataset.term.includes(t));
    card.hidden=!match; if(match)show++;
   });
   status.textContent=show===0?'No matches. Try another ingredient or meal type.':show+' '+(show===1?'recipe':'recipes');
  }
  input.addEventListener('input',render);
  buttons.forEach(button=>button.addEventListener('click',()=>{
   kind=button.dataset.filter;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();
  }));
  render();
 }
 const shop=document.querySelector('[data-week]');
 if(shop){
  const boxes=[...shop.querySelectorAll('[data-item]')], copy=document.querySelector('#copy-list'), reset=document.querySelector('#reset-list'), status=document.querySelector('#list-status'), fallback=document.querySelector('#copy-fallback');
  const key='fieldbook:checklist:'+shop.dataset.week;
  let checks=new Set();
  try { const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))checks=new Set(value); } catch {}
  function render(message){
   boxes.forEach(b=>{b.checked=checks.has(b.dataset.item);b.disabled=false});
   const count=boxes.filter(b=>!b.checked).length;
   status.textContent=message||count+' '+(count===1?'item':'items')+' left to shop.';
   copy.disabled=count===0;reset.disabled=count===boxes.length;
  }
  function persist(){try {localStorage.setItem(key,JSON.stringify([...checks]));} catch {}}
  boxes.forEach(b=>b.addEventListener('change',()=>{
   if(b.checked)checks.add(b.dataset.item); else checks.delete(b.dataset.item);
   persist();fallback.hidden=true;render();
  }));
  reset.addEventListener('click',()=>{checks.clear();persist();fallback.hidden=true;render();});
  copy.addEventListener('click',async()=>{
   const list=boxes.filter(b=>!b.checked).map(b=>b.dataset.pack+' '+b.dataset.name).join('\n');
   try{await navigator.clipboard.writeText(list);fallback.hidden=true;render('Copied. Paste the list into Sparky or any notes app.');}
   catch{fallback.hidden=false;fallback.value=list;fallback.focus();fallback.select();render('List ready to copy manually.');}
  });
  copy.hidden=false;reset.hidden=false;render();
 }
}
