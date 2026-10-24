/* CaVeSal® Academy — Buscador, Glosario y Autoevaluación (Guías). */
(function () {
  var G = window.ACADEMY_GLOSARIO || [], Q = window.ACADEMY_QUIZ || [];
  var dlg = document.getElementById('academy-dlg');
  if (!dlg) return;
  var body = document.getElementById('academy-body');
  var title = document.getElementById('academy-title');

  function norm(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function tabName(id) { var b = document.getElementById('tab-' + id); return b ? b.textContent.trim() : id; }

  /* Ir a una ficha: activa la pestaña, busca la ficha por título y la resalta */
  function goTo(tab, cardText, el) {
    if (dlg.open) dlg.close();
    var b = document.getElementById('tab-' + tab); if (b) b.click();
    var panel = document.getElementById('panel-' + tab); if (!panel) return;
    var target = el;
    if (!target && cardText) {
      var n = norm(cardText);
      panel.querySelectorAll('.subcard').forEach(function (c) {
        var h = c.querySelector('h3'); if (!target && h && norm(h.textContent).indexOf(n) > -1) target = c;
      });
    }
    target = target || panel;
    setTimeout(function () {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.add('academy-hit');
      setTimeout(function () { target.classList.remove('academy-hit'); }, 2400);
    }, 60);
  }
  function linkBtn(tab, card) {
    return '<button type="button" class="academy-go" data-tab="' + esc(tab) + '" data-card="' + esc(card) + '">Ver en la guía: ' + esc(tabName(tab)) + ' →</button>';
  }
  body.addEventListener('click', function (ev) {
    var g = ev.target.closest('.academy-go');
    if (g) { goTo(g.dataset.tab, g.dataset.card, g._el); }
  });

  /* ---------- Buscador ---------- */
  var index = null;
  function buildIndex() {
    index = [];
    document.querySelectorAll('.demo-panel').forEach(function (p) {
      var tab = p.id.replace('panel-', '');
      p.querySelectorAll('.subcard').forEach(function (c) {
        var h = c.querySelector('h3');
        index.push({ tab: tab, el: c, h: h ? h.textContent.replace(/^\s*\d+/, '').trim() : '', txt: norm(c.textContent), raw: c.textContent.replace(/\s+/g, ' ').replace(/^\s*\d+/, '') });
      });
    });
  }
  function renderSearch() {
    if (!index) buildIndex();
    body.innerHTML = '<label class="academy-label" for="academy-q">Buscar en todas las guías</label>' +
      '<input id="academy-q" class="academy-input" type="search" placeholder="Ej.: partograma, código rojo, sangrado, trombofilia" autocomplete="off">' +
      '<p class="academy-meta" id="academy-count"></p><div id="academy-res"></div>';
    var inp = document.getElementById('academy-q');
    inp.addEventListener('input', function () { doSearch(inp.value); });
    setTimeout(function () { inp.focus(); }, 30);
  }
  /* Sinónimos clínicos: cada término coincide con cualquiera de sus variantes */
  var SIN = [
    ['sangrado', 'hemorragia', 'hpp', 'codigo rojo'],
    ['partograma', 'partograph', 'labour care guide', 'trabajo de parto'],
    ['trombofilia', 'trombo', 'tromboprofilaxis', 'hbpm'],
    ['preeclampsia', 'thae', 'eclampsia', 'hipertensi'],
    ['sepsis', 'infeccion', 'codigo amarillo'],
    ['paro', 'rcp', 'codigo azul'],
    ['cesarea', 'via del parto', 'robson'],
    ['rpm', 'rotura prematura', 'membranas']
  ];
  function variantes(t) {
    for (var i = 0; i < SIN.length; i++) {
      if (SIN[i].some(function (x) { return x === t || (t.length > 3 && x.indexOf(t) === 0); })) return SIN[i].concat([t]);
    }
    return [t];
  }
  function terminos(v) {
    var n = norm(v).trim(), out = [];
    SIN.forEach(function (g) { g.forEach(function (x) { if (x.indexOf(' ') > -1 && n.indexOf(x) > -1) { out.push(x); n = n.replace(x, ' '); } }); });
    return out.concat(n.split(/\s+/).filter(function (t) { return t.length > 1; }));
  }
  /* Búsqueda con puntaje (título ×3), como el buscador de la Historia Clínica */
  function buscar(v) {
    if (!index) buildIndex();
    var terms = terminos(v);
    if (!terms.length) return { terms: [], hits: [] };
    var hits = [];
    index.forEach(function (it) {
      var hn = norm(it.h), score = 0, ok = terms.every(function (t) {
        var vs = variantes(t), best = 0;
        vs.forEach(function (x) {
          var sc = 0;
          if (hn.indexOf(x) > -1) sc += 3;
          var c = it.txt.split(x).length - 1; if (c) sc += Math.min(5, c);
          if (x === t) sc *= 2; /* el término escrito pesa más que sus sinónimos */
          if (sc > best) best = sc;
        });
        score += best; return best > 0;
      });
      if (ok) hits.push({ it: it, score: score });
    });
    hits.sort(function (a, b) { return b.score - a.score; });
    return { terms: terms, hits: hits.map(function (h) { return h.it; }) };
  }
  function pintar(res, cnt, r) {
    if (!r.terms.length) { res.innerHTML = ''; cnt.textContent = ''; return; }
    cnt.textContent = r.hits.length + (r.hits.length === 1 ? ' ficha encontrada' : ' fichas encontradas');
    res.innerHTML = '';
    r.hits.slice(0, 40).forEach(function (it) {
      var raw = norm(it.raw), i = -1;
      variantes(r.terms[0]).some(function (x) { i = raw.indexOf(x); return i > -1; });
      var s = Math.max(0, i - 60);
      var snip = (s > 0 ? '…' : '') + it.raw.substr(s, 170) + '…';
      var d = document.createElement('div'); d.className = 'academy-item';
      d.innerHTML = '<div class="academy-item-h"><span class="academy-chip">' + esc(tabName(it.tab)) + '</span> ' + esc(it.h) + '</div><p>' + esc(snip) + '</p>';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'academy-go'; b.dataset.tab = it.tab; b._el = it.el; b.textContent = 'Abrir ficha →';
      d.appendChild(b); res.appendChild(d);
    });
  }
  function doSearch(v) { pintar(document.getElementById('academy-res'), document.getElementById('academy-count'), buscar(v)); }

  /* Barra de búsqueda visible en la página de guías */
  var gq = document.getElementById('guia-q');
  if (gq) {
    var gres = document.getElementById('guia-res'), gcnt = document.getElementById('guia-count');
    gq.addEventListener('input', function () { pintar(gres, gcnt, buscar(gq.value)); });
    gres.addEventListener('click', function (ev) {
      var g = ev.target.closest('.academy-go'); if (!g) return;
      goTo(g.dataset.tab, g.dataset.card, g._el);
    });
  }
  window.CaVeSalBuscarGuias = function (v) { return buscar(v).hits.map(function (it) { return it.tab + ' · ' + it.h; }); };

  /* ---------- Glosario ---------- */
  function renderGlosario() {
    var list = G.slice().sort(function (a, b) { return a.t.localeCompare(b.t, 'es'); });
    body.innerHTML = '<label class="academy-label" for="academy-gq">Filtrar términos</label>' +
      '<input id="academy-gq" class="academy-input" type="search" placeholder="Ej.: índice, HELLP, FAST" autocomplete="off">' +
      '<p class="academy-meta">' + list.length + ' términos. Cada definición resume una ficha de las Guías, donde figura la fuente.</p><dl class="academy-gl" id="academy-gl"></dl>';
    var dl = document.getElementById('academy-gl');
    function draw(f) {
      var n = norm(f);
      dl.innerHTML = list.filter(function (x) { return !n || norm(x.t + ' ' + x.d).indexOf(n) > -1; }).map(function (x) {
        return '<div class="academy-item"><dt>' + esc(x.t) + '</dt><dd>' + esc(x.d) + '</dd>' + linkBtn(x.tab, x.card) + '</div>';
      }).join('') || '<p class="academy-meta">Sin coincidencias.</p>';
    }
    draw('');
    document.getElementById('academy-gq').addEventListener('input', function (e) { draw(e.target.value); });
  }

  /* ---------- Autoevaluación ---------- */
  var qs, qi, score;
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function renderQuizStart() {
    body.innerHTML = '<p>Preguntas de opción múltiple sobre el contenido de las Guías. Al responder ves la explicación y el enlace a la ficha con su fuente.</p>' +
      '<div class="academy-row"><button type="button" class="academy-btn" data-n="10">10 preguntas al azar</button>' +
      '<button type="button" class="academy-btn ghost" data-n="' + Q.length + '">Todas (' + Q.length + ')</button></div>';
    body.querySelectorAll('.academy-btn').forEach(function (b) {
      b.addEventListener('click', function () { qs = shuffle(Q.slice()).slice(0, +b.dataset.n); qi = 0; score = 0; renderQ(); });
    });
  }
  function renderQ() {
    if (qi >= qs.length) return renderEnd();
    var x = qs[qi];
    body.innerHTML = '<p class="academy-meta">Pregunta ' + (qi + 1) + ' de ' + qs.length + ' · Aciertos: ' + score + '</p>' +
      '<p class="academy-q">' + esc(x.q) + '</p><div class="academy-opts">' +
      x.o.map(function (o, i) { return '<button type="button" class="academy-opt" data-i="' + i + '">' + esc(o) + '</button>'; }).join('') +
      '</div><div id="academy-fb"></div>';
    body.querySelectorAll('.academy-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.dataset.i, ok = i === x.a; if (ok) score++;
        body.querySelectorAll('.academy-opt').forEach(function (bb, k) {
          bb.disabled = true; if (k === x.a) bb.classList.add('ok'); else if (k === i) bb.classList.add('bad');
        });
        document.getElementById('academy-fb').innerHTML = '<div class="academy-fb ' + (ok ? 'ok' : 'bad') + '"><strong>' + (ok ? 'Correcto.' : 'Incorrecto.') + '</strong> ' + esc(x.e) + '</div>' +
          linkBtn(x.tab, x.card) + ' <button type="button" class="academy-btn" id="academy-next">' + (qi + 1 < qs.length ? 'Siguiente' : 'Ver resultado') + '</button>';
        document.getElementById('academy-next').addEventListener('click', function () { qi++; renderQ(); });
      });
    });
  }
  function renderEnd() {
    var pct = Math.round(100 * score / qs.length);
    body.innerHTML = '<p class="academy-q">Resultado: ' + score + ' de ' + qs.length + ' (' + pct + ' %)</p>' +
      '<p class="academy-meta">Autoevaluación formativa: no se guarda ni se envía ningún dato.</p>' +
      '<div class="academy-row"><button type="button" class="academy-btn" id="academy-again">Repetir</button></div>';
    document.getElementById('academy-again').addEventListener('click', renderQuizStart);
  }

  var views = { buscar: ['Buscador', renderSearch], glosario: ['Glosario', renderGlosario], quiz: ['Autoevaluación', renderQuizStart] };
  function open(v) {
    title.textContent = 'CaVeSal® Academy — ' + views[v][0];
    document.querySelectorAll('[data-academy]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.academy === v ? 'true' : 'false'); });
    views[v][1]();
    if (!dlg.open) dlg.showModal();
  }
  document.querySelectorAll('[data-academy]').forEach(function (b) { b.addEventListener('click', function () { open(b.dataset.academy); }); });
  document.getElementById('academy-close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !dlg.open && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open('buscar'); }
  });
})();
