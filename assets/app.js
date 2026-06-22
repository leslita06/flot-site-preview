
(function(){
  // --- menu mobile ---
  var t=document.querySelector('.nav-toggle'), n=document.getElementById('primary-nav');
  if(t&&n){t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o);});
    n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){n.classList.remove('open');t.setAttribute('aria-expanded',false);});});}

  // --- formulaires -> WhatsApp ---
  var WA='https://wa.me/2250585219090';
  function labelOf(el){var l=el.closest('label'); if(!l) return el.name||'';
    var c=l.cloneNode(true);
    c.querySelectorAll('input,select,textarea,output').forEach(function(x){x.remove();});
    return c.textContent.replace(/\s+/g,' ').trim();}
  document.querySelectorAll('form.js-wa-form').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(f.checkValidity && !f.checkValidity()){ if(f.reportValidity) f.reportValidity(); return; }
      var intro=f.getAttribute('data-wa-intro')||'Bonjour Flot';
      var lines=[intro,''];
      f.querySelectorAll('input,select,textarea').forEach(function(el){
        if(el.type==='submit'||el.type==='button') return;
        var v=(el.value||'').trim(); if(!v) return;
        lines.push(labelOf(el)+' : '+v);
      });
      window.open(WA+'?text='+encodeURIComponent(lines.join('\n')),'_blank','noopener');
    });
  });

  // --- simulateur (chiffres illustratifs) ---
  var g=document.getElementById('sim-gain');
  if(g){
    var MONTHS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    function fmt(n){n=Math.round(n);var s=String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');return s+' FCFA';}
    var out=document.getElementById('sim-gain-out'),
        rev=document.getElementById('sim-rev'),
        fuel=document.getElementById('sim-fuel'),
        dt=document.getElementById('sim-date');
    var d=new Date(); d.setMonth(d.getMonth()+36);
    if(dt) dt.textContent='en '+MONTHS[d.getMonth()]+' '+d.getFullYear();
    function upd(){
      var v=parseInt(g.value,10)||0;
      if(out) out.textContent=fmt(v);
      if(rev) rev.textContent=fmt(v*26);
      if(fuel) fuel.textContent='≈ '+fmt(Math.round(v*26*0.22/10000)*10000);
    }
    g.addEventListener('input',upd); upd();
  }
})();
