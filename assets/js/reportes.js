/*
 * Reportes y estadísticas: ReportesDashboard.tsx con los mismos className.
 * Estado (pestaña, filtros, barra resaltada) igual que los useState del original.
 */
;(function () {
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]

  function formatFechaBarras(str) {
    const parts = str.split("-")
    return parts.length === 3 ? `${parts[2]} ${MESES[parseInt(parts[1], 10) - 1] || parts[1]}` : str
  }

  function getIniciales(nombre) {
    const parts = nombre.trim().split(" ")
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return nombre.substring(0, 2).toUpperCase()
  }

  window.ReportesDashboard = function (root, data) {
    const { inscripciones, financiero, asistencia, talleres, certificacion } = data
    const s = { activeTab: "resumen", filtroCategoria: "todas", filtroInstitucion: "todas", busqueda: "", copiadoDNI: null, hoveredBarDate: null, activeBarSeries: null }

    const participantesFiltrados = () =>
      inscripciones.participantes.filter((p) => {
        const matchCat = s.filtroCategoria === "todas" || p.categoria === s.filtroCategoria
        const matchInst = s.filtroInstitucion === "todas" || p.institucion === s.filtroInstitucion
        const matchSearch =
          s.busqueda === "" ||
          p.nombre_completo.toLowerCase().includes(s.busqueda.toLowerCase()) ||
          p.numero_documento.includes(s.busqueda) ||
          p.institucion.toLowerCase().includes(s.busqueda.toLowerCase())
        return matchCat && matchInst && matchSearch
      })

    const pagosFiltrados = () =>
      financiero.pagos_detalle.filter((p) => {
        const matchCat = s.filtroCategoria === "todas" || p.categoria === s.filtroCategoria
        const matchSearch = s.busqueda === "" || p.participante_nombre.toLowerCase().includes(s.busqueda.toLowerCase()) || p.dni.includes(s.busqueda)
        return matchCat && matchSearch
      })

    // Métricas del gráfico de barras recto con leyenda centrada
    let est = 0
    let gen = 0
    let max = 0
    inscripciones.por_fecha.forEach((d) => {
      est += d.estudiantes
      gen += d.publico_general
      if (d.total > max) max = d.total
    })
    const totalEstudiantesBarras = est
    const totalGeneralBarras = gen
    const totalGlobalBarras = est + gen
    const factor = max <= 10 ? 2 : max <= 50 ? 5 : 10
    const ceiling = Math.ceil(Math.max(max, 1) / factor) * factor
    const yTicksBarras = [ceiling, Math.round((ceiling * 3) / 4), Math.round((ceiling * 2) / 4), Math.round(ceiling / 4), 0]
    const maxValBarras = Math.max(ceiling, 5)

    // Exportar a Excel (CSV compatible con Excel Windows con BOM UTF-8)
    function descargarExcel(seccion) {
      let csvContent = "﻿"
      const filename = `reporte_${seccion}_fiis2026.csv`
      if (seccion === "inscripciones") {
        csvContent += "ID;NOMBRES Y APELLIDOS;DNI;EMAIL;TELEFONO;CATEGORIA;INSTITUCION;ACTIVIDAD;FECHA\n"
        participantesFiltrados().forEach((p) => {
          csvContent += `${p.id};"${p.nombre_completo}";${p.numero_documento};${p.email};${p.telefono};${p.categoria};"${p.institucion}";${p.tipo_actividad};${p.fecha_inscripcion}\n`
        })
      } else if (seccion === "financiero") {
        csvContent += "ID;PARTICIPANTE;DNI;CATEGORIA;CONCEPTO;METODO;MONTO BRUTO;COMISION;MONTO NETO;FECHA\n"
        pagosFiltrados().forEach((p) => {
          csvContent += `${p.id};"${p.participante_nombre}";${p.dni};${p.categoria};${p.concepto};${p.metodo};${p.monto_bruto};${p.comision_pasarela};${p.monto_neto};${p.fecha_pago}\n`
        })
      } else if (seccion === "talleres") {
        csvContent += "ID;TALLER;PONENTE;UBICACION;FECHA;HORARIO;AFORO MAX;CUPOS OCUPADOS;CUPOS DISP;OCUPACION (%)\n"
        talleres.talleres.forEach((t) => {
          csvContent += `${t.id};"${t.titulo}";"${t.ponente}";"${t.ubicacion}";${t.fecha};"${t.horario}";${t.aforo_maximo};${t.cupos_ocupados};${t.cupos_disponibles};${t.porcentaje_ocupacion}%\n`
        })
      } else if (seccion === "certificacion") {
        csvContent += "ID;CODIGO;TIPO;PARTICIPANTE;DNI;EMAIL;HORAS;ESTADO;FECHA\n"
        certificacion.listado.forEach((d) => {
          csvContent += `${d.id};${d.codigo_verificacion};${d.tipo};"${d.participante_nombre}";${d.dni};${d.email};${d.horas_academicas};${d.estado_envio};${d.fecha_emision}\n`
        })
      } else if (seccion === "asistencia") {
        csvContent += "ACTIVIDAD;TIPO;FECHA;HORARIO;INSCRITOS;ASISTENTES;PORCENTAJE (%)\n"
        asistencia.talleres.forEach((t) => {
          csvContent += `"${t.titulo}";Taller;${t.fecha};${t.hora_inicio};${t.inscritos};${t.asistentes};${t.porcentaje_asistencia}%\n`
        })
      } else {
        csvContent += "METRICA;VALOR\n"
        csvContent += `Total Inscritos;${inscripciones.resumen.total_inscritos}\n`
        csvContent += `Estudiantes;${inscripciones.resumen.estudiantes}\n`
        csvContent += `Publico General;${inscripciones.resumen.publico_general}\n`
        csvContent += `Recaudacion Bruta (S/);${financiero.resumen.total_recaudado_bruto}\n`
        csvContent += `Comisiones Pasarela (S/);${financiero.resumen.total_comisiones_pasarela}\n`
        csvContent += `Recaudacion Neta (S/);${financiero.resumen.total_neto_recibido}\n`
        csvContent += `Cobrado en Efectivo (S/);${financiero.resumen.total_efectivo}\n`
        csvContent += `Asistentes Dia 1;${asistencia.conferencias.dia_1.asistentes}\n`
        csvContent += `Asistentes Dia 2;${asistencia.conferencias.dia_2.asistentes}\n`
        csvContent += `Asistieron Ambos Dias;${asistencia.conferencias.ambos_dias.total}\n`
        csvContent += `Certificados Generados;${certificacion.resumen.total_certificados}\n`
        csvContent += `Constancias Generadas;${certificacion.resumen.total_constancias}\n`
        csvContent += `Documentos Enviados;${certificacion.resumen.enviados_correctamente}\n`
      }
      const url = URL.createObjectURL(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }))
      const a = document.createElement("a")
      a.href = url
      a.setAttribute("download", filename)
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }

    // ── Banner hero, KPIs y pestañas ───────────────────────────

    function cabecera() {
      const r = inscripciones.resumen
      const f = financiero.resumen
      const c = asistencia.conferencias
      const ce = certificacion.resumen
      const tabs = [
        { key: "resumen", label: "Visión General", icon: "Layers", badge: "Global" },
        { key: "inscripciones", label: "Inscripciones", icon: "Users", badge: `${r.total_inscritos}` },
        { key: "financiero", label: "Finanzas", icon: "DollarSign", badge: `S/ ${(f.total_recaudado_bruto / 1000).toFixed(1)}k` },
        { key: "asistencia", label: "Asistencia", icon: "CalendarCheck", badge: `${c.dia_1.porcentaje}%` },
        { key: "talleres", label: "Talleres y Aforos", icon: "Wrench", badge: `${talleres.resumen.total_talleres}` },
        { key: "certificacion", label: "Certificación", icon: "Award", badge: `${ce.total_documentos}` },
      ]

      return `
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#021e46] to-[#013d75] p-6 sm:p-8 text-white shadow-xl shadow-blue-950/20 border border-white/10 print:hidden">
        <div class="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div class="absolute right-40 -bottom-20 h-56 w-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div class="space-y-2">
            <div class="flex flex-wrap items-center gap-2.5">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30 backdrop-blur-md">
                <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                CONFERENCIAS FIIS 2026 · EN VIVO
              </span>
              <span class="rounded-full bg-white/10 px-3 py-1 text-xs text-blue-200/90 backdrop-blur-md">Corte sincronizado con PostgreSQL</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">Panel Ejecutivo de Reportes y Estadísticas</h1>
            <p class="text-sm text-blue-100/80 m-0 max-w-xl font-normal leading-relaxed">Supervisión en tiempo real de inscripciones, auditoría financiera de ingresos, asistencia presencial, aforo de talleres y despacho de certificaciones.</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <button data-excel class="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-500/15 px-4 py-2.5 text-xs font-bold text-emerald-300 border border-emerald-400/30 backdrop-blur-md shadow-sm transition-all duration-200 hover:bg-emerald-500/25 hover:border-emerald-400/50 hover:scale-[1.02] active:scale-[0.98]" title="Descargar libro de datos en formato Excel (.csv compatible)">
              ${icon("FileSpreadsheet", { cls: "h-4 w-4 text-emerald-400" })}<span>Exportar Excel</span>
            </button>
            <button data-print class="inline-flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white border border-white/20 backdrop-blur-md shadow-sm transition-all duration-200 hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]" title="Generar vista imprimible o guardar documento en PDF">
              ${icon("Printer", { cls: "h-4 w-4 text-blue-300" })}<span>Guardar en PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="group relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5">
          <div class="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-500 absolute top-0 left-0"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Total Inscritos</span>
            <div class="rounded-2xl bg-blue-50 p-2.5 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">${icon("Users", { cls: "h-5 w-5" })}</div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">${r.total_inscritos}</span>
            <span class="text-xs font-semibold text-emerald-600 flex items-center">${icon("TrendingUp", { cls: "h-3 w-3 mr-0.5" })} 100% cupos</span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span class="flex items-center gap-1 font-medium text-slate-700">${icon("GraduationCap", { cls: "h-3.5 w-3.5 text-blue-600" })} <!---->${r.estudiantes}<!----> Estudiantes</span>
            <span class="flex items-center gap-1 font-medium text-slate-700">${icon("Briefcase", { cls: "h-3.5 w-3.5 text-emerald-600" })} <!---->${r.publico_general}<!----> General</span>
          </div>
        </div>

        <div class="group relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5">
          <div class="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-400 absolute top-0 left-0"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Recaudación Neta</span>
            <div class="rounded-2xl bg-emerald-50 p-2.5 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">${icon("DollarSign", { cls: "h-5 w-5" })}</div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">S/ <!---->${f.total_neto_recibido.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>Bruto: S/ <!---->${f.total_recaudado_bruto.toLocaleString("es-PE")}</span>
            <span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">96.4% margen neto</span>
          </div>
        </div>

        <div class="group relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-900/5">
          <div class="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-purple-500 absolute top-0 left-0"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Tasa de Asistencia</span>
            <div class="rounded-2xl bg-indigo-50 p-2.5 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">${icon("CalendarCheck", { cls: "h-5 w-5" })}</div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">${c.dia_1.porcentaje}<!---->%</span>
            <span class="text-xs font-semibold text-indigo-600">Día 1</span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>${c.dia_1.asistentes}<!----> en Día 1</span>
            <span class="font-semibold text-indigo-600">${c.dia_2.asistentes}<!----> en Día 2</span>
          </div>
        </div>

        <div class="group relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/5">
          <div class="h-1.5 w-full bg-gradient-to-r from-amber-500 to-orange-400 absolute top-0 left-0"></div>
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Certificados Emitidos</span>
            <div class="rounded-2xl bg-amber-50 p-2.5 text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">${icon("Award", { cls: "h-5 w-5" })}</div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 tabular-nums">${ce.total_documentos}</span>
            <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full ring-1 ring-amber-500/20">${ce.tasa_entrega}<!---->% entregados</span>
          </div>
          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>${ce.enviados_correctamente}<!----> enviados</span>
            <span class="font-semibold text-rose-600">${ce.con_errores_envio}<!----> con observación</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl bg-slate-100/90 p-1.5 backdrop-blur-md border border-slate-200/80 shadow-inner flex flex-wrap gap-1 print:hidden">${tabs
        .map((tab) => {
          const activo = s.activeTab === tab.key
          return `<button data-tab="${tab.key}" class="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
            activo ? "bg-white text-blue-950 shadow-sm ring-1 ring-slate-900/5 scale-[1.01]" : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          }">${icon(tab.icon, { cls: `h-4 w-4 ${activo ? "text-blue-600" : "text-slate-400"}` })}<span>${tab.label}</span><span class="rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
            activo ? "bg-blue-50 text-blue-700" : "bg-slate-200/70 text-slate-600"
          }">${esc(tab.badge)}</span></button>`
        })
        .join("")}</div>`
    }

    // ── PESTAÑA 1: VISIÓN GENERAL ──────────────────────────────

    function tabResumen() {
      const r = inscripciones.resumen
      const pm = financiero.por_metodo
      const pc = financiero.por_concepto
      return `
        <div class="space-y-6">
          ${
            talleres.talleres_aforo_maximo.length > 0
              ? `<div class="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 p-5 shadow-sm flex items-start gap-4">
                  <div class="rounded-2xl bg-amber-500 p-2.5 text-white shadow-md shadow-amber-500/20 shrink-0">${icon("AlertTriangle", { cls: "h-5 w-5" })}</div>
                  <div class="flex-1">
                    <h4 class="text-sm font-bold text-amber-950 m-0">${talleres.talleres_aforo_maximo.length}<!----> Talleres alcanzaron su Capacidad Máxima (Aforo 100%)</h4>
                    <p class="text-xs text-amber-800 mt-0.5">Los siguientes laboratorios completaron los cupos asignados por la administración:</p>
                    <div class="mt-3 flex flex-wrap gap-2">${talleres.talleres_aforo_maximo
                      .map(
                        (t) => `<span class="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-amber-900 shadow-sm border border-amber-200">${icon("CheckCircle2", { cls: "h-3.5 w-3.5 text-emerald-600" })}${esc(t.titulo)}<!----> (<!---->${t.cupos_ocupados}<!---->/<!---->${t.aforo_maximo}<!----> cupos)</span>`,
                      )
                      .join("")}</div>
                  </div>
                </div>`
              : ""
          }
          <div class="grid gap-6 md:grid-cols-2">
            <div class="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold text-slate-900 m-0">Distribución de Participantes</h3>
                  <p class="text-xs text-slate-500 mt-1">Porcentaje de estudiantes frente a profesionales y público general</p>
                </div>
                <div class="rounded-xl bg-slate-100 p-2 text-slate-600">${icon("BarChart3", { cls: "h-4 w-4" })}</div>
              </div>
              <div class="mt-6 space-y-4">
                <div>
                  <div class="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-blue-600"></span> Estudiantes de Pregrado (66.7%)</span>
                    <span class="tabular-nums">${r.estudiantes}<!----> alumnos</span>
                  </div>
                  <div class="h-3.5 w-full rounded-full bg-slate-100 p-0.5">
                    <div class="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700" style="width: ${(r.estudiantes / r.total_inscritos) * 100}%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Público General &amp; Profesionales (33.3%)</span>
                    <span class="tabular-nums">${r.publico_general}<!----> inscritos</span>
                  </div>
                  <div class="h-3.5 w-full rounded-full bg-slate-100 p-0.5">
                    <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700" style="width: ${(r.publico_general / r.total_inscritos) * 100}%"></div>
                  </div>
                </div>
              </div>
              <div class="mt-6 pt-5 border-t border-slate-100">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Top Universidades e Institutos</p>
                  <span class="text-[11px] font-semibold text-blue-600">Porcentaje de cuota</span>
                </div>
                <div class="space-y-2.5">${inscripciones.por_institucion
                  .slice(0, 4)
                  .map(
                    (inst, index) => `<div class="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 transition">
                      <div class="flex items-center gap-2 truncate max-w-[240px]">
                        <span class="flex h-5 w-5 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200">${index + 1}</span>
                        <span class="font-semibold text-slate-800 truncate">${esc(inst.institucion)}</span>
                      </div>
                      <span class="font-bold text-blue-950 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs tabular-nums">${inst.total}<!----> inscritos (<!---->${inst.porcentaje}<!---->%)</span>
                    </div>`,
                  )
                  .join("")}</div>
              </div>
            </div>

            <div class="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-base font-bold text-slate-900 m-0">Canales de Recaudación</h3>
                  <p class="text-xs text-slate-500 mt-1">Comparativa Pasarela Digital Yape vs. Cobro en Efectivo</p>
                </div>
                <div class="rounded-xl bg-slate-100 p-2 text-slate-600">${icon("CreditCard", { cls: "h-4 w-4" })}</div>
              </div>
              <div class="mt-6 grid grid-cols-2 gap-4">
                <div class="relative overflow-hidden rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/60 to-white p-4 shadow-sm">
                  <div class="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase mb-1.5">${icon("CreditCard", { cls: "h-4 w-4" })} Pasarela Web</div>
                  <p class="text-2xl font-black text-slate-900 m-0 tabular-nums">S/ <!---->${pm.pasarela.bruto.toLocaleString("es-PE")}</p>
                  <p class="text-[11px] text-slate-500 mt-1">Comisión pasarela: <span class="font-semibold text-rose-600">-S/ <!---->${pm.pasarela.comisiones.toFixed(2)}</span></p>
                  <div class="mt-3"><span class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-800">${pm.pasarela.transacciones}<!----> transacciones en línea</span></div>
                </div>
                <div class="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/60 to-white p-4 shadow-sm">
                  <div class="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase mb-1.5">${icon("Wallet", { cls: "h-4 w-4" })} Efectivo en Caja</div>
                  <p class="text-2xl font-black text-slate-900 m-0 tabular-nums">S/ <!---->${pm.efectivo.bruto.toLocaleString("es-PE")}</p>
                  <p class="text-[11px] text-emerald-700 font-semibold mt-1">Sin comisión bancaria (100% neto)</p>
                  <div class="mt-3"><span class="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">${pm.efectivo.transacciones}<!----> recibos de caja</span></div>
                </div>
              </div>
              <div class="mt-6 pt-5 border-t border-slate-100">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recaudación por Actividad</p>
                <div class="grid grid-cols-3 gap-2.5 text-center">
                  <div class="rounded-xl bg-slate-50 p-2.5 border border-slate-100"><span class="text-[11px] text-slate-500 block font-medium">Solo Conferencias</span><span class="font-extrabold text-slate-800 text-sm">S/ <!---->${pc.conferencias}</span></div>
                  <div class="rounded-xl bg-slate-50 p-2.5 border border-slate-100"><span class="text-[11px] text-slate-500 block font-medium">Solo Talleres</span><span class="font-extrabold text-slate-800 text-sm">S/ <!---->${pc.talleres}</span></div>
                  <div class="rounded-xl bg-blue-50 p-2.5 border border-blue-100"><span class="text-[11px] text-blue-700 block font-medium">Ambas Actividades</span><span class="font-extrabold text-blue-950 text-sm">S/ <!---->${pc.ambas}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>`
    }

    // ── PESTAÑA 2: INSCRIPCIONES ───────────────────────────────

    function filasParticipantes() {
      const lista = participantesFiltrados()
      return (
        lista
          .slice(0, 10)
          .map(
            (p) => `<tr class="hover:bg-blue-50/30 transition">
              <td class="py-3 px-4">
                <div class="flex items-center gap-3">
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-[11px] shadow-sm">${getIniciales(p.nombre_completo)}</span>
                  <div>
                    <p class="font-bold text-slate-900 m-0 leading-tight">${esc(p.nombre_completo)}</p>
                    <p class="text-[11px] text-slate-400 m-0">${esc(p.email)}</p>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 font-mono font-medium text-slate-600">
                <button data-copy="${p.numero_documento}" class="inline-flex items-center gap-1 hover:text-blue-600 transition" title="Clic para copiar DNI">
                  ${p.numero_documento}${icon("Copy", { cls: "h-3 w-3 text-slate-400" })}${s.copiadoDNI === p.numero_documento ? '<span class="text-[10px] text-emerald-600 font-bold">¡Copiado!</span>' : ""}
                </button>
              </td>
              <td class="py-3 px-4"><span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                p.categoria === "estudiante" ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20" : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
              }">${p.categoria === "estudiante" ? "Estudiante" : "Público General"}</span></td>
              <td class="py-3 px-4 font-medium text-slate-700 max-w-[180px] truncate">${esc(p.institucion)}</td>
              <td class="py-3 px-4"><span class="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 capitalize">${p.tipo_actividad.replace("_", " ")}</span></td>
              <td class="py-3 px-4 font-mono text-[11px] text-slate-500">${p.codigo_barras}</td>
            </tr>`,
          )
          .join("") +
        (lista.length === 0 ? `<tr><td colspan="6" class="py-8 text-center text-slate-400">No se encontraron participantes con los filtros seleccionados.</td></tr>` : "")
      )
    }

    function tooltipBarras() {
      const p = s.hoveredBarDate ? inscripciones.por_fecha.find((d) => d.fecha === s.hoveredBarDate) || null : null
      if (!p) return `<p class="text-[11px] text-slate-400 text-center font-medium">Pasa el cursor sobre cualquier barra para ver el desglose exacto</p>`
      return `<div class="inline-flex items-center gap-3 px-4 py-1.5 rounded-xl bg-[#021E46] text-white text-xs shadow-lg border border-[#014C90]/40 animate-in fade-in duration-150">
        <span class="font-bold text-[#D6EBFE] uppercase tracking-wider text-[10px]">Fecha: <!---->${formatFechaBarras(p.fecha)}</span>
        <span class="h-3 w-px bg-white/20"></span>
        <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-[2px] bg-[#014C90] ring-1 ring-white/30"></span><span class="text-slate-300">Estudiantes:</span><span class="font-bold text-white">${p.estudiantes}</span></span>
        <span class="h-3 w-px bg-white/20"></span>
        <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-[2px] bg-[#047857] ring-1 ring-white/30"></span><span class="text-slate-300">General:</span><span class="font-bold text-white">${p.publico_general}</span></span>
        <span class="h-3 w-px bg-white/20"></span>
        <span class="px-2.5 py-0.5 rounded bg-[#D6EBFE] text-[#021E46] font-extrabold text-[11px]">Total: <!---->${p.total}</span>
      </div>`
    }

    function grafico() {
      const serie = s.activeBarSeries
      const pct = (n) => (totalGlobalBarras > 0 ? ((n / totalGlobalBarras) * 100).toFixed(1) : 0)
      const barras = inscripciones.por_fecha
        .map((f) => {
          const totalHeightPct = Math.min(Math.round((f.total / maxValBarras) * 100), 100)
          const isHovered = s.hoveredBarDate === f.fecha
          const estPct = f.total > 0 ? (f.estudiantes / f.total) * 100 : 0
          const genPct = f.total > 0 ? (f.publico_general / f.total) * 100 : 0
          return `<div data-fecha="${f.fecha}" class="flex-1 flex flex-col items-center justify-end h-full max-w-[56px] group cursor-pointer relative">
            <div class="mb-1 text-center transition-transform duration-200 group-hover:-translate-y-0.5">
              <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums transition-colors ${
                isHovered ? "bg-[#021E46] text-[#D6EBFE] shadow-xs" : "text-[#021E46] bg-[#D6EBFE]/70 group-hover:bg-[#014C90] group-hover:text-white"
              }">${f.total}</span>
            </div>
            <div class="w-full max-w-[48px] rounded-t-[2px] overflow-hidden flex flex-col transition-all duration-200 ${isHovered ? "ring-2 ring-[#014C90] shadow-md shadow-[#014C90]/25" : "shadow-xs"}" style="height: ${Math.max(totalHeightPct, 4)}%">
              <div class="w-full bg-[#047857] transition-all duration-200 border-b border-white/30 ${
                serie === "general" ? "opacity-100 brightness-110" : serie === "estudiantes" ? "opacity-25" : isHovered ? "brightness-115" : "opacity-100"
              }" style="height: ${genPct}%" title="Público General: ${f.publico_general}"></div>
              <div class="w-full bg-[#014C90] transition-all duration-200 ${
                serie === "estudiantes" ? "opacity-100 brightness-110" : serie === "general" ? "opacity-25" : isHovered ? "brightness-110" : "opacity-100"
              }" style="height: ${estPct}%" title="Estudiantes: ${f.estudiantes}"></div>
            </div>
            <div class="absolute -bottom-6 inset-x-0 text-center">
              <span class="text-[11px] font-semibold whitespace-nowrap transition-colors block text-center ${isHovered ? "text-[#014C90] font-bold" : "text-slate-500"}">${formatFechaBarras(f.fecha)}</span>
            </div>
          </div>`
        })
        .join("")

      return `<div class="rounded-3xl border border-black/[0.06] bg-white p-6 sm:p-7 shadow-sm" data-grafico>
        <div class="text-center max-w-2xl mx-auto">
          <div class="inline-flex items-center justify-center gap-2 mb-1">
            <div class="rounded-xl bg-[#D6EBFE] p-1.5 text-[#014C90] shadow-xs">${icon("BarChart3", { cls: "h-4 w-4" })}</div>
            <h3 class="text-base sm:text-lg font-bold text-[#021E46] tracking-tight">Evolución Cronológica de Inscripciones</h3>
          </div>
          <p class="text-xs text-slate-500">Registros diarios clasificados por tipo de participante a lo largo del periodo</p>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pb-3 border-b border-slate-100">
          <div data-serie="" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border select-none ${
            serie === null ? "bg-[#021E46] text-white border-[#021E46] shadow-sm ring-2 ring-[#021E46]/15" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-[#D6EBFE]/40"
          }" title="Vista global de todos los inscritos">
            <span class="flex h-3 w-3 overflow-hidden rounded-[2px] shadow-xs shrink-0 border border-white/20"><span class="w-1/2 bg-[#014C90]"></span><span class="w-1/2 bg-[#047857]"></span></span>
            <span>Total General</span>
            <span class="font-extrabold tabular-nums ${serie === null ? "text-[#D6EBFE]" : "text-[#021E46]"}">${totalGlobalBarras}</span>
            <span class="text-[11px] font-medium ${serie === null ? "text-slate-300" : "text-slate-400"}">(100%)</span>
          </div>
          <div data-serie="estudiantes" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border select-none ${
            serie === "estudiantes"
              ? "bg-[#D6EBFE] border-[#014C90] text-[#014C90] shadow-xs ring-2 ring-[#014C90]/30 scale-[1.02]"
              : serie === "general"
                ? "bg-slate-50/50 border-slate-200 text-slate-400 opacity-40"
                : "bg-slate-50 hover:bg-[#D6EBFE]/50 border-slate-200 text-slate-700"
          }" title="Pasa el mouse para marcar y resaltar Estudiantes">
            <span class="h-3 w-3 rounded-[2px] bg-[#014C90] shadow-xs shrink-0"></span>
            <span>Estudiantes de Pregrado</span>
            <span class="font-extrabold text-[#014C90] tabular-nums">${totalEstudiantesBarras}</span>
            <span class="text-[11px] text-slate-500 font-medium">(<!---->${pct(totalEstudiantesBarras)}<!---->%)</span>
          </div>
          <div data-serie="general" class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer border select-none ${
            serie === "general"
              ? "bg-emerald-50 border-[#047857] text-[#047857] shadow-xs ring-2 ring-[#047857]/30 scale-[1.02]"
              : serie === "estudiantes"
                ? "bg-slate-50/50 border-slate-200 text-slate-400 opacity-40"
                : "bg-slate-50 hover:bg-emerald-50/80 border-slate-200 text-slate-700"
          }" title="Pasa el mouse para marcar y resaltar Público General">
            <span class="h-3 w-3 rounded-[2px] bg-[#047857] shadow-xs shrink-0"></span>
            <span>Público General &amp; Profesionales</span>
            <span class="font-extrabold text-[#047857] tabular-nums">${totalGeneralBarras}</span>
            <span class="text-[11px] text-slate-500 font-medium">(<!---->${pct(totalGeneralBarras)}<!---->%)</span>
          </div>
        </div>

        <div class="h-9 mt-3 flex items-center justify-center">${tooltipBarras()}</div>

        <div class="mt-4 relative">
          <div class="flex h-56 sm:h-64 w-full">
            <div class="w-8 sm:w-10 flex flex-col justify-between items-end pr-2.5 text-[10px] font-semibold text-slate-400 select-none pb-7">${yTicksBarras
              .map((tick) => `<span class="leading-none">${tick}</span>`)
              .join("")}</div>
            <div class="relative flex-1 flex flex-col justify-end">
              <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">${yTicksBarras
                .map((_, i) => `<div class="w-full ${i === yTicksBarras.length - 1 ? "border-b border-slate-300" : "border-b border-dashed border-slate-200/80"}"></div>`)
                .join("")}</div>
              <div class="relative z-10 flex items-end justify-around gap-2 sm:gap-4 h-full pb-7">${barras}</div>
            </div>
          </div>
        </div>
      </div>`
    }

    function tabInscripciones() {
      const opt = (v, l, cur) => `<option value="${esc(v)}"${cur === v ? " selected" : ""}>${esc(l)}</option>`
      return `
        <div class="space-y-6">
          <div class="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm">
            <div class="flex items-center gap-3">
              <div class="rounded-xl bg-blue-50 p-2 text-blue-600">${icon("Filter", { cls: "h-4 w-4" })}</div>
              <div>
                <span class="text-xs font-bold text-slate-700 block">Filtros Activos</span>
                <span class="text-[11px] text-slate-400" data-contador>Mostrando <!---->${participantesFiltrados().length}<!----> de <!---->${inscripciones.resumen.total_inscritos}<!----> participantes</span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2.5">
              <select data-filtro="filtroCategoria" class="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:bg-white">
                ${opt("todas", "Todas las categorías", s.filtroCategoria)}${opt("estudiante", "Solo Estudiantes", s.filtroCategoria)}${opt("publico_general", "Público General", s.filtroCategoria)}
              </select>
              <select data-filtro="filtroInstitucion" class="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:bg-white max-w-[200px]">
                ${opt("todas", "Todas las instituciones", s.filtroInstitucion)}${inscripciones.filtros_disponibles.instituciones.map((i) => opt(i, i, s.filtroInstitucion)).join("")}
              </select>
              <div class="relative">
                ${icon("Search", { cls: "absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" })}
                <input type="text" placeholder="Buscar nombre o DNI..." value="${esc(s.busqueda)}" data-filtro="busqueda" class="rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white w-48 sm:w-60" />
              </div>
            </div>
          </div>
          ${grafico()}
          <div class="overflow-hidden rounded-3xl border border-black/[0.06] bg-white shadow-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th class="py-3.5 px-4">Participante</th>
                    <th class="py-3.5 px-4">DNI / Documento</th>
                    <th class="py-3.5 px-4">Categoría</th>
                    <th class="py-3.5 px-4">Universidad / Instituto</th>
                    <th class="py-3.5 px-4">Actividad</th>
                    <th class="py-3.5 px-4">Código Barras</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700" data-filas>${filasParticipantes()}</tbody>
              </table>
            </div>
          </div>
        </div>`
    }

    // ── PESTAÑA 3: FINANCIERO ──────────────────────────────────

    function tabFinanciero() {
      return `
        <div class="space-y-6">
          <div class="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold text-slate-900 m-0">Arqueo de Cobros en Efectivo (Caja Presencial)</h3>
                <p class="text-xs text-slate-500 mt-0.5">Comprobantes y recibos manuales emitidos por el registrador</p>
              </div>
              <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">Total en Caja: S/ <!---->${financiero.resumen.total_efectivo.toLocaleString("es-PE")}</span>
            </div>
            <div class="overflow-x-auto rounded-2xl border border-slate-100">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th class="py-3 px-4">Recibo de Caja</th>
                    <th class="py-3 px-4">Participante</th>
                    <th class="py-3 px-4">Concepto</th>
                    <th class="py-3 px-4">Monto Cobrado</th>
                    <th class="py-3 px-4">Responsable de Caja</th>
                    <th class="py-3 px-4">Fecha</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-700">${financiero.cobros_efectivo
                  .slice(0, 6)
                  .map(
                    (c) => `<tr class="hover:bg-slate-50/50">
                      <td class="py-2.5 px-4 font-mono font-bold text-blue-900">${c.numero_recibo}</td>
                      <td class="py-2.5 px-4 font-medium">${esc(c.participante_nombre)}</td>
                      <td class="py-2.5 px-4 capitalize">${c.concepto}</td>
                      <td class="py-2.5 px-4 font-extrabold text-emerald-700">S/ <!---->${c.monto.toFixed(2)}</td>
                      <td class="py-2.5 px-4 text-slate-500">${esc(c.registrado_por)}</td>
                      <td class="py-2.5 px-4 text-slate-400 font-mono">${c.fecha_pago}</td>
                    </tr>`,
                  )
                  .join("")}</tbody>
              </table>
            </div>
          </div>
        </div>`
    }

    // ── PESTAÑA 4: ASISTENCIA ──────────────────────────────────

    function tabAsistencia() {
      const c = asistencia.conferencias
      const dia = (n, d, txt, bar) => `
        <div class="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900 m-0">Conferencias — Día <!---->${n}</h3>
              <p class="text-xs text-slate-500 mt-0.5">${d.fecha ?? ""}</p>
            </div>
            <span class="text-2xl font-black ${txt}">${d.porcentaje}<!---->%</span>
          </div>
          <div class="mt-4 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full rounded-full ${bar} transition-all duration-500" style="width: ${d.porcentaje}%"></div>
          </div>
          <p class="mt-3 text-xs text-slate-500 font-medium">${d.asistentes}<!----> de <!---->${c.total_inscritos}<!----> asistentes confirmados</p>
        </div>`
      return `<div class="space-y-6"><div class="grid gap-6 md:grid-cols-2">${dia(1, c.dia_1, "text-blue-600", "bg-blue-600")}${dia(2, c.dia_2, "text-indigo-600", "bg-indigo-600")}</div></div>`
    }

    // ── PESTAÑA 5: TALLERES ────────────────────────────────────

    function tabTalleres() {
      return `
        <div class="space-y-6">
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${talleres.talleres
            .map(
              (t) => `<div class="relative overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-5 shadow-sm transition hover:shadow-md">
                ${t.alcanzo_aforo_maximo ? '<span class="absolute top-3 right-3 rounded-full bg-rose-500 text-white px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider animate-pulse">Aforo 100%</span>' : ""}
                <h4 class="text-sm font-bold text-slate-900 m-0 pr-16 leading-snug">${esc(t.titulo)}</h4>
                <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">${icon("MapPin", { cls: "h-3 w-3 text-slate-400" })} <!---->${esc(t.ubicacion)}</p>
                <div class="mt-4">
                  <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Ocupación: <!---->${t.porcentaje_ocupacion}<!---->%</span>
                    <span>${t.cupos_ocupados}<!---->/<!---->${t.aforo_maximo}<!----> cupos</span>
                  </div>
                  <div class="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500 ${t.alcanzo_aforo_maximo ? "bg-rose-500" : "bg-emerald-500"}" style="width: ${t.porcentaje_ocupacion}%"></div>
                  </div>
                </div>
                <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-medium">
                  <span class="flex items-center gap-1 font-mono text-[11px]">${icon("Clock", { cls: "h-3.5 w-3.5 text-slate-400" })} <!---->${t.horario}</span>
                  <span class="font-bold text-slate-700">${t.cupos_disponibles}<!----> libres</span>
                </div>
              </div>`,
            )
            .join("")}</div>
        </div>`
    }

    // ── PESTAÑA 6: CERTIFICACIÓN ───────────────────────────────

    function tabCertificacion() {
      return `
        <div class="space-y-6">${
          certificacion.documentos_con_error.length > 0
            ? `<div class="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 shadow-sm">
                <div class="flex items-center gap-3 mb-4">
                  <div class="rounded-xl bg-rose-500 p-2 text-white">${icon("AlertCircle", { cls: "h-4 w-4" })}</div>
                  <div>
                    <h4 class="text-sm font-bold text-rose-950 m-0">Incidencias en Envío de Documentos (<!---->${certificacion.documentos_con_error.length}<!----> detectadas)</h4>
                    <p class="text-xs text-rose-700 mt-0.5">Certificados o constancias que no pudieron entregarse al correo del participante:</p>
                  </div>
                </div>
                <div class="overflow-x-auto rounded-2xl bg-white border border-rose-100">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-rose-50/50 text-rose-900 font-bold uppercase">
                      <tr>
                        <th class="py-2.5 px-4">Código</th>
                        <th class="py-2.5 px-4">Participante</th>
                        <th class="py-2.5 px-4">Correo</th>
                        <th class="py-2.5 px-4">Motivo de Falla</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-rose-50 text-slate-700">${certificacion.documentos_con_error
                      .map(
                        (d) => `<tr class="hover:bg-rose-50/20">
                          <td class="py-2 px-4 font-mono font-bold text-rose-700">${d.codigo_verificacion}</td>
                          <td class="py-2 px-4 font-medium">${esc(d.participante_nombre)}</td>
                          <td class="py-2 px-4 text-slate-500">${esc(d.email)}</td>
                          <td class="py-2 px-4 text-rose-600 font-medium">${esc(d.error_detalle)}</td>
                        </tr>`,
                      )
                      .join("")}</tbody>
                  </table>
                </div>
              </div>`
            : ""
        }</div>`
    }

    const TABS = { resumen: tabResumen, inscripciones: tabInscripciones, financiero: tabFinanciero, asistencia: tabAsistencia, talleres: tabTalleres, certificacion: tabCertificacion }

    function render() {
      root.innerHTML = `<div class="space-y-6 pb-12">${cabecera()}${TABS[s.activeTab]()}</div>`
    }

    // Actualizaciones parciales: no se pierde el foco del buscador ni se repinta todo al pasar el mouse.
    function refrescarTabla() {
      const filas = root.querySelector("[data-filas]")
      if (!filas) return render()
      filas.innerHTML = filasParticipantes()
      root.querySelector("[data-contador]").innerHTML = `Mostrando <!---->${participantesFiltrados().length}<!----> de <!---->${inscripciones.resumen.total_inscritos}<!----> participantes`
    }

    function refrescarGrafico() {
      const g = root.querySelector("[data-grafico]")
      if (!g) return
      const tmp = document.createElement("div")
      tmp.innerHTML = grafico()
      g.replaceWith(tmp.firstElementChild)
    }

    root.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-tab]")
      const copy = e.target.closest("[data-copy]")
      if (tab) {
        s.activeTab = tab.dataset.tab
        render()
      } else if (copy) {
        const dni = copy.dataset.copy
        if (navigator.clipboard) navigator.clipboard.writeText(dni).catch(() => {})
        s.copiadoDNI = dni
        refrescarTabla()
        setTimeout(() => {
          s.copiadoDNI = null
          refrescarTabla()
        }, 2000)
      } else if (e.target.closest("[data-excel]")) descargarExcel(s.activeTab)
      else if (e.target.closest("[data-print]")) window.print()
    })

    root.addEventListener("change", (e) => {
      const key = e.target.dataset.filtro
      if (key && key !== "busqueda") {
        s[key] = e.target.value
        refrescarTabla()
      }
    })

    root.addEventListener("input", (e) => {
      if (e.target.dataset.filtro === "busqueda") {
        s.busqueda = e.target.value
        refrescarTabla()
      }
    })

    // onMouseEnter / onMouseLeave de las barras y de la leyenda.
    root.addEventListener("mouseover", (e) => {
      const bar = e.target.closest("[data-fecha]")
      const leyenda = e.target.closest("[data-serie]")
      if (bar && s.hoveredBarDate !== bar.dataset.fecha) {
        s.hoveredBarDate = bar.dataset.fecha
        refrescarGrafico()
      } else if (leyenda) {
        const serie = leyenda.dataset.serie || null
        if (s.activeBarSeries !== serie) {
          s.activeBarSeries = serie
          refrescarGrafico()
        }
      }
    })

    root.addEventListener("mouseout", (e) => {
      const bar = e.target.closest("[data-fecha]")
      const leyenda = e.target.closest("[data-serie]")
      if (bar && !bar.contains(e.relatedTarget) && s.hoveredBarDate) {
        s.hoveredBarDate = null
        refrescarGrafico()
      } else if (leyenda && leyenda.dataset.serie && !leyenda.contains(e.relatedTarget) && s.activeBarSeries) {
        s.activeBarSeries = null
        refrescarGrafico()
      }
    })

    render()
  }
})()
