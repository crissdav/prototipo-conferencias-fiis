/* Reportes y estadísticas (ReportesDashboard.tsx): pestañas, filtros, exportar a Excel e imprimir. */
;(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
  const money = (n, min2) => n.toLocaleString("es-PE", min2 ? { minimumFractionDigits: 2 } : undefined)

  const TABS = [
    { key: "resumen", label: "Visión General", icon: "Layers" },
    { key: "inscripciones", label: "Inscripciones", icon: "Users" },
    { key: "financiero", label: "Finanzas", icon: "DollarSign" },
    { key: "asistencia", label: "Asistencia", icon: "CalendarCheck" },
    { key: "talleres", label: "Talleres y Aforos", icon: "Wrench" },
    { key: "certificacion", label: "Certificación", icon: "Award" },
  ]

  window.ReportesDashboard = function (root, data) {
    const { inscripciones, financiero, asistencia, talleres, certificacion } = data
    const state = { tab: "resumen", categoria: "todas", institucion: "todas", busqueda: "" }

    const participantesFiltrados = () =>
      inscripciones.participantes.filter((p) => {
        const q = state.busqueda.toLowerCase()
        return (
          (state.categoria === "todas" || p.categoria === state.categoria) &&
          (state.institucion === "todas" || p.institucion === state.institucion) &&
          (q === "" || p.nombre_completo.toLowerCase().includes(q) || p.numero_documento.includes(state.busqueda) || p.institucion.toLowerCase().includes(q))
        )
      })

    const pagosFiltrados = () =>
      financiero.pagos_detalle.filter((p) => {
        const q = state.busqueda.toLowerCase()
        return (state.categoria === "todas" || p.categoria === state.categoria) && (q === "" || p.participante_nombre.toLowerCase().includes(q) || p.dni.includes(state.busqueda))
      })

    // Exportar a Excel (CSV compatible con Excel Windows con BOM UTF-8)
    function descargarExcel(seccion) {
      let csv = "﻿"
      if (seccion === "inscripciones") {
        csv += "ID;NOMBRES Y APELLIDOS;DNI;EMAIL;TELEFONO;CATEGORIA;INSTITUCION;ACTIVIDAD;FECHA\n"
        participantesFiltrados().forEach((p) => {
          csv += `${p.id};"${p.nombre_completo}";${p.numero_documento};${p.email};${p.telefono};${p.categoria};"${p.institucion}";${p.tipo_actividad};${p.fecha_inscripcion}\n`
        })
      } else if (seccion === "financiero") {
        csv += "ID;PARTICIPANTE;DNI;CATEGORIA;CONCEPTO;METODO;MONTO BRUTO;COMISION;MONTO NETO;FECHA\n"
        pagosFiltrados().forEach((p) => {
          csv += `${p.id};"${p.participante_nombre}";${p.dni};${p.categoria};${p.concepto};${p.metodo};${p.monto_bruto};${p.comision_pasarela};${p.monto_neto};${p.fecha_pago}\n`
        })
      } else if (seccion === "talleres") {
        csv += "ID;TALLER;PONENTE;UBICACION;FECHA;HORARIO;AFORO MAX;CUPOS OCUPADOS;CUPOS DISP;OCUPACION (%)\n"
        talleres.talleres.forEach((t) => {
          csv += `${t.id};"${t.titulo}";"${t.ponente}";"${t.ubicacion}";${t.fecha};"${t.horario}";${t.aforo_maximo};${t.cupos_ocupados};${t.cupos_disponibles};${t.porcentaje_ocupacion}%\n`
        })
      } else if (seccion === "certificacion") {
        csv += "ID;CODIGO;TIPO;PARTICIPANTE;DNI;EMAIL;HORAS;ESTADO ENVIO;FECHA\n"
        certificacion.listado.forEach((d) => {
          csv += `${d.id};${d.codigo_verificacion};${d.tipo};"${d.participante_nombre}";${d.dni};${d.email};${d.horas_academicas};${d.estado_envio};${d.fecha_emision ?? ""}\n`
        })
      } else {
        csv += "METRICA;VALOR\n"
        csv += `Total Participantes Inscritos;${inscripciones.resumen.total_inscritos}\n`
        csv += `Estudiantes;${inscripciones.resumen.estudiantes}\n`
        csv += `Publico General;${inscripciones.resumen.publico_general}\n`
        csv += `Recaudacion Bruta (S/);${financiero.resumen.total_recaudado_bruto}\n`
        csv += `Comisiones Pasarela (S/);${financiero.resumen.total_comisiones_pasarela}\n`
        csv += `Recaudacion Neta (S/);${financiero.resumen.total_neto_recibido}\n`
        csv += `Cobrado en Efectivo (S/);${financiero.resumen.total_efectivo}\n`
        csv += `Asistentes Dia 1;${asistencia.conferencias.dia_1.asistentes}\n`
        csv += `Asistentes Dia 2;${asistencia.conferencias.dia_2.asistentes}\n`
        csv += `Asistieron Ambos Dias;${asistencia.conferencias.ambos_dias.total}\n`
        csv += `Certificados Generados;${certificacion.resumen.total_certificados}\n`
        csv += `Constancias Generadas;${certificacion.resumen.total_constancias}\n`
        csv += `Documentos Enviados;${certificacion.resumen.enviados_correctamente}\n`
      }
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }))
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte_${seccion}_fiis2026.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    // ── Bloques reutilizables ──────────────────────────────────

    const mini = (label, value, valueCls, note, noteCls) =>
      `<div class="card card--sm mini"><span class="mini__label">${label}</span><p class="mini__value ${valueCls || ""}">${value}</p><span class="mini__note ${noteCls || ""}">${note}</span></div>`

    const table = (heads, rows, compact) =>
      `<div class="table-scroll"><table class="rep-table${compact ? " rep-table--compact" : ""}"><thead><tr>${heads
        .map(([h, cls]) => `<th class="${cls || ""}">${h}</th>`)
        .join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`

    const pctBar = (value, fillCls, small) =>
      `<div class="bar-inline"><div class="bar bar--sm${small ? " w-16" : ""}"><div class="${fillCls || ""}" style="width:${value}%"></div></div><span class="fw-semibold t-ink">${value}%</span></div>`

    // ── Barra superior y KPIs ──────────────────────────────────

    function header() {
      const r = inscripciones.resumen
      const f = financiero.resumen
      const c = asistencia.conferencias
      const ce = certificacion.resumen
      const kpi = (label, iconName, iconCls, value, left, right, rightCls) => `
        <div class="card kpi">
          <div class="kpi__head"><span class="kpi__label">${label}</span><span class="kpi__icon ${iconCls}">${icon(iconName)}</span></div>
          <p class="kpi__value">${value}</p>
          <div class="kpi__foot"><span>${left}</span><span class="fw-semibold ${rightCls}">${right}</span></div>
        </div>`

      return `
        <div class="card rep-toolbar print-hidden">
          <div>
            <div class="row"><span class="live-pill"><span></span>Datos en Vivo</span><span style="font-size:.75rem" class="t-mist">Actualizado al corte de hoy</span></div>
            <p class="fw-medium t-ink" style="margin-top:.25rem;font-size:.875rem">Facultad de Ingeniería en Informática y Sistemas — UNAS</p>
          </div>
          <div class="rep-actions">
            <button type="button" class="rep-btn rep-btn--excel" title="Descargar datos en formato Excel (.csv compatible)" data-excel>${icon("FileSpreadsheet")}Exportar Excel</button>
            <button type="button" class="rep-btn rep-btn--pdf" title="Generar reporte imprimible o exportar a PDF" data-print>${icon("Printer")}Imprimir / PDF</button>
          </div>
        </div>
        <div class="kpi-grid">
          ${kpi("Inscritos Totales", "Users", "bg-blue50 t-leaf", r.total_inscritos, `${r.estudiantes} Estudiantes`, `${r.publico_general} Público`, "t-leaf")}
          ${kpi("Recaudación Neta", "DollarSign", "bg-emerald50 t-emerald6", `S/ ${money(f.total_neto_recibido, true)}`, `Bruto: S/ ${money(f.total_recaudado_bruto)}`, "Neto 96.4%", "t-emerald7")}
          ${kpi("Asistencia General", "CalendarCheck", "bg-indigo50", `${c.dia_1.porcentaje}%`, `${c.dia_1.asistentes} en Día 1`, `${c.dia_2.asistentes} en Día 2`, "t-indigo7")}
          ${kpi("Documentos Emitidos", "Award", "bg-amber50", ce.total_documentos, `${ce.enviados_correctamente} Enviados`, `${ce.tasa_entrega}% éxito`, "t-emerald7")}
        </div>
        <div class="rep-tabs print-hidden"><nav>${TABS.map(
          (t) => `<button type="button" class="rep-tab${state.tab === t.key ? " is-active" : ""}" data-tab="${t.key}">${icon(t.icon)}${t.label}</button>`,
        ).join("")}</nav></div>`
    }

    // ── Pestañas ───────────────────────────────────────────────

    function tabResumen() {
      const r = inscripciones.resumen
      const pm = financiero.por_metodo
      const pc = financiero.por_concepto
      const alerta = talleres.talleres_aforo_maximo.length
        ? `<div class="rep-alert">${icon("AlertTriangle", { cls: "shrink-0" })}
            <div>
              <p class="fw-semibold t-amber9">${talleres.talleres_aforo_maximo.length} talleres alcanzaron su Aforo Máximo (100% de cupos)</p>
              <div class="chip-list">${talleres.talleres_aforo_maximo
                .map((t) => `<span class="chip-amber">${icon("Check")}${esc(t.titulo)}: ${t.cupos_ocupados}/${t.aforo_maximo} cupos</span>`)
                .join("")}</div>
            </div>
          </div>`
        : ""

      return `
        <div class="rep-stack">
          ${alerta}
          <div class="two-col">
            <div class="card p-5">
              <h3 class="card-title-base">Distribución de Participantes</h3>
              <p class="card-sub">Estudiantes vs. Público general e instituciones</p>
              <div class="bar-row">
                <div>
                  <div class="bar-label"><span>Estudiantes (66.7%)</span><span>${r.estudiantes} alumnos</span></div>
                  <div class="bar"><div style="width:${(r.estudiantes / r.total_inscritos) * 100}%"></div></div>
                </div>
                <div>
                  <div class="bar-label"><span>Público General &amp; Profesionales (33.3%)</span><span>${r.publico_general} inscritos</span></div>
                  <div class="bar"><div class="fill-emerald" style="width:${(r.publico_general / r.total_inscritos) * 100}%"></div></div>
                </div>
              </div>
              <div class="card-section">
                <p class="eyebrow-sm">Top Instituciones</p>
                <div class="inst-list">${inscripciones.por_institucion
                  .slice(0, 4)
                  .map((i) => `<div class="inst-row"><span>${esc(i.institucion)}</span><span class="tag-slate">${i.total} (${i.porcentaje}%)</span></div>`)
                  .join("")}</div>
              </div>
            </div>

            <div class="card p-5">
              <h3 class="card-title-base">Canales de Cobro</h3>
              <p class="card-sub">Comparativa Pasarela de Pago vs. Cobro en Efectivo</p>
              <div class="channel-grid">
                <div class="channel channel--blue">
                  <div class="channel__head t-leaf">${icon("CreditCard")}<span>Pasarela Web</span></div>
                  <p class="channel__value">S/ ${money(pm.pasarela.bruto)}</p>
                  <p class="channel__note t-mist">Comisión: -S/ ${pm.pasarela.comisiones.toFixed(2)}</p>
                  <span class="channel__tag bg-leaf10 t-leaf">${pm.pasarela.transacciones} pagos en línea</span>
                </div>
                <div class="channel channel--green">
                  <div class="channel__head t-emerald7">${icon("Wallet")}<span>Efectivo (Caja)</span></div>
                  <p class="channel__value">S/ ${money(pm.efectivo.bruto)}</p>
                  <p class="channel__note t-emerald7 fw-medium">Sin comisión (100% neto)</p>
                  <span class="channel__tag bg-emerald100 t-emerald8">${pm.efectivo.transacciones} recibos emitidos</span>
                </div>
              </div>
              <div class="card-section">
                <p class="eyebrow-sm">Recaudación por Actividad</p>
                <div class="concept-grid">
                  <div><span>Conferencias</span><strong class="t-ink">S/ ${pc.conferencias}</strong></div>
                  <div><span>Talleres</span><strong class="t-ink">S/ ${pc.talleres}</strong></div>
                  <div><span>Ambas</span><strong class="t-leaf">S/ ${pc.ambas}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>`
    }

    function filtros() {
      const opt = (v, l, cur) => `<option value="${esc(v)}" ${cur === v ? "selected" : ""}>${esc(l)}</option>`
      return `
        <div class="card card--sm filters">
          <div class="filters__label">${icon("Filter")}<span>Filtros:</span></div>
          <div class="filters__controls">
            <select class="filter-input" data-filter="categoria">
              ${opt("todas", "Todas las categorías", state.categoria)}${opt("estudiante", "Solo Estudiantes", state.categoria)}${opt("publico_general", "Público General", state.categoria)}
            </select>
            <select class="filter-input" data-filter="institucion">
              ${opt("todas", "Todas las instituciones", state.institucion)}${inscripciones.filtros_disponibles.instituciones.map((i) => opt(i, i, state.institucion)).join("")}
            </select>
            <div class="filter-search">${icon("Search")}<input type="text" class="filter-input" placeholder="Buscar participante..." value="${esc(state.busqueda)}" data-filter="busqueda" /></div>
          </div>
        </div>`
    }

    function filasInscritos() {
      return participantesFiltrados()
        .slice(0, 15)
        .map(
          (p) => `<tr>
            <td class="fw-semibold t-ink">${esc(p.nombre_completo)}</td>
            <td class="mono t-mist">${p.numero_documento}</td>
            <td><span class="badge ${p.categoria === "estudiante" ? "badge--blue" : "badge--green"}">${p.categoria === "estudiante" ? "Estudiante" : "Público General"}</span></td>
            <td class="t-mist">${esc(p.institucion)}</td>
            <td><span class="mono fs-07 t-ink capitalize">${p.tipo_actividad.replace("_", " ")}</span></td>
            <td class="mono fs-07 t-fog">${p.codigo_barras}</td>
            <td class="t-mist">${p.fecha_inscripcion}</td>
          </tr>`,
        )
    }

    function tabInscripciones() {
      const r = inscripciones.resumen
      return `
        <div class="rep-stack">
          ${filtros()}
          <div class="mini-grid-3">
            ${mini("Solo Conferencias", r.solo_conferencias, "", "Auditorio Central", "t-leaf")}
            ${mini("Solo Talleres", r.solo_talleres, "", "Laboratorios de cómputo", "t-emerald6")}
            ${mini("Ambas Actividades", r.ambas, "t-leaf", "Acceso completo", "t-slate5")}
          </div>
          <div class="card card--sm p-5">
            <h3 class="card-title-sm mb-4">Participantes por Universidad / Instituto</h3>
            <div class="inst-bars">${inscripciones.por_institucion
              .map(
                (i) => `<div>
                  <div class="bar-label"><span class="fw-medium">${esc(i.institucion)}</span><span class="fw-semibold t-leaf">${i.total} inscritos (${i.porcentaje}%)</span></div>
                  <div class="bar bar--md"><div style="width:${i.porcentaje}%"></div></div>
                </div>`,
              )
              .join("")}</div>
          </div>
          <div class="card card--sm card--clip">
            <div class="table-head"><h3 class="card-title-sm" id="inscritos-titulo">Listado Detallado de Inscritos (${participantesFiltrados().length})</h3><span>Mostrando registros según filtros</span></div>
            <div id="inscritos-tabla">${table(
              [["Participante"], ["DNI"], ["Categoría"], ["Institución"], ["Actividad"], ["Código"], ["Fecha"]],
              filasInscritos(),
            )}</div>
          </div>
        </div>`
    }

    function filasPagos() {
      return pagosFiltrados()
        .slice(0, 15)
        .map(
          (p) => `<tr>
            <td class="fw-semibold t-ink">${esc(p.participante_nombre)}</td>
            <td class="mono t-mist">${p.dni}</td>
            <td class="capitalize t-mist">${p.categoria.replace("_", " ")}</td>
            <td class="capitalize t-mist">${p.concepto}</td>
            <td><span class="badge ${p.metodo === "pasarela" ? "badge--blue" : "badge--green"}">${p.metodo}</span></td>
            <td class="fw-semibold ta-right t-ink">S/ ${p.monto_bruto.toFixed(2)}</td>
            <td class="ta-right t-rose6">-S/ ${p.comision_pasarela.toFixed(2)}</td>
            <td class="fw-bold ta-right t-emerald7">S/ ${p.monto_neto.toFixed(2)}</td>
            <td class="mono fs-07 t-fog">${p.numero_operacion ?? "Efectivo"}</td>
          </tr>`,
        )
    }

    function tabFinanciero() {
      const f = financiero.resumen
      return `
        <div class="rep-stack">
          <div class="mini-grid-4">
            ${mini("Recaudado Bruto", `S/ ${money(f.total_recaudado_bruto, true)}`, "", "100% transacciones", "t-slate5")}
            ${mini("Comisiones Pasarela", `-S/ ${f.total_comisiones_pasarela.toFixed(2)}`, "t-rose6", "Deducido en pasarela", "t-rose6")}
            ${mini("Neto Recibido", `S/ ${money(f.total_neto_recibido, true)}`, "t-emerald6", "Importe neto real", "t-emerald7")}
            ${mini("Cobrado en Efectivo", `S/ ${money(f.total_efectivo, true)}`, "t-leaf", "En caja física", "t-leaf")}
          </div>
          <div class="card card--sm cash-card">
            <div class="cash-head">
              <div>
                <h3 class="card-title-sm t-emerald9">${icon("Wallet", { cls: "t-emerald6" })}Registro de Cobros en Efectivo</h3>
                <p class="card-sub mt-05">Importes recaudados presencialmente en caja para cuadre</p>
              </div>
              <span class="cash-total">Total Caja: S/ ${f.total_efectivo.toFixed(2)}</span>
            </div>
            <div style="margin-top:1rem">${table(
              [["Recibo N°"], ["Participante"], ["DNI"], ["Concepto"], ["Importe Cobrado", "ta-right"], ["Registrador / Caja"], ["Fecha"]],
              financiero.cobros_efectivo.slice(0, 10).map(
                (c) => `<tr>
                  <td class="mono fw-medium t-emerald8">${c.numero_recibo}</td>
                  <td class="fw-semibold t-ink">${esc(c.participante_nombre)}</td>
                  <td class="mono t-mist">${c.dni}</td>
                  <td class="capitalize t-mist">${c.concepto}</td>
                  <td class="fw-bold ta-right t-emerald7">S/ ${c.monto.toFixed(2)}</td>
                  <td class="t-mist">${esc(c.registrado_por)}</td>
                  <td class="t-mist">${c.fecha_pago}</td>
                </tr>`,
              ),
              true,
            )}</div>
          </div>
          <div class="card card--sm card--clip">
            <div class="table-head"><h3 class="card-title-sm">Detalle de Importe Pagado por Participante</h3><span>${pagosFiltrados().length} registros</span></div>
            ${table(
              [["Participante"], ["DNI"], ["Categoría"], ["Concepto"], ["Método"], ["Monto Bruto", "ta-right"], ["Comisión", "ta-right"], ["Neto", "ta-right"], ["Operación"]],
              filasPagos(),
            )}
          </div>
        </div>`
    }

    function tabAsistencia() {
      const c = asistencia.conferencias
      const v = (n, p) => `${n} <small>(${p}%)</small>`
      return `
        <div class="rep-stack">
          <div class="mini-grid-4">
            ${mini("Asistencia Día 1 (25 nov)", v(c.dia_1.asistentes, c.dia_1.porcentaje), "", "Conferencias Magistrales", "t-leaf")}
            ${mini("Asistencia Día 2 (26 nov)", v(c.dia_2.asistentes, c.dia_2.porcentaje), "", "Jornada de Clausura", "t-leaf")}
            ${mini("Asistieron Ambos Días", v(c.ambos_dias.total, c.ambos_dias.porcentaje), "t-emerald6", "Aptos para Certificado (30h)", "t-emerald7")}
            ${mini("Ausentes", v(c.ausentes.total, c.ausentes.porcentaje), "t-rose6", "Sin marcas de asistencia", "t-rose6")}
          </div>
          <div class="card card--sm card--clip">
            <div class="table-head"><div><h3 class="card-title-sm">Asistencias Registradas en Cada Taller</h3><p class="card-sub mt-05">Control de asistencia y porcentaje real de asistencia</p></div></div>
            ${table(
              [["Taller"], ["Ponente / Lab"], ["Fecha"], ["Inscritos", "ta-center"], ["Asistentes", "ta-center"], ["Ausentes", "ta-center"], ["% Asistencia"]],
              asistencia.talleres.map(
                (t) => `<tr>
                  <td class="fw-semibold t-ink">${esc(t.titulo)}</td>
                  <td class="t-mist">${esc(t.ponente)} <span class="t-fog">(${esc(t.ubicacion)})</span></td>
                  <td class="t-mist nowrap">${t.fecha}</td>
                  <td class="ta-center fw-bold t-ink">${t.inscritos}</td>
                  <td class="ta-center fw-bold t-emerald7">${t.asistentes}</td>
                  <td class="ta-center t-rose6">${t.ausentes}</td>
                  <td>${pctBar(t.porcentaje_asistencia, "fill-emerald")}</td>
                </tr>`,
              ),
            )}
          </div>
        </div>`
    }

    function tabTalleres() {
      const r = talleres.resumen
      return `
        <div class="rep-stack">
          <div class="mini-grid-4">
            ${mini("Aforo Total Talleres", r.aforo_total, "", "6 laboratorios especializados", "t-mist")}
            ${mini("Cupos Ocupados", r.cupos_ocupados, "t-leaf", `${r.porcentaje_global_ocupacion}% Ocupación`, "t-leaf")}
            ${mini("Cupos Disponibles", r.cupos_disponibles, "t-emerald6", "Plazas restantes", "t-emerald7")}
            ${mini("Aforo Máximo Alcanzado", r.total_talleres_llenos, "t-amber6", "Talleres al 100%", "t-amber7")}
          </div>
          <div class="ws-grid">${talleres.talleres
            .map(
              (t) => `
              <div class="ws-card${t.alcanzo_aforo_maximo ? " is-full" : ""}">
                <div class="ws-card__head"><h4>${esc(t.titulo)}</h4>${t.alcanzo_aforo_maximo ? '<span class="ws-full-tag">AFORO MÁXIMO</span>' : ""}</div>
                <div class="ws-meta">
                  <p><b>Ponente:</b> ${esc(t.ponente)}</p>
                  <p><b>Lugar:</b> ${esc(t.ubicacion)}</p>
                  <p><b>Horario:</b> ${t.fecha} (${t.horario})</p>
                </div>
                <div class="ws-occ">
                  <div class="ws-occ__row"><span class="t-mist">Ocupación (${t.porcentaje_ocupacion}%)</span><span class="fw-bold t-ink">${t.cupos_ocupados} / ${t.aforo_maximo} cupos</span></div>
                  <div class="bar bar--md"><div class="${t.alcanzo_aforo_maximo ? "fill-rose" : ""}" style="width:${t.porcentaje_ocupacion}%"></div></div>
                </div>
              </div>`,
            )
            .join("")}</div>
          <div class="card card--sm card--clip">
            <div class="table-head"><h3 class="card-title-sm">Participación por Fecha y Horario</h3></div>
            ${table(
              [["Fecha"], ["Horario"], ["Talleres en Simultáneo", "ta-center"], ["Cupos Ocupados", "ta-center"], ["Aforo Total", "ta-center"], ["Ocupación (%)"]],
              talleres.por_fecha_horario.map(
                (i) => `<tr>
                  <td class="fw-semibold t-ink">${i.fecha}</td>
                  <td class="mono t-mist">${i.horario}</td>
                  <td class="ta-center fw-bold t-ink">${i.total_talleres}</td>
                  <td class="ta-center fw-bold t-leaf">${i.cupos_ocupados}</td>
                  <td class="ta-center t-mist">${i.aforo_total}</td>
                  <td>${pctBar(i.porcentaje_ocupacion, "", true)}</td>
                </tr>`,
              ),
            )}
          </div>
        </div>`
    }

    function tabCertificacion() {
      const r = certificacion.resumen
      const estado = (e) =>
        e === "enviado"
          ? `<span class="badge badge--green">${icon("Check", { cls: "t-emerald6" })}${e}</span>`
          : e === "pendiente"
            ? `<span class="badge badge--amber">${icon("Clock", { cls: "t-amber6" })}${e}</span>`
            : `<span class="badge badge--rose">${icon("AlertCircle", { cls: "t-rose6" })}${e}</span>`
      const errores = certificacion.documentos_con_error.length
        ? `<div class="err-card">
            <div class="err-head">
              <h3 class="card-title-sm t-rose9">${icon("AlertCircle", { cls: "t-rose6" })}Documentos con Error de Envío (${certificacion.documentos_con_error.length})</h3>
              <span style="font-size:.75rem" class="t-rose8">Requiere reintento o corrección de correo</span>
            </div>
            <div class="err-list">${certificacion.documentos_con_error
              .map(
                (e) => `<div class="err-item">
                  <div>
                    <span class="fw-semibold t-ink">${esc(e.participante_nombre)}</span><span class="t-mist ml-2">(${esc(e.email)})</span>
                    <p class="mt-05 t-rose7 fw-medium">${esc(e.error_detalle)}</p>
                  </div>
                  <span class="mono t-fog fs-07 shrink-0">${e.codigo_verificacion}</span>
                </div>`,
              )
              .join("")}</div>
          </div>`
        : ""

      return `
        <div class="rep-stack">
          <div class="mini-grid-4">
            ${mini("Certificados Generados", r.total_certificados, "", "30 horas académicas", "t-leaf")}
            ${mini("Constancias Generadas", r.total_constancias, "", "15 horas académicas", "t-mist")}
            ${mini("Enviados Correctamente", r.enviados_correctamente, "t-emerald6", `${r.tasa_entrega}% tasa de entrega`, "t-emerald7")}
            ${mini("Pendientes y Errores", r.pendientes_envio + r.con_errores_envio, "t-amber6", `${r.con_errores_envio} con errores de envío`, "t-rose6")}
          </div>
          ${errores}
          <div class="card card--sm card--clip">
            <div class="table-head"><h3 class="card-title-sm">Registro de Documentos de Certificación Emitidos (${certificacion.listado.length})</h3></div>
            ${table(
              [["Código Verificación"], ["Tipo"], ["Participante"], ["Email"], ["Horas", "ta-center"], ["Estado de Envío"], ["Fecha Emisión"]],
              certificacion.listado.slice(0, 15).map(
                (d) => `<tr>
                  <td class="mono fw-bold t-leaf">${d.codigo_verificacion}</td>
                  <td><span class="badge capitalize ${d.tipo === "certificado" ? "badge--amber" : "badge--blue-dark"}">${d.tipo}</span></td>
                  <td class="fw-semibold t-ink">${esc(d.participante_nombre)}</td>
                  <td class="t-mist">${esc(d.email)}</td>
                  <td class="ta-center fw-bold t-ink nowrap">${d.horas_academicas} hrs</td>
                  <td>${estado(d.estado_envio)}</td>
                  <td class="t-mist nowrap">${d.fecha_emision ?? ""}</td>
                </tr>`,
              ),
            )}
          </div>
        </div>`
    }

    function vistaImpresion() {
      const r = inscripciones.resumen
      const f = financiero.resumen
      const c = asistencia.conferencias
      const ce = certificacion.resumen
      return `
        <div class="print-only">
          <div class="print-head">
            <h1>Universidad Nacional Agraria de la Selva</h1>
            <h2>Facultad de Ingeniería en Informática y Sistemas</h2>
            <p style="font-size:.875rem;margin-top:.25rem">Ciclo de Conferencias FIIS 2026 — Informe Ejecutivo y Estadísticas</p>
            <p style="color:#64748b;margin-top:.125rem">Fecha de emisión: ${new Date().toLocaleDateString("es-PE")} | Tingo María, Huánuco</p>
          </div>
          <div class="print-box">
            <div>
              <p class="fw-bold">Total Participantes Inscritos: ${r.total_inscritos}</p>
              <p>• Estudiantes: ${r.estudiantes}</p>
              <p>• Público General: ${r.publico_general}</p>
              <p>• Ambas Actividades: ${r.ambas}</p>
            </div>
            <div>
              <p class="fw-bold">Total Recaudado Neto: S/ ${f.total_neto_recibido.toFixed(2)}</p>
              <p>• Recaudación Bruta: S/ ${f.total_recaudado_bruto.toFixed(2)}</p>
              <p>• Comisiones Pasarela: S/ ${f.total_comisiones_pasarela.toFixed(2)}</p>
              <p>• Cobrado en Efectivo: S/ ${f.total_efectivo.toFixed(2)}</p>
            </div>
          </div>
          <div style="margin-top:1.5rem;display:grid;gap:1rem">
            <h3 class="fw-bold" style="font-size:.875rem;border-bottom:1px solid #e5e7eb;padding-bottom:.25rem">Resumen de Asistencia y Certificación</h3>
            <p>• Asistencia Día 1: ${c.dia_1.asistentes} (${c.dia_1.porcentaje}%) | Asistencia Día 2: ${c.dia_2.asistentes} (${c.dia_2.porcentaje}%)</p>
            <p>• Participantes con asistencia en ambos días: ${c.ambos_dias.total} (Aptos para certificación oficial)</p>
            <p>• Certificados Generados: ${ce.total_certificados} | Constancias: ${ce.total_constancias} | Tasa de Entrega: ${ce.tasa_entrega}%</p>
          </div>
          <div class="print-sign">
            <div><p class="fw-semibold">Comisión Organizadora</p><p style="font-size:.65rem;color:#64748b">FIIS — UNAS</p></div>
            <div><p class="fw-semibold">Decanatura / Dirección</p><p style="font-size:.65rem;color:#64748b">FIIS — UNAS</p></div>
          </div>
        </div>`
    }

    const TAB_RENDER = {
      resumen: tabResumen,
      inscripciones: tabInscripciones,
      financiero: tabFinanciero,
      asistencia: tabAsistencia,
      talleres: tabTalleres,
      certificacion: tabCertificacion,
    }

    function render() {
      root.innerHTML = `<div class="rep">${header()}<div>${TAB_RENDER[state.tab]()}</div>${vistaImpresion()}</div>`
    }

    // Al escribir en la búsqueda solo se actualiza la tabla, para no perder el foco del campo.
    function refreshInscritos() {
      const titulo = root.querySelector("#inscritos-titulo")
      const tabla = root.querySelector("#inscritos-tabla")
      if (!titulo || !tabla) return render()
      titulo.textContent = `Listado Detallado de Inscritos (${participantesFiltrados().length})`
      tabla.innerHTML = table([["Participante"], ["DNI"], ["Categoría"], ["Institución"], ["Actividad"], ["Código"], ["Fecha"]], filasInscritos())
    }

    root.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]")
      if (tab) {
        state.tab = tab.dataset.tab
        render()
      } else if (e.target.closest("[data-excel]")) descargarExcel(state.tab)
      else if (e.target.closest("[data-print]")) window.print()
    })

    root.addEventListener("change", (e) => {
      const key = e.target.dataset.filter
      if (key && key !== "busqueda") {
        state[key] = e.target.value
        refreshInscritos()
      }
    })

    root.addEventListener("input", (e) => {
      if (e.target.dataset.filter === "busqueda") {
        state.busqueda = e.target.value
        refreshInscritos()
      }
    })

    render()
  }
})()
