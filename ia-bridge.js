/**
 * Puente Emergencias → CaVeSal® IA ("Analizar con CaVeSal® IA").
 *
 * Mismo patrón que la Calculadora Prenatal (buildCavesalIAContext /
 * analizarConCavesalIA) y que ia-bridge.ts de la Historia Clínica: abre
 * chat.html con el caso codificado en `?context=`. chat.html decodifica con
 * decodeURIComponent(escape(atob(...))) (cavesal-ia-core.js /
 * leerContextoEntranteDesdeURL), así que acá se codifica con el inverso exacto:
 * btoa(unescape(encodeURIComponent(...))) y luego encodeURIComponent para que
 * '+', '/' o '=' del base64 no se rompan en la query string.
 *
 * "Candado solo visual": el botón siempre abre CaVeSal® IA con los datos del
 * caso; el control real de plan/acceso lo hace la propia CaVeSal® IA.
 *
 * El contexto se arma leyendo el DOM de la Calculadora (resultados visibles,
 * no neutros), sin nombre ni documento de la paciente. Se envía solo
 * hallazgo + nivel (sin conducta ni fuente) para no superar el límite
 * práctico de ~13.000 caracteres de la URL.
 */
(function () {
  "use strict";

  var CAVESAL_IA_URL = "https://ia.cavesal.app/chat.html";

  var RESULTADOS = [
    { id: "result-velez", tipo: "choque_hipovolemico_velez", categoria: "codigo_rojo" },
    { id: "result-eapo", tipo: "alerta_obstetrica", categoria: "alerta_precoz" },
    { id: "result-hellp", tipo: "hellp", categoria: "thae" },
    { id: "result-thae-clasif", tipo: "thae_clasificacion", categoria: "thae" },
    { id: "result-pe-grave", tipo: "preeclampsia_criterios_severidad", categoria: "thae" },
    { id: "result-sflt", tipo: "sflt1_plgf", categoria: "thae" },
    { id: "result-ao", tipo: "doppler_arteria_oftalmica", categoria: "thae" },
    { id: "result-tamfc", tipo: "tam_fc_fenotipo", categoria: "thae" },
    { id: "result-sepsis", tipo: "sepsis_materna", categoria: "codigo_amarillo" },
    { id: "result-qsofa", tipo: "qsofa", categoria: "codigo_amarillo" },
    { id: "result-sirs", tipo: "sirs", categoria: "codigo_amarillo" },
    { id: "result-meows", tipo: "meows", categoria: "codigo_amarillo" },
    { id: "result-trombo", tipo: "tromboprofilaxis_semaforo", categoria: "tromboprofilaxis" },
    { id: "result-vol", tipo: "volemia_estimada", categoria: "codigo_rojo" },
    { id: "result-qbl", tipo: "cuantificacion_sangrado", categoria: "codigo_rojo" },
    { id: "result-cid", tipo: "coagulopatia_cid", categoria: "codigo_rojo" },
    { id: "result-rot", tipo: "rotem", categoria: "codigo_rojo" }
  ];

  var ESCALA_ALERTA_LABEL = {
    eapo: "EAPO MSPBS 2025/2022",
    mama: "Score MAMÁ 2025 (MSP Ecuador)",
    hibrida: "Alerta Obstétrica CaVeSal® (EAPO + Score MAMÁ)"
  };

  var NIVEL_RB = { "rb-verde": "verde", "rb-amarillo": "amarillo", "rb-naranja": "naranja", "rb-rojo": "rojo" };

  function el(id) { return document.getElementById(id); }
  function txt(id) {
    var e = el(id);
    return e ? (e.textContent || "").replace(/\s+/g, " ").trim() : "";
  }
  function visible(e) {
    if (!e) return false;
    if (e.style && e.style.display === "none") return false;
    return e.offsetParent !== null || e.getClientRects().length > 0 || e.closest(".code-section");
  }
  function num(id) {
    var e = el(id);
    if (!e || e.value === "") return null;
    var n = parseFloat(e.value);
    return isNaN(n) ? null : n;
  }
  function recortar(s, max) {
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  }
  function nivelDe(box) {
    for (var k in NIVEL_RB) if (box.classList.contains(k)) return NIVEL_RB[k];
    return null;
  }

  function buildEmergenciasIAContext() {
    var clinical_findings = [];
    var risk_calculations = [];
    var alerts = [];

    // Datos comunes de la barra de paciente
    var fum = (el("in-fum") && el("in-fum").value) || null;
    var eg = txt("ro-eg-value");
    var egM = eg.match(/^(\d+)s\s+(\d+)d$/);
    var signos = [];
    var pas = num("in-pas"), pad = num("in-pad"), fc = num("in-fc");
    if (pas !== null && pad !== null) signos.push("PA " + pas + "/" + pad + " mmHg");
    if (fc !== null) signos.push("FC " + fc + " lpm");
    if (signos.length) clinical_findings.push({ categoria: "signos_vitales", descripcion: signos.join(" · ") });

    [["ro-imc", "IMC"], ["ro-pam", "PAM"], ["ro-si", "Índice de shock"]].forEach(function (r) {
      var v = txt(r[0] + "-value");
      if (v && v !== "—") {
        var sub = txt(r[0] + "-sub");
        clinical_findings.push({ categoria: "calculo_basico", descripcion: r[1] + ": " + v + (sub ? " [" + sub + "]" : "") });
      }
    });

    // Escala de Alerta Obstétrica elegida (EAPO / Score MAMÁ / híbrida CaVeSal®):
    // se necesita saber cuál de las tres se usó, no solo que hubo una "eapo_mspbs" genérica.
    var escalaSel = el("alerta-escala");
    var escalaVal = escalaSel ? escalaSel.value : null;
    var escalaLabel = escalaVal ? (ESCALA_ALERTA_LABEL[escalaVal] || escalaVal) : null;

    // Resultados de cada módulo (solo los visibles y no neutros)
    RESULTADOS.forEach(function (r) {
      var box = el(r.id);
      if (!box || box.classList.contains("rb-neutro") || !visible(box)) return;
      var titulo = txt(r.id + "-title");
      if (!titulo) return;
      var nivel = nivelDe(box);
      var esEapo = r.id === "result-eapo";
      var prefijo = esEapo && escalaLabel ? escalaLabel + " — " : "";
      risk_calculations.push({
        tipo: esEapo && escalaVal ? "alerta_obstetrica_" + escalaVal : r.tipo,
        resultado: recortar(prefijo + titulo, 220),
        riesgo: nivel,
        fecha: null
      });
      clinical_findings.push({ categoria: r.categoria, descripcion: recortar(prefijo + titulo, 220) + (nivel ? " [" + nivel + "]" : "") });
    });

    // Escalada de hemorragia (Nivel 0-3): solo si se marcó alguna maniobra
    var algunaManiobra = document.querySelector("[data-nivel]:checked");
    if (algunaManiobra) {
      risk_calculations.push({ tipo: "escalada_hemorragia", resultado: txt("badge-nivel"), riesgo: null, fecha: null });
    }

    // Alertas activas
    ["alert-codigo-rojo", "alert-thae", "alert-sepsis"].forEach(function (id) {
      var a = el(id);
      if (a && a.classList.contains("show")) {
        var t = txt(id + "-text");
        if (t) alerts.push(recortar(t, 220));
      }
    });

    if (!clinical_findings.length && !risk_calculations.length && !alerts.length) return null;

    var egSem = egM ? parseInt(egM[1], 10) : null;
    var egDias = egM ? parseInt(egM[2], 10) : null;

    return {
      source_module: "emergencias",
      scope_authorized: "calculo_actual",
      // Sin nombre ni documento: la Calculadora de Emergencias no los recolecta.
      patient_summary: null,
      pregnancy_context: {
        fum: fum,
        eg_semanas: egSem,
        eg_dias: egDias,
        fpp: null,
        gestas: null,
        paridad: null,
        clasificacion_riesgo: null
      },
      clinical_findings: clinical_findings,
      labs: [],
      ultrasound: [],
      medications: [],
      risk_calculations: risk_calculations,
      alerts: alerts
    };
  }

  function analizarConCavesalIA() {
    var ctx = buildEmergenciasIAContext();
    if (!ctx) {
      alert("Primero cargá datos en la barra de paciente o en algún módulo para poder analizar el caso con CaVeSal® IA.");
      return;
    }
    var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(ctx))));
    window.open(CAVESAL_IA_URL + "?context=" + encodeURIComponent(encoded), "_blank", "noopener,noreferrer");
  }

  window.buildEmergenciasIAContext = buildEmergenciasIAContext;
  window.analizarConCavesalIA = analizarConCavesalIA;

  document.addEventListener("DOMContentLoaded", function () {
    var btn = el("btn-cavesal-ia");
    if (btn) btn.addEventListener("click", analizarConCavesalIA);
  });
})();
