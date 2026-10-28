/*
 * Datos de prueba del panel: mismo algoritmo que backend/database/seeders/ReportesTestDataSeeder.php
 * y mismas respuestas que ReporteController (GET /admin/reportes/*), calculadas en el navegador.
 * Lo aleatorio del seeder (orden de instituciones, códigos) usa una semilla fija para que no cambie.
 *
 * La base de producción (conferenciasfiis.cloud) está vacía: sin actividades, inscritos, pagos
 * ni documentos. Para ser idéntico, el prototipo arranca igual. Con true se cargan los 150
 * participantes del seeder; también se activa abriendo el panel con ?datos=prueba.
 */
;(function () {
  const DATOS_DE_PRUEBA = false || new URLSearchParams(location.search).get("datos") === "prueba"
  let seed = 20261125
  function rand() {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const randInt = (min, max) => min + Math.floor(rand() * (max - min + 1))
  const randomStr = (n) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let out = ""
    for (let i = 0; i < n; i++) out += chars[Math.floor(rand() * chars.length)]
    return out
  }
  const slug = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d
  const pad = (n, len) => String(n).padStart(len, "0")

  // 1. Actividades
  const actividades = !DATOS_DE_PRUEBA ? [] : [
    { id: 1, titulo: "Conferencias Magistrales - Día 1: Nube, Datos y Software", tipo: "conferencia", fecha: "2026-11-25", hora_inicio: "08:30:00", hora_fin: "13:00:00", ponente: "Ing. Einstein Ortiz / Ing. Abel Silva / Mg. Julio Gonzales", ubicacion: "Auditorio Central UNAS", aforo_maximo: 350 },
    { id: 2, titulo: "Conferencias Magistrales - Día 2: Inteligencia Artificial y Amazonía Digital", tipo: "conferencia", fecha: "2026-11-26", hora_inicio: "08:30:00", hora_fin: "13:00:00", ponente: "José Cárdenas Vega / Msc. Darwin Guerrero / Incuba UNAS", ubicacion: "Auditorio Central UNAS", aforo_maximo: 350 },
    { id: 3, titulo: "Taller: Microservicios con Laravel y Docker", tipo: "taller", fecha: "2026-11-25", hora_inicio: "16:00:00", hora_fin: "19:00:00", ponente: "Mg. Abraham Ríos Rivera", ubicacion: "Laboratorio de Simulación", aforo_maximo: 20 },
    { id: 4, titulo: "Taller: Desarrollo Web Moderno con React 19 y Next.js", tipo: "taller", fecha: "2026-11-25", hora_inicio: "16:00:00", hora_fin: "19:00:00", ponente: "Mg. Alberto Acevedo", ubicacion: "Laboratorio de Ingeniería de Software", aforo_maximo: 20 },
    { id: 5, titulo: "Taller: Infraestructura Cloud y DevOps", tipo: "taller", fecha: "2026-11-25", hora_inicio: "16:00:00", hora_fin: "19:00:00", ponente: "Mg. Juan Ramos Estela", ubicacion: "Laboratorio Multipropósito", aforo_maximo: 25 },
    { id: 6, titulo: "Taller: Visión Artificial y Deep Learning con Python", tipo: "taller", fecha: "2026-11-26", hora_inicio: "16:00:00", hora_fin: "19:00:00", ponente: "Mg. Jimmy Loloy Laurencio", ubicacion: "Laboratorio de Ingeniería de Software", aforo_maximo: 25 },
    { id: 7, titulo: "Taller: Ethical Hacking y Análisis de Vulnerabilidades", tipo: "taller", fecha: "2026-11-26", hora_inicio: "15:00:00", hora_fin: "18:00:00", ponente: "Ing. Max D. Condor", ubicacion: "Laboratorio de Simulación", aforo_maximo: 25 },
    { id: 8, titulo: "Taller: Optimización y Tuning en PostgreSQL", tipo: "taller", fecha: "2026-11-26", hora_inicio: "16:00:00", hora_fin: "19:00:00", ponente: "Mg. Jorge Jara Linares", ubicacion: "Laboratorio Multipropósito", aforo_maximo: 20 },
  ]
  const [conf1, conf2] = actividades
  const talleres = actividades.filter((a) => a.tipo === "taller")
  const tallerTargets = { 3: 20, 4: 18, 5: 15, 6: 25, 7: 22, 8: 14 }
  const tallerCounters = { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 }

  // 2. Participantes, pagos, asistencias y documentos
  const instituciones = {
    UNAS: 70,
    UNHEVAL: 28,
    "Universidad de Huánuco (UDH)": 18,
    "SENATI Tingo María": 14,
    "Colegio de Ingenieros del Perú": 10,
    "Profesionales Independientes": 10,
  }
  const nombresLista = ["Carlos", "María", "José", "Ana", "Luis", "Diana", "Jorge", "Lucía", "Miguel", "Paola", "Fernando", "Rosa", "David", "Elena", "Ricardo", "Carmen", "Gabriel", "Fiorella", "Víctor", "Andrea", "Diego", "Sofía", "Manuel", "Patricia", "Daniel", "Claudia", "Christian", "Camila", "Alejandro", "Karla", "Javier", "Valeria", "Eduardo", "Natalia", "Raúl", "Jessica", "César", "Vanessa", "Héctor", "Adriana"]
  const apellidosLista = ["García", "Rodríguez", "Gonzales", "Paredes", "López", "Sánchez", "Pérez", "Torres", "Ramírez", "Flores", "Castillo", "Vargas", "Reyes", "Morales", "Mendoza", "Rojas", "Espinoza", "Guerrero", "Medina", "Vega", "Chávez", "Ramos", "Herrera", "Silva", "Castro", "Romero", "Díaz", "Alvarez", "Ruiz", "Fernández"]
  const diasInscripcion = ["2026-11-01", "2026-11-05", "2026-11-10", "2026-11-15", "2026-11-20", "2026-11-22", "2026-11-24"]

  const pool = []
  for (const [inst, n] of Object.entries(instituciones)) for (let i = 0; i < n; i++) pool.push(inst)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }

  const participantes = []
  const inscripcionesAct = [] // { participante_id, actividad_id }
  const pagos = []
  const asistencias = [] // { participante_id, actividad_id, fecha }
  const documentos = []

  for (let i = 1; i <= (DATOS_DE_PRUEBA ? 150 : 0); i++) {
    const nombre = nombresLista[(i * 3 + 7) % nombresLista.length]
    const ap1 = apellidosLista[(i * 5 + 3) % apellidosLista.length]
    const ap2 = apellidosLista[(i * 7 + 11) % apellidosLista.length]
    const categoria = i <= 100 ? "estudiante" : "publico_general"
    const tipo = i <= 90 ? "ambas" : i <= 125 ? "solo_conferencias" : "solo_talleres"
    const fecha = diasInscripcion[i % diasInscripcion.length]

    const p = {
      id: i,
      nombre_completo: `${nombre} ${ap1} ${ap2}`,
      numero_documento: pad(70000000 + i * 123 + 45, 8),
      email: `${slug(nombre)}.${slug(ap1)}${i}@correo.test`,
      telefono: "9" + pad(80000000 + i * 456, 8),
      categoria,
      institucion: pool[i - 1] || "UNAS",
      tipo_actividad: tipo,
      codigo_barras: "FIIS26-" + randomStr(8),
      fecha_inscripcion: fecha,
    }
    participantes.push(p)

    const mias = []
    if (tipo === "solo_conferencias" || tipo === "ambas") mias.push(conf1.id, conf2.id)
    if (tipo === "solo_talleres" || tipo === "ambas") {
      for (const tId of Object.keys(tallerTargets)) {
        if (tallerCounters[tId] < tallerTargets[tId]) {
          mias.push(Number(tId))
          tallerCounters[tId]++
          break
        }
      }
    }
    mias.forEach((aid) => inscripcionesAct.push({ participante_id: i, actividad_id: aid }))

    const tarifas = categoria === "estudiante" ? { solo_conferencias: 30, solo_talleres: 35, ambas: 50 } : { solo_conferencias: 60, solo_talleres: 70, ambas: 100 }
    const monto = tarifas[tipo]
    const esPasarela = i % 3 !== 0
    const comision = esPasarela ? round(monto * 0.045 + 0.5, 2) : 0
    pagos.push({
      id: i,
      participante: p,
      metodo: esPasarela ? "pasarela" : "efectivo",
      concepto: { solo_conferencias: "conferencias", solo_talleres: "talleres", ambas: "ambas" }[tipo],
      monto_bruto: monto,
      comision_pasarela: comision,
      monto_neto: round(monto - comision, 2),
      numero_operacion: esPasarela ? "OP-PAY-" + randInt(100000, 999999) : "CAJA-REC-" + pad(i, 4),
      registrado_por: esPasarela ? null : "Registrador Demo",
      fecha_pago: fecha,
    })

    if (i <= 105) {
      asistencias.push({ participante_id: i, actividad_id: conf1.id, fecha: conf1.fecha })
      asistencias.push({ participante_id: i, actividad_id: conf2.id, fecha: conf2.fecha })
    } else if (i <= 118) {
      asistencias.push({ participante_id: i, actividad_id: conf1.id, fecha: conf1.fecha })
    } else if (i <= 125) {
      asistencias.push({ participante_id: i, actividad_id: conf2.id, fecha: conf2.fecha })
    }
    if (i <= 120) {
      mias
        .map((aid) => actividades.find((a) => a.id === aid))
        .filter((a) => a.tipo === "taller")
        .forEach((a) => asistencias.push({ participante_id: i, actividad_id: a.id, fecha: a.fecha }))
    }

    if (i <= 105) {
      let estado = "enviado"
      let error = null
      if (i > 95 && i <= 100) estado = "pendiente"
      else if (i > 100) {
        estado = "error"
        error = i % 2 === 0 ? "Buzón de correo del destinatario lleno (552 Mailbox quota exceeded)" : "Servidor de correo no respondió (Connection timed out)"
      }
      documentos.push({ id: documentos.length + 1, participante: p, tipo: "certificado", codigo_verificacion: "CERT-FIIS-2026-" + pad(i, 5), horas_academicas: 30, estado_envio: estado, fecha_emision: "2026-11-27", error_detalle: error })
    } else if (i <= 125) {
      let estado = "enviado"
      let error = null
      if (i >= 122 && i <= 123) estado = "pendiente"
      else if (i >= 124) {
        estado = "error"
        error = "Dirección de correo rechazada por el servidor destino (550 User not found)"
      }
      documentos.push({ id: documentos.length + 1, participante: p, tipo: "constancia", codigo_verificacion: "CONST-FIIS-2026-" + pad(i, 5), horas_academicas: 15, estado_envio: estado, fecha_emision: "2026-11-27", error_detalle: error })
    }
  }

  const inscritosEn = (aid) => inscripcionesAct.filter((x) => x.actividad_id === aid).length
  const asistenciasEn = (aid) => asistencias.filter((x) => x.actividad_id === aid).length
  const pct = (n, total) => (total > 0 ? round((n / total) * 100, 1) : 0)
  const sum = (arr, key) => arr.reduce((t, x) => t + x[key], 0)

  // GET /admin/reportes/inscripciones
  const total = participantes.length
  const countBy = (key, value) => participantes.filter((p) => p[key] === value).length
  const porInst = {}
  participantes.forEach((p) => (porInst[p.institucion] = (porInst[p.institucion] || 0) + 1))

  const inscripciones = {
    resumen: {
      total_inscritos: total,
      estudiantes: countBy("categoria", "estudiante"),
      publico_general: countBy("categoria", "publico_general"),
      solo_conferencias: countBy("tipo_actividad", "solo_conferencias"),
      solo_talleres: countBy("tipo_actividad", "solo_talleres"),
      ambas: countBy("tipo_actividad", "ambas"),
    },
    por_institucion: Object.entries(porInst)
      .sort((a, b) => b[1] - a[1])
      .map(([institucion, n]) => ({ institucion, total: n, porcentaje: pct(n, total) })),
    por_fecha: [...new Set(participantes.map((p) => p.fecha_inscripcion))].sort().map((fecha) => {
      const del = participantes.filter((p) => p.fecha_inscripcion === fecha)
      return {
        fecha,
        total: del.length,
        estudiantes: del.filter((p) => p.categoria === "estudiante").length,
        publico_general: del.filter((p) => p.categoria === "publico_general").length,
      }
    }),
    participantes: [...participantes].reverse().slice(0, 100),
    filtros_disponibles: {
      instituciones: Object.keys(porInst).sort(),
      categorias: ["estudiante", "publico_general"],
      tipos_actividad: ["solo_conferencias", "solo_talleres", "ambas"],
    },
  }

  // GET /admin/reportes/financiero
  const byMetodo = (m) => pagos.filter((p) => p.metodo === m)
  const totalBruto = sum(pagos, "monto_bruto")
  const totalComisiones = sum(pagos, "comision_pasarela")
  const totalEfectivo = sum(byMetodo("efectivo"), "monto_bruto")
  const totalPasarela = sum(byMetodo("pasarela"), "monto_bruto")
  const byConcepto = (c) => round(sum(pagos.filter((p) => p.concepto === c), "monto_bruto"), 2)
  const pagoRow = (p) => ({
    id: p.id,
    participante_nombre: p.participante.nombre_completo,
    dni: p.participante.numero_documento,
    categoria: p.participante.categoria,
    institucion: p.participante.institucion,
    concepto: p.concepto,
    metodo: p.metodo,
    monto_bruto: p.monto_bruto,
    comision_pasarela: p.comision_pasarela,
    monto_neto: p.monto_neto,
    numero_operacion: p.numero_operacion,
    registrado_por: p.registrado_por,
    fecha_pago: p.fecha_pago,
  })

  const financiero = {
    resumen: {
      total_recaudado_bruto: round(totalBruto, 2),
      total_comisiones_pasarela: round(totalComisiones, 2),
      total_neto_recibido: round(sum(pagos, "monto_neto"), 2),
      total_efectivo: round(totalEfectivo, 2),
      total_pasarela: round(totalPasarela, 2),
      total_transacciones: pagos.length,
    },
    por_concepto: { conferencias: byConcepto("conferencias"), talleres: byConcepto("talleres"), ambas: byConcepto("ambas") },
    por_metodo: {
      pasarela: { bruto: round(totalPasarela, 2), comisiones: round(totalComisiones, 2), neto: round(totalPasarela - totalComisiones, 2), transacciones: byMetodo("pasarela").length },
      efectivo: { bruto: round(totalEfectivo, 2), comisiones: 0, neto: round(totalEfectivo, 2), transacciones: byMetodo("efectivo").length },
    },
    cobros_efectivo: byMetodo("efectivo")
      .reverse()
      .map((p) => ({
        id: p.id,
        participante_nombre: p.participante.nombre_completo,
        dni: p.participante.numero_documento,
        categoria: p.participante.categoria,
        concepto: p.concepto,
        monto: p.monto_bruto,
        registrado_por: p.registrado_por || "Caja Central",
        fecha_pago: p.fecha_pago,
        numero_recibo: p.numero_operacion,
      })),
    pagos_detalle: [...pagos].reverse().slice(0, 100).map(pagoRow),
  }

  // GET /admin/reportes/asistencia
  const inscritosConf = participantes.filter((p) => p.tipo_actividad !== "solo_talleres").map((p) => p.id)
  const asistentesDia = (conf) => new Set(asistencias.filter((a) => conf && a.actividad_id === conf.id).map((a) => a.participante_id))
  const d1 = asistentesDia(conf1)
  const d2 = asistentesDia(conf2)
  const ambos = [...d1].filter((id) => d2.has(id))
  const soloD1 = [...d1].filter((id) => !d2.has(id))
  const soloD2 = [...d2].filter((id) => !d1.has(id))
  const ausentes = inscritosConf.filter((id) => !d1.has(id) && !d2.has(id))
  const tc = inscritosConf.length

  const asistencia = {
    conferencias: {
      total_inscritos: tc,
      dia_1: { fecha: conf1 ? conf1.fecha : null, asistentes: d1.size, porcentaje: pct(d1.size, tc) },
      dia_2: { fecha: conf2 ? conf2.fecha : null, asistentes: d2.size, porcentaje: pct(d2.size, tc) },
      ambos_dias: { total: ambos.length, porcentaje: pct(ambos.length, tc) },
      solo_un_dia: { total: soloD1.length + soloD2.length, porcentaje: pct(soloD1.length + soloD2.length, tc), desglose: { solo_dia_1: soloD1.length, solo_dia_2: soloD2.length } },
      ausentes: { total: ausentes.length, porcentaje: pct(ausentes.length, tc) },
    },
    talleres: [...talleres]
      .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio))
      .map((t) => {
        const ins = inscritosEn(t.id)
        const asi = asistenciasEn(t.id)
        return { actividad_id: t.id, titulo: t.titulo, ponente: t.ponente, ubicacion: t.ubicacion, fecha: t.fecha, hora_inicio: t.hora_inicio, hora_fin: t.hora_fin, aforo_maximo: t.aforo_maximo, inscritos: ins, asistentes: asi, ausentes: Math.max(0, ins - asi), porcentaje_asistencia: pct(asi, ins) }
      }),
    por_actividad: actividades.map((a) => ({ id: a.id, titulo: a.titulo, tipo: a.tipo, fecha: a.fecha, inscritos: inscritosEn(a.id), asistentes: asistenciasEn(a.id), porcentaje_asistencia: pct(asistenciasEn(a.id), inscritosEn(a.id)) })),
  }

  // GET /admin/reportes/talleres
  const talleresData = [...talleres]
    .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio))
    .map((t) => {
      const ocupados = inscritosEn(t.id)
      const horario = `${t.hora_inicio.slice(0, 5)} - ${t.hora_fin.slice(0, 5)}`
      return {
        id: t.id,
        titulo: t.titulo,
        ponente: t.ponente,
        ubicacion: t.ubicacion,
        fecha: t.fecha,
        horario,
        aforo_maximo: t.aforo_maximo,
        cupos_ocupados: ocupados,
        cupos_disponibles: Math.max(0, t.aforo_maximo - ocupados),
        porcentaje_ocupacion: pct(ocupados, t.aforo_maximo),
        alcanzo_aforo_maximo: ocupados >= t.aforo_maximo,
        asistentes: asistenciasEn(t.id),
      }
    })
  const grupos = {}
  talleresData.forEach((t) => {
    const key = `${t.fecha} | ${t.horario}`
    ;(grupos[key] = grupos[key] || []).push(t)
  })
  const aforoTotal = sum(talleresData, "aforo_maximo")
  const ocupadosTotal = sum(talleresData, "cupos_ocupados")

  const talleresRep = {
    resumen: {
      total_talleres: talleresData.length,
      aforo_total: aforoTotal,
      cupos_ocupados: ocupadosTotal,
      cupos_disponibles: sum(talleresData, "cupos_disponibles"),
      porcentaje_global_ocupacion: pct(ocupadosTotal, aforoTotal),
      total_talleres_llenos: talleresData.filter((t) => t.alcanzo_aforo_maximo).length,
    },
    talleres: talleresData,
    talleres_aforo_maximo: talleresData.filter((t) => t.alcanzo_aforo_maximo),
    por_fecha_horario: Object.entries(grupos).map(([key, items]) => {
      const [fecha, horario] = key.split(" | ")
      const aforo = sum(items, "aforo_maximo")
      const ocup = sum(items, "cupos_ocupados")
      return { fecha, horario, total_talleres: items.length, cupos_ocupados: ocup, aforo_total: aforo, porcentaje_ocupacion: pct(ocup, aforo) }
    }),
  }

  // GET /admin/reportes/certificacion
  const docCount = (fn) => documentos.filter(fn).length
  const enviados = docCount((d) => d.estado_envio === "enviado")
  const errores = docCount((d) => d.estado_envio === "error")
  const docRow = (d) => ({
    id: d.id,
    codigo_verificacion: d.codigo_verificacion,
    tipo: d.tipo,
    participante_nombre: d.participante.nombre_completo,
    dni: d.participante.numero_documento,
    email: d.participante.email,
    horas_academicas: d.horas_academicas,
    estado_envio: d.estado_envio,
    fecha_emision: d.fecha_emision,
    error_detalle: d.error_detalle,
  })

  const certificacion = {
    resumen: {
      total_documentos: documentos.length,
      total_certificados: docCount((d) => d.tipo === "certificado"),
      total_constancias: docCount((d) => d.tipo === "constancia"),
      enviados_correctamente: enviados,
      pendientes_envio: docCount((d) => d.estado_envio === "pendiente"),
      con_errores_envio: errores,
      tasa_entrega: enviados + errores > 0 ? round((enviados / (enviados + errores)) * 100, 1) : 0,
    },
    documentos_con_error: documentos.filter((d) => d.estado_envio === "error").reverse().map(docRow),
    listado: [...documentos].reverse().slice(0, 100).map(docRow),
  }

  window.FIISReportes = { inscripciones, financiero, asistencia, talleres: talleresRep, certificacion }
})()
