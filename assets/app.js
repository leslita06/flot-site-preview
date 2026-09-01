
(function(){
  // --- menu mobile ---
  var t=document.querySelector('.nav-toggle'), n=document.getElementById('primary-nav');
  if(t&&n){t.addEventListener('click',function(){var o=n.classList.toggle('open');t.setAttribute('aria-expanded',o);});
    n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){n.classList.remove('open');t.setAttribute('aria-expanded',false);});});}

  // --- exploration du véhicule : points d'intérêt ---
  var points = Array.prototype.slice.call(document.querySelectorAll('.vhot'));
  points.forEach(function(b){
    // au-delà de la moitié de l'image, la bulle s'ouvre vers la gauche pour rester dans le cadre
    if (parseFloat(b.style.left) > 55) b.classList.add('vhot--gauche');
    b.addEventListener('click', function(e){
      e.stopPropagation();
      var ouvert = b.getAttribute('aria-expanded') === 'true';
      points.forEach(function(a){ a.setAttribute('aria-expanded','false'); });
      b.setAttribute('aria-expanded', ouvert ? 'false' : 'true');
      majPanneau();
    });
  });
  function majPanneau(){
    document.querySelectorAll('.vpop-mob').forEach(function(pan){
      var actif = document.querySelector('.vhot[aria-expanded="true"] .vhot__pop');
      if (actif) { pan.innerHTML = actif.innerHTML; pan.classList.add('on'); }
      else pan.classList.remove('on');
    });
  }
  if (points.length) {
    document.addEventListener('click', function(){
      points.forEach(function(a){ a.setAttribute('aria-expanded','false'); });
      majPanneau();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') {
        points.forEach(function(a){ a.setAttribute('aria-expanded','false'); });
        majPanneau();
      }
    });
  }

  // --- vue 360° : glisser / flèches pour tourner autour du véhicule ---
  document.querySelectorAll('.v360').forEach(function(v){
    var vues = v.querySelectorAll('.v360__f');
    var n = vues.length; if (n < 2) return;
    var i = 0, presse = false, departX = 0, departI = 0;
    // distance de glissement pour passer à l'image suivante (un tour ≈ une largeur d'écran,
    // plafonnée pour qu'une séquence courte reste maniable sur un grand écran)
    function pasParImage(){ return Math.max(6, Math.min(v.clientWidth / n, 60)); }
    function montrer(k){
      k = ((k % n) + n) % n;
      if (k === i) return;
      vues[i].classList.remove('on'); vues[k].classList.add('on'); i = k;
    }
    function debut(x){ presse = true; departX = x; departI = i; v.classList.add('touche'); }
    function bouge(x){ if (presse) montrer(departI + Math.round((x - departX) / pasParImage())); }
    function fin(){ presse = false; }

    v.addEventListener('pointerdown', function(e){
      debut(e.clientX);
      try { v.setPointerCapture(e.pointerId); } catch (err) {}
    });
    v.addEventListener('pointermove', function(e){ if (presse) { e.preventDefault(); bouge(e.clientX); } });
    // filet : si la capture du pointeur n'est pas honorée, on suit quand même le glissement
    window.addEventListener('pointermove', function(e){ if (presse) bouge(e.clientX); });
    window.addEventListener('pointerup', fin);
    v.addEventListener('pointercancel', fin);
    v.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight') { montrer(i + 1); v.classList.add('touche'); e.preventDefault(); }
      if (e.key === 'ArrowLeft')  { montrer(i - 1); v.classList.add('touche'); e.preventDefault(); }
    });
    // un demi-tour automatique à la première apparition, pour montrer que ça tourne
    var lance = false;
    var oeil = new IntersectionObserver(function(entrees){
      entrees.forEach(function(en){
        if (!en.isIntersecting || lance) return;
        lance = true;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var k = 0, t = setInterval(function(){
          if (presse || k >= Math.round(n / 2)) { clearInterval(t); return; }
          montrer(i + 1); k++;
        }, 70);
      });
    }, { threshold: .35 });
    oeil.observe(v);
    // précharger les images pour que la rotation ne saccade pas
    vues.forEach(function(im){ im.loading = 'eager'; });
  });

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

  // --- formulaire investisseurs -> boite des deux fondateurs ---
  // Adresse /exec du deploiement Apps Script, a coller ici (voir FORMULAIRE.md).
  // Tant qu'elle n'est pas renseignee, le formulaire ne pretend PAS avoir envoye.
  var ENDPOINT_INVESTISSEURS = '__ENDPOINT_INVESTISSEURS__';
  document.querySelectorAll('form.js-post-form').forEach(function(f){
    function ecran(titre, texte, ok){
      f.innerHTML = '<div class="fld fld--full" style="text-align:center;padding:24px 6px">'+
        '<h3 style="margin:0 0 8px">'+titre+'</h3><p style="margin:0">'+texte+'</p></div>';
      f.setAttribute('data-etat', ok ? 'envoye' : 'echec');
    }
    f.addEventListener('submit', function(e){
      e.preventDefault();
      if(f.checkValidity && !f.checkValidity()){ if(f.reportValidity) f.reportValidity(); return; }
      var secours = f.getAttribute('data-secours') || '';
      if(ENDPOINT_INVESTISSEURS.indexOf('http') !== 0){
        ecran('Envoi indisponible', 'Nous ne pouvons pas enregistrer votre demande pour le moment. ' + secours, false);
        return;
      }
      var data = Object.fromEntries(new FormData(f).entries());
      data.page = location.pathname; data.source = 'site flot.africa';
      var b = f.querySelector('[type=submit]');
      if(b){ b.disabled = true; b.textContent = 'Envoi en cours...'; }
      fetch(ENDPOINT_INVESTISSEURS, {method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'},
                                     body: JSON.stringify(data)})
        .then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); })
        .then(function(){ ecran('Bien recu', 'Merci. Votre demande est arrivee chez l\'equipe Flot, qui revient vers vous sous 48 h ouvrees.', true); })
        .catch(function(){
          ecran('L\'envoi a echoue', 'Votre demande n\'a pas pu etre transmise. ' + secours, false);
          if(b){ b.disabled = false; b.textContent = 'Envoyer mon intention'; }
        });
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
