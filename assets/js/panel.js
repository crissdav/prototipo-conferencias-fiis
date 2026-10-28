/*
 * Panel interno: menú por rol, rutas (#/panel, #/usuarios, …) y pantallas.
 * El marcado copia los className de PanelShell.tsx, PanelNav.tsx, panel/page.tsx y ModuloPlantilla.tsx.
 */
;(function () {
  const usuario = FIISAuth.getSession()
  if (!usuario) return

  const ROLES = ["administrador", "registrador", "asistencia", "certificacion"]

  /** Registro único de pantallas del panel (lib/auth/roles.ts). */
  const MODULOS = [
    { href: "/panel", titulo: "Inicio", descripcion: "Resumen del rol y accesos rápidos.", icon: "LayoutDashboard", roles: ROLES, grupo: "General", historias: ["HU-01", "HU-AS-01", "HU-CER-02"], endpoints: ["GET /auth/me"] },

    { href: "/usuarios", titulo: "Usuarios y roles", descripcion: "Crear, editar, eliminar y asignar roles al personal; restablecer cuentas bloqueadas.", icon: "UserCog", roles: ["administrador"], grupo: "Administración", historias: ["HU-02", "HU-03"], endpoints: ["GET /admin/roles", "GET|POST /admin/usuarios", "PUT|DELETE /admin/usuarios/{id}", "POST /admin/usuarios/{id}/desbloquear"] },
    { href: "/actividades", titulo: "Conferencias y talleres", descripcion: "Datos, ponentes, fechas, horarios, ubicaciones, aforo de talleres y precios por categoría.", icon: "CalendarDays", roles: ["administrador"], grupo: "Administración", historias: ["HU-05", "HU-06", "HU-07", "HU-08", "HU-09"], endpoints: ["GET|POST /admin/actividades", "PUT|DELETE /admin/actividades/{id}", "GET|PUT /admin/precios"] },
    { href: "/participantes", titulo: "Participantes", descripcion: "Lista de todos los participantes inscritos.", icon: "Users", roles: ["administrador"], grupo: "Administración", historias: ["HU-04"], endpoints: ["GET /admin/participantes"] },
    { href: "/reportes", titulo: "Reportes y estadísticas", descripcion: "Inscripciones, finanzas, asistencia, talleres y certificación; filtros y exportación.", icon: "BarChart3", roles: ["administrador"], grupo: "Administración", historias: ["HU-10", "HU-11", "HU-12", "HU-13", "HU-14", "HU-15", "HU-16", "HU-17", "HU-18"], endpoints: ["GET /admin/reportes/{inscripciones|financiero|asistencia|talleres|certificacion}", "GET /admin/reportes/{reporte}/exportar"] },

    { href: "/registro", titulo: "Registro presencial", descripcion: "Inscribir estudiantes o público general, elegir actividades, cobrar en efectivo y confirmar con código de barras.", icon: "UserPlus", roles: ["registrador"], grupo: "Registro", historias: ["EP-05 Registrar presencialmente a un estudiante", "EP-05 Registrar presencialmente al público general", "EP-05 Seleccionar las actividades", "EP-06 Conocer el importe a cobrar", "EP-06 Registrar el pago en efectivo", "EP-07 Confirmar el registro presencial"], endpoints: ["POST /registro/inscripciones", "POST /pagos/cotizar", "POST /registro/cobros", "POST /registro/inscripciones/{id}/confirmar"] },
    { href: "/registro/cobros", titulo: "Mis registros y cobros", descripcion: "Registros presenciales y cobros en efectivo realizados, para cuadrar caja.", icon: "Wallet", roles: ["registrador"], grupo: "Registro", historias: ["EP-06 Consultar los registros y cobros que realicé"], endpoints: ["GET /registro/inscripciones", "GET /registro/cobros"] },

    { href: "/asistencia", titulo: "Control de asistencia", descripcion: "Elegir fecha y actividad, escanear códigos, validar inscripción y advertir duplicados.", icon: "ScanLine", roles: ["asistencia"], grupo: "Asistencia", historias: ["HU-AS-02", "HU-AS-03", "HU-AS-04", "HU-AS-05", "HU-AS-07", "HU-AS-08", "HU-AS-09", "HU-19"], endpoints: ["GET /asistencia/actividades", "POST /asistencia/escaneos"] },
    { href: "/asistencia/listas", titulo: "Presentes y ausentes", descripcion: "Listas por actividad y fecha.", icon: "ListChecks", roles: ["asistencia"], grupo: "Asistencia", historias: ["HU-AS-06", "HU-19"], endpoints: ["GET /asistencia/listas"] },

    { href: "/certificacion/plantillas", titulo: "Plantillas", descripcion: "Diseño de plantillas de certificado y de constancia.", icon: "FileSignature", roles: ["certificacion"], grupo: "Certificación", historias: ["HU-CER-04", "HU-CER-05"], endpoints: ["GET|POST /certificacion/plantillas", "PUT|DELETE /certificacion/plantillas/{id}"] },
    { href: "/certificacion/informacion", titulo: "Información de documentos", descripcion: "Nombre del evento, horas académicas, firmantes y demás datos fijos.", icon: "FileText", roles: ["certificacion"], grupo: "Certificación", historias: ["HU-CER-06"], endpoints: ["GET|PUT /certificacion/informacion"] },
    { href: "/certificacion/generacion", titulo: "Generación", descripcion: "Clasificar inscritos según asistencia y generar certificados en lote.", icon: "Award", roles: ["certificacion"], grupo: "Certificación", historias: ["HU-CER-07", "HU-CER-08", "HU-CER-09", "HU-CER-11", "HU-20"], endpoints: ["GET /certificacion/clasificacion", "POST /certificacion/generaciones", "GET /certificacion/documentos/{id}/previsualizar"] },
    { href: "/certificacion/constancias", titulo: "Constancias", descripcion: "Generar, listar, regenerar y anular constancias de participación.", icon: "ClipboardList", roles: ["certificacion"], grupo: "Certificación", historias: ["HU-CER-10", "HU-CER-11"], endpoints: ["POST /certificacion/generaciones", "GET /certificacion/documentos?tipo=constancia"] },
    { href: "/certificacion/envios", titulo: "Envíos", descripcion: "Enviar documentos por correo, ver su estado y reenviar los fallidos.", icon: "Mail", roles: ["certificacion"], grupo: "Certificación", historias: ["HU-CER-12", "HU-CER-13", "HU-20"], endpoints: ["POST /certificacion/envios", "GET /certificacion/envios", "POST /certificacion/documentos/{id}/reenviar"] },
    { href: "/certificacion/consultas", titulo: "Consultas", descripcion: "Buscar y filtrar documentos generados y pendientes de envío.", icon: "Search", roles: ["certificacion"], grupo: "Certificación", historias: ["HU-CER-14"], endpoints: ["GET /certificacion/documentos"] },
  ]

  const puedeAcceder = (rol, m) => rol === "administrador" || m.roles.includes(rol)
  const modulosDe = (rol) => MODULOS.filter((m) => puedeAcceder(rol, m))
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
  const link = (href) => `#${href}`
  /** springUI de motionPresets.ts (bounce 0, 0.35 s) y springDrawer (bounce 0.15, 0.32 s), aproximados con curvas CSS. */
  const SPRING_UI = "350ms cubic-bezier(0.32, 0.72, 0, 1)"
  const SPRING_DRAWER = "320ms cubic-bezier(0.34, 1.2, 0.64, 1)"

  // ── Barra superior ───────────────────────────────────────────

  document.getElementById("user-name").textContent = usuario.nombre
  document.getElementById("user-rol").textContent = usuario.rol_nombre
  document.getElementById("logout-form").addEventListener("submit", (e) => {
    e.preventDefault()
    FIISAuth.logout()
    location.replace(LOGIN_URL)
  })

  // ── Menú lateral (PanelNav.tsx) ──────────────────────────────

  const PRESS = "transition-[background-color,color,transform] duration-150 active:scale-[0.97] motion-reduce:active:scale-100"
  const modulos = modulosDe(usuario.rol)
  const grupos = [...new Set(modulos.map((m) => m.grupo))]
  /** Lo que el usuario abrió o cerró a mano; si no tocó un grupo, solo se abre el de la página actual. */
  const manual = {}
  let rutaActual = null

  function enlace(m) {
    const activo = rutaActual === m.href
    return `<a href="${link(m.href)}" ${activo ? 'aria-current="page"' : ""} data-nav class="relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium no-underline ${PRESS} ${activo ? "text-leaf" : "text-white/85 hover:bg-white/10 hover:text-white"}">${
      activo ? '<span data-indicador class="absolute inset-0 rounded-xl bg-white shadow-[0_1px_2px_rgb(2_30_70/0.12),0_4px_12px_rgb(2_30_70/0.12)]" aria-hidden="true"></span>' : ""
    }${icon(m.icon, { cls: "relative h-4 w-4 shrink-0" })}<span class="relative">${esc(m.titulo)}</span></a>`
  }

  function renderNav(container, id) {
    const grupoActivo = (modulos.find((m) => m.href === rutaActual) || {}).grupo
    const estaAbierto = (g) => (manual[g] !== undefined ? manual[g] : g === grupoActivo)
    container.innerHTML = `<nav aria-label="Menú del panel" class="grid gap-1.5">${grupos
      .map((grupo) => {
        const items = modulos.filter((m) => m.grupo === grupo)
        // Solo el Administrador agrupa en submenús; los demás roles ven sus pocas opciones directamente.
        if (items.length === 1 || usuario.rol !== "administrador") return `<div class="grid gap-1.5">${items.map(enlace).join("")}</div>`
        const abierto = estaAbierto(grupo)
        const panelId = `${id}-${grupo}`
        return `<div>
          <button type="button" aria-expanded="${abierto}" aria-controls="${panelId}" data-grupo="${esc(grupo)}" class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[0.7rem] font-semibold tracking-[0.06em] text-white/65 uppercase hover:bg-white/10 hover:text-white ${PRESS}">${esc(grupo)}${
            !abierto && grupo === grupoActivo ? '<span class="h-1.5 w-1.5 rounded-full bg-white" aria-label="(página actual)"></span>' : ""
          }${icon("ChevronDown", { cls: `ml-auto h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]${abierto ? " rotate-180" : ""}` })}</button>${
            // Como AnimatePresence: un grupo cerrado no existe en la página.
            abierto ? `<div id="${panelId}" class="overflow-hidden"><div class="grid gap-0.5 pt-0.5 pb-1">${items.map(enlace).join("")}</div></div>` : ""
          }
        </div>`
      })
      .join("")}</nav>`
  }

  const navEscritorio = document.getElementById("nav-escritorio")
  let navMovil = null

  function renderNavs() {
    renderNav(navEscritorio, "nav-escritorio")
    if (navMovil) renderNav(navMovil, "nav-movil")
  }

  /** Despliega o pliega un grupo animando la altura (motion.div height 0 ↔ auto). */
  function animarAltura(el, abrir, alTerminar) {
    const alto = el.scrollHeight
    el.style.height = abrir ? "0px" : `${alto}px`
    el.style.opacity = abrir ? "0" : "1"
    el.getBoundingClientRect()
    el.style.transition = `height ${SPRING_UI}, opacity ${SPRING_UI}`
    el.style.height = abrir ? `${alto}px` : "0px"
    el.style.opacity = abrir ? "1" : "0"
    setTimeout(() => {
      el.style.transition = el.style.height = el.style.opacity = ""
      if (alTerminar) alTerminar()
    }, 360)
  }

  /** Un solo indicador que se desliza entre opciones (layoutId="indicador"): la selección se mueve, no parpadea. */
  function deslizarIndicador(container, desde) {
    const ind = container.querySelector("[data-indicador]")
    if (!ind || !desde) return
    const hasta = ind.getBoundingClientRect()
    if (!hasta.width) return
    const dx = desde.left - hasta.left
    const dy = desde.top - hasta.top
    if (!dx && !dy) return
    ind.style.transform = `translate(${dx}px, ${dy}px)`
    ind.getBoundingClientRect()
    ind.style.transition = `transform ${SPRING_UI}`
    ind.style.transform = ""
    setTimeout(() => (ind.style.transition = ""), 360)
  }

  function onNavClick(e) {
    const btn = e.target.closest("[data-grupo]")
    if (btn) {
      const grupo = btn.dataset.grupo
      const abrir = btn.getAttribute("aria-expanded") !== "true"
      const contenedores = [navEscritorio, navMovil].filter(Boolean)
      if (abrir) {
        manual[grupo] = true
        renderNavs()
        contenedores.forEach((c) => {
          const panel = c.querySelector(`[aria-controls$="-${grupo}"]`)?.nextElementSibling
          if (panel) animarAltura(panel, true)
        })
      } else {
        manual[grupo] = false
        const paneles = contenedores.map((c) => c.querySelector(`[aria-controls$="-${grupo}"]`)?.nextElementSibling).filter(Boolean)
        let pendientes = paneles.length
        if (!pendientes) renderNavs()
        paneles.forEach((p) => animarAltura(p, false, () => --pendientes === 0 && renderNavs()))
      }
      return
    }
    if (e.target.closest("[data-nav]") && this === navMovil) setDrawer(false)
  }

  navEscritorio.addEventListener("click", onNavClick)

  // ── Lateral móvil (LateralMovil en PanelShell.tsx) ───────────

  const drawerRoot = document.getElementById("drawer-root")
  const openBtn = document.getElementById("drawer-open")
  let drawerAbierto = false
  let prevOverflow = ""
  const ANCHO_MOVIL = 288
  const FUERA = ANCHO_MOVIL + 32

  function setDrawer(abrir) {
    if (abrir === drawerAbierto) return
    drawerAbierto = abrir
    openBtn.setAttribute("aria-expanded", String(abrir))
    if (abrir) {
      prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      drawerRoot.innerHTML = `
        <div class="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div class="absolute inset-0" data-fondo style="opacity:0">
            <button type="button" aria-label="Cerrar menú" class="absolute inset-0 bg-canopy/40 backdrop-blur-[2px]" data-cerrar></button>
          </div>
          <aside class="panel-lateral relative flex h-full w-[min(18rem,85vw)] flex-col overflow-y-auto shadow-2xl" data-lateral style="transform:translateX(-${FUERA}px)">
            <div class="flex h-16 shrink-0 items-center justify-between bg-white pr-3 pl-6">
              <div class="flex items-center gap-2.5">
                <img src="../assets/img/logo-fiis-96.webp" srcset="../assets/img/logo-fiis-48.webp 1x, ../assets/img/logo-fiis-96.webp 2x" alt="" width="36" height="36" decoding="async" data-nimg="1" style="color:transparent" class="h-9 w-9 shrink-0 object-contain" />
                <p class="m-0 text-lg font-semibold tracking-[-0.01em] text-leaf">Conferencias FIIS</p>
              </div>
              <button type="button" aria-label="Cerrar menú" class="rounded-lg p-2 text-ink transition-transform duration-150 hover:bg-parchment active:scale-90" data-cerrar>${icon("X", { cls: "h-5 w-5" })}</button>
            </div>
            <div class="px-3 py-5" id="nav-movil"></div>
          </aside>
        </div>`
      navMovil = drawerRoot.querySelector("#nav-movil")
      navMovil.addEventListener("click", onNavClick)
      renderNav(navMovil, "nav-movil")
      const fondo = drawerRoot.querySelector("[data-fondo]")
      const lateral = drawerRoot.querySelector("[data-lateral]")
      fondo.getBoundingClientRect()
      fondo.style.transition = `opacity ${SPRING_UI}`
      lateral.style.transition = `transform ${SPRING_DRAWER}`
      fondo.style.opacity = "1"
      lateral.style.transform = "translateX(0)"
      activarArrastre(lateral)
    } else {
      document.body.style.overflow = prevOverflow
      const fondo = drawerRoot.querySelector("[data-fondo]")
      const lateral = drawerRoot.querySelector("[data-lateral]")
      if (!fondo) return
      fondo.style.transition = `opacity ${SPRING_UI}`
      lateral.style.transition = `transform ${SPRING_DRAWER}`
      fondo.style.opacity = "0"
      lateral.style.transform = `translateX(-${FUERA}px)`
      setTimeout(() => {
        if (!drawerAbierto) {
          drawerRoot.innerHTML = ""
          navMovil = null
        }
      }, 340)
    }
  }

  /** Sigue al dedo hacia la izquierda y, al soltar, proyecta el impulso para decidir si se cierra. */
  function activarArrastre(lateral) {
    lateral.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return
      const x0 = e.clientX
      const y0 = e.clientY
      let dx = 0
      let eje = null
      let ultimo = { x: x0, t: e.timeStamp }
      let velocidad = 0
      const mover = (ev) => {
        dx = ev.clientX - x0
        if (eje === null && Math.hypot(dx, ev.clientY - y0) > 8) eje = Math.abs(dx) > Math.abs(ev.clientY - y0) ? "x" : "y"
        if (eje !== "x") return
        const dt = ev.timeStamp - ultimo.t
        if (dt > 0) velocidad = ((ev.clientX - ultimo.x) / dt) * 1000
        ultimo = { x: ev.clientX, t: ev.timeStamp }
        lateral.style.transition = "none"
        lateral.style.transform = `translateX(${dx < 0 ? dx : dx * 0.08}px)`
        drawerRoot.querySelector("[data-fondo] button").style.opacity = String(Math.max(0, 1 + Math.min(0, dx) / ANCHO_MOVIL))
      }
      const soltar = () => {
        window.removeEventListener("pointermove", mover)
        window.removeEventListener("pointerup", soltar)
        window.removeEventListener("pointercancel", soltar)
        if (eje !== "x") return
        const destino = dx + ((velocidad / 1000) * 0.998) / (1 - 0.998)
        if (destino < -ANCHO_MOVIL / 2) setDrawer(false)
        else {
          lateral.style.transition = `transform ${SPRING_DRAWER}`
          lateral.style.transform = "translateX(0)"
          drawerRoot.querySelector("[data-fondo] button").style.opacity = ""
        }
      }
      window.addEventListener("pointermove", mover)
      window.addEventListener("pointerup", soltar)
      window.addEventListener("pointercancel", soltar)
    })
  }

  openBtn.addEventListener("click", () => setDrawer(true))
  drawerRoot.addEventListener("click", (e) => {
    if (e.target.closest("[data-cerrar]")) setDrawer(false)
  })
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawerAbierto) setDrawer(false)
  })

  // ── Pantallas ────────────────────────────────────────────────

  /** PageHeader de ModuloPlantilla.tsx */
  function pageHeader(m) {
    return `
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div class="max-w-2xl">
          <div class="flex items-center gap-3">
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-leaf/10 text-leaf">${icon(m.icon, { cls: "h-5 w-5" })}</span>
            <h1 class="m-0 text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">${esc(m.titulo)}</h1>
          </div>
          <p class="m-0 mt-2.5 text-[0.95rem] leading-relaxed text-mist">${esc(m.descripcion)}</p>
        </div>
      </div>`
  }

  const METODO = {
    GET: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    POST: "bg-sky-50 text-sky-700 ring-sky-600/15",
    PUT: "bg-amber-50 text-amber-700 ring-amber-600/15",
    DELETE: "bg-rose-50 text-rose-700 ring-rose-600/15",
  }

  /** PendienteHU de ModuloPlantilla.tsx */
  function pendienteHU(m) {
    const endpoint = (e) => {
      const [metodos, ...ruta] = e.split(" ")
      return `<li class="flex flex-wrap items-center gap-1.5">${metodos
        .split("|")
        .map((met) => `<span class="rounded-md px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold ring-1 ring-inset ${METODO[met] || "bg-slate-50 text-slate-700 ring-slate-600/15"}">${met}</span>`)
        .join("")}<code class="font-mono text-[0.8rem] text-ink/80">${esc(ruta.join(" "))}</code></li>`
    }
    return `
      <section class="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_2px_rgb(2_30_70/0.04),0_8px_24px_-12px_rgb(2_30_70/0.08)]">
        <div class="flex items-start gap-3 border-b border-black/[0.05] bg-parchment/60 px-5 py-4 sm:px-6">
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-leaf shadow-[0_1px_2px_rgb(2_30_70/0.08)]">${icon("Construction", { cls: "h-[1.1rem] w-[1.1rem]" })}</span>
          <div>
            <h2 class="m-0 text-[0.95rem] font-semibold text-ink">Pantalla por implementar</h2>
            <p class="m-0 mt-0.5 text-sm text-mist">Esto es lo que debe cubrir y los endpoints que usa.</p>
          </div>
        </div>
        <div class="grid gap-px bg-black/[0.05] md:grid-cols-2">
          <div class="bg-white px-5 py-5 sm:px-6">
            <h3 class="m-0 text-[0.7rem] font-semibold tracking-[0.06em] text-mist uppercase">Historias de usuario</h3>
            <ul class="m-0 mt-3 grid list-none gap-2 p-0">${m.historias
              .map((hu) => `<li class="flex items-start gap-2.5 text-sm leading-snug text-ink">${icon("FileText", { cls: "mt-0.5 h-4 w-4 shrink-0 text-fog" })}${esc(hu)}</li>`)
              .join("")}</ul>
          </div>
          <div class="bg-white px-5 py-5 sm:px-6">
            <h3 class="m-0 text-[0.7rem] font-semibold tracking-[0.06em] text-mist uppercase">Endpoints <span class="font-mono tracking-normal normal-case">/api</span></h3>
            <ul class="m-0 mt-3 grid list-none gap-2 p-0">${m.endpoints.map(endpoint).join("")}</ul>
          </div>
        </div>
      </section>`
  }

  /** Tarjetas resumen por rol (panel/page.tsx); las del Administrador se calculan con los reportes. */
  const RESUMEN = {
    administrador: ["Inscritos", "Recaudado", "Asistencias registradas", "Documentos enviados"],
    registrador: ["Registros de hoy", "Cobrado en efectivo"],
    asistencia: ["Presentes en la actividad", "Ausentes"],
    certificacion: ["Certificados generados", "Constancias generadas", "Pendientes de envío", "Envíos con error"],
  }

  function inicio(denegado) {
    const metrics = {}
    if (usuario.rol === "administrador") {
      const r = window.FIISReportes
      metrics["Inscritos"] = String(r.inscripciones.resumen.total_inscritos)
      metrics["Recaudado"] = `S/ ${r.financiero.resumen.total_neto_recibido.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`
      metrics["Asistencias registradas"] = String(r.asistencia.por_actividad.reduce((t, a) => t + a.asistentes, 0))
      metrics["Documentos enviados"] = `${r.certificacion.resumen.enviados_correctamente} enviados`
    }
    const accesos = modulosDe(usuario.rol).filter((m) => m.href !== "/panel")

    return `
      <div class="mx-auto grid max-w-6xl gap-8">
        ${
          denegado
            ? `<p role="alert" class="m-0 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">${icon("ShieldAlert", { cls: "h-4 w-4 shrink-0" })}No tienes permiso para acceder a esa sección.</p>`
            : ""
        }
        <div>
          <p class="m-0 text-sm font-medium text-mist">Panel <!---->${esc(usuario.rol_nombre)}</p>
          <h1 class="m-0 mt-1 text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">Hola, <!---->${esc(usuario.nombre)}</h1>
        </div>
        <section aria-labelledby="resumen-titulo">
          <h2 id="resumen-titulo" class="sr-only">Resumen</h2>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">${RESUMEN[usuario.rol]
            .map(
              (t) => `<div class="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_2px_rgb(2_30_70/0.04)]">
                <p class="m-0 text-sm text-mist">${esc(t)}</p>
                <p class="m-0 mt-1 text-2xl font-bold text-ink tabular-nums">${esc(metrics[t] ?? "—")}</p>
              </div>`,
            )
            .join("")}</div>
        </section>
        <section aria-labelledby="accesos-titulo">
          <h2 id="accesos-titulo" class="m-0 mb-3 text-base font-semibold text-ink">Funciones de tu rol</h2>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">${accesos
            .map(
              (m) => `<a href="${link(m.href)}" class="group flex items-start gap-3 rounded-2xl border border-black/[0.06] bg-white p-4 no-underline shadow-[0_1px_2px_rgb(2_30_70/0.04)] transition-[border-color,box-shadow,transform] duration-200 hover:border-leaf/30 hover:shadow-[0_8px_24px_-12px_rgb(2_30_70/0.18)] active:scale-[0.98] active:duration-100 motion-reduce:active:scale-100">
                <span class="rounded-xl bg-parchment p-2 text-leaf">${icon(m.icon, { cls: "h-5 w-5" })}</span>
                <span class="min-w-0 flex-1">
                  <span class="block text-sm font-semibold text-ink">${esc(m.titulo)}</span>
                  <span class="mt-0.5 block text-sm text-mist">${esc(m.descripcion)}</span>
                </span>
                ${icon("ArrowRight", { cls: "mt-1 h-4 w-4 text-fog transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-leaf motion-reduce:group-hover:translate-x-0" })}
              </a>`,
            )
            .join("")}</div>
        </section>
      </div>`
  }

  // ── Router ───────────────────────────────────────────────────

  const main = document.getElementById("panel-main")

  /** Tras un cambio (router.refresh), el layout vuelve a pedir la sesión: si se revocó, al login. */
  function revalidar() {
    const actual = FIISAuth.getSession()
    if (!actual) {
      location.replace(LOGIN_URL + "?sesion=expirada")
      return false
    }
    usuario.nombre = actual.nombre
    document.getElementById("user-name").textContent = actual.nombre
    return true
  }

  function route() {
    const raw = location.hash.replace(/^#/, "") || "/panel"
    const [ruta, query] = raw.split("?")
    const params = new URLSearchParams(query || "")
    const modulo = MODULOS.find((m) => m.href === ruta)

    if (!modulo) {
      location.replace("#/panel")
      return
    }
    // Módulo de otro rol: vuelve a su panel con aviso (protegerModulo()).
    if (!puedeAcceder(usuario.rol, modulo)) {
      location.replace("#/panel?denegado=1")
      return
    }

    const nuevaRuta = ruta !== rutaActual
    if (nuevaRuta) {
      const antes = navEscritorio.querySelector("[data-indicador]")?.getBoundingClientRect()
      rutaActual = ruta
      // Al cambiar de página, su grupo vuelve a abrirse aunque se hubiera cerrado antes.
      if (modulo.grupo) manual[modulo.grupo] = true
      renderNavs()
      deslizarIndicador(navEscritorio, antes)
    }

    if (ruta === "/panel") main.innerHTML = inicio(params.get("denegado"))
    else if (ruta === "/usuarios") {
      // Se conserva el contenedor al cambiar solo los filtros: el estado del componente sigue vivo.
      let cont = main.querySelector("#usuarios-root")
      if (!cont) {
        main.innerHTML = `<div class="mx-auto max-w-6xl">${pageHeader(modulo)}<div id="usuarios-root"></div></div>`
        cont = main.querySelector("#usuarios-root")
      }
      window.UsuariosModulo.render(cont, params, { nuevo: nuevaRuta, onRefresh: revalidar })
      if (!nuevaRuta) return
    } else if (ruta === "/reportes") {
      main.innerHTML = `<div class="mx-auto max-w-6xl">${pageHeader(modulo)}<div id="reportes-root"></div></div>`
      window.ReportesDashboard(document.getElementById("reportes-root"), window.FIISReportes)
    } else {
      main.innerHTML = `<div class="mx-auto max-w-6xl">${pageHeader(modulo)}${pendienteHU(modulo)}</div>`
    }

    window.scrollTo(0, 0)
  }

  window.addEventListener("hashchange", route)
  hydrateIcons()
  route()
})()
