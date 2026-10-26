/* Panel interno: menú por rol, rutas (#/panel, #/usuarios, …) y pantallas. */
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

  // ── Barra superior ───────────────────────────────────────────

  document.getElementById("user-name").textContent = usuario.nombre
  document.getElementById("user-rol").textContent = usuario.rol_nombre
  document.getElementById("logout").addEventListener("click", () => {
    FIISAuth.logout()
    location.replace("index.html")
  })

  // ── Menú lateral ─────────────────────────────────────────────

  const modulos = modulosDe(usuario.rol)
  const grupos = [...new Set(modulos.map((m) => m.grupo))]
  /** Grupos abiertos o cerrados a mano; si no se tocó, solo se abre el de la página actual. */
  const manual = {}

  function renderNav(container, id, ruta) {
    const grupoActivo = (modulos.find((m) => m.href === ruta) || {}).grupo
    const enlace = (m) =>
      `<a href="${link(m.href)}" class="panel-nav__link" ${ruta === m.href ? 'aria-current="page"' : ""} data-nav>${icon(m.icon, { size: 16 })}<span>${esc(m.titulo)}</span></a>`

    container.innerHTML = `<nav aria-label="Menú del panel" class="panel-nav">${grupos
      .map((grupo) => {
        const items = modulos.filter((m) => m.grupo === grupo)
        // Solo el Administrador agrupa en submenús; los demás roles ven sus opciones directamente.
        if (items.length === 1 || usuario.rol !== "administrador") {
          return `<div class="panel-nav__set">${items.map(enlace).join("")}</div>`
        }
        const abierto = manual[grupo] !== undefined ? manual[grupo] : grupo === grupoActivo
        const panelId = `${id}-${grupo}`
        return `
          <div>
            <button type="button" class="panel-nav__group-btn" aria-expanded="${abierto}" aria-controls="${panelId}" data-grupo="${esc(grupo)}">
              ${esc(grupo)}
              ${!abierto && grupo === grupoActivo ? '<span class="panel-nav__dot" aria-label="(página actual)"></span>' : ""}
              ${icon("ChevronDown", { cls: "panel-nav__chevron" })}
            </button>
            <div class="panel-nav__items${abierto ? " is-open" : ""}" id="${panelId}">
              <div><div class="panel-nav__items-inner">${items.map(enlace).join("")}</div></div>
            </div>
          </div>`
      })
      .join("")}</nav>`
  }

  function onNavClick(e) {
    const btn = e.target.closest("[data-grupo]")
    if (btn) {
      const grupo = btn.dataset.grupo
      manual[grupo] = btn.getAttribute("aria-expanded") !== "true"
      renderNavs()
      return
    }
    if (e.target.closest("[data-nav]") && this.id === "nav-movil") setDrawer(false)
  }

  const navEscritorio = document.getElementById("nav-escritorio")
  const navMovil = document.getElementById("nav-movil")
  navEscritorio.addEventListener("click", onNavClick)
  navMovil.addEventListener("click", onNavClick)

  let rutaActual = null
  function renderNavs() {
    renderNav(navEscritorio, "nav-escritorio", rutaActual)
    renderNav(navMovil, "nav-movil", rutaActual)
  }

  // ── Lateral móvil (entra por la izquierda, se arrastra para cerrar) ──

  const drawer = document.getElementById("drawer")
  const drawerAside = document.getElementById("drawer-aside")
  const openBtn = document.getElementById("drawer-open")
  let prevOverflow = ""

  function setDrawer(open) {
    drawer.classList.toggle("is-open", open)
    openBtn.setAttribute("aria-expanded", String(open))
    drawerAside.style.transform = ""
    if (open) {
      prevOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
    } else document.body.style.overflow = prevOverflow
  }

  openBtn.addEventListener("click", () => setDrawer(true))
  document.getElementById("drawer-close").addEventListener("click", () => setDrawer(false))
  document.getElementById("drawer-scrim").addEventListener("click", () => setDrawer(false))
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) setDrawer(false)
  })

  drawerAside.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return
    const startX = e.clientX
    const startY = e.clientY
    let dx = 0
    let locked = null
    let last = { x: startX, t: e.timeStamp }
    let velocity = 0

    function move(ev) {
      dx = ev.clientX - startX
      if (locked === null && Math.hypot(dx, ev.clientY - startY) > 8) locked = Math.abs(dx) > Math.abs(ev.clientY - startY) ? "x" : "y"
      if (locked !== "x") return
      const dt = ev.timeStamp - last.t
      if (dt > 0) velocity = ((ev.clientX - last.x) / dt) * 1000
      last = { x: ev.clientX, t: ev.timeStamp }
      drawerAside.classList.add("is-dragging")
      drawerAside.style.transform = `translateX(${dx < 0 ? dx : dx * 0.08}px)`
    }

    function end() {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", end)
      window.removeEventListener("pointercancel", end)
      drawerAside.classList.remove("is-dragging")
      if (locked !== "x") return
      const destino = dx + ((velocity / 1000) * 0.998) / (1 - 0.998)
      if (destino < -288 / 2) setDrawer(false)
      else drawerAside.style.transform = ""
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", end)
    window.addEventListener("pointercancel", end)
  })

  // ── Pantallas ────────────────────────────────────────────────

  function pageHeader(m) {
    return `
      <div class="page-header">
        <div class="page-header__inner">
          <div class="page-header__row">
            <span class="page-header__icon">${icon(m.icon)}</span>
            <h1 class="page-title">${esc(m.titulo)}</h1>
          </div>
          <p class="page-desc">${esc(m.descripcion)}</p>
        </div>
      </div>`
  }

  function pendienteHU(m) {
    const endpoint = (e) => {
      const [metodos, ...ruta] = e.split(" ")
      return `<li class="pending__ep">${metodos
        .split("|")
        .map((met) => `<span class="method method--${met}">${met}</span>`)
        .join("")}<code>${esc(ruta.join(" "))}</code></li>`
    }
    return `
      <section class="pending">
        <div class="pending__head">
          <span class="pending__badge">${icon("Construction")}</span>
          <div>
            <h2 class="pending__title">Pantalla por implementar</h2>
            <p class="pending__sub">Esto es lo que debe cubrir y los endpoints que usa.</p>
          </div>
        </div>
        <div class="pending__cols">
          <div class="pending__col">
            <h3>Historias de usuario</h3>
            <ul class="pending__list">${m.historias.map((hu) => `<li class="pending__hu">${icon("FileText")}${esc(hu)}</li>`).join("")}</ul>
          </div>
          <div class="pending__col">
            <h3>Endpoints <span>/api</span></h3>
            <ul class="pending__list">${m.endpoints.map(endpoint).join("")}</ul>
          </div>
        </div>
      </section>`
  }

  /** Tarjetas resumen por rol; las del Administrador se calculan con los reportes. */
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
      <div class="page-wrap page-grid">
        ${denegado ? `<p role="alert" class="alert-denied">${icon("ShieldAlert", { cls: "shrink-0" })}No tienes permiso para acceder a esa sección.</p>` : ""}
        <div>
          <p class="panel-kicker">Panel ${esc(usuario.rol_nombre)}</p>
          <h1 class="page-title panel-hello">Hola, ${esc(usuario.nombre)}</h1>
        </div>
        <section aria-labelledby="resumen-titulo">
          <h2 id="resumen-titulo" class="sr-only">Resumen</h2>
          <div class="summary-grid">${RESUMEN[usuario.rol]
            .map((t) => `<div class="summary-card"><p class="summary-card__label">${esc(t)}</p><p class="summary-card__value">${esc(metrics[t] || "—")}</p></div>`)
            .join("")}</div>
        </section>
        <section aria-labelledby="accesos-titulo">
          <h2 id="accesos-titulo" class="section-label">Funciones de tu rol</h2>
          <div class="access-grid">${accesos
            .map(
              (m) => `
              <a href="${link(m.href)}" class="access-card">
                <span class="access-card__icon">${icon(m.icon)}</span>
                <span class="access-card__body">
                  <span class="access-card__title">${esc(m.titulo)}</span>
                  <span class="access-card__desc">${esc(m.descripcion)}</span>
                </span>
                ${icon("ArrowRight", { cls: "access-card__arrow" })}
              </a>`,
            )
            .join("")}</div>
        </section>
      </div>`
  }

  // ── Router ───────────────────────────────────────────────────

  const main = document.getElementById("panel-main")

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

    // Al cambiar de página, su grupo vuelve a abrirse: siempre se ve dónde estás.
    if (ruta !== rutaActual) {
      rutaActual = ruta
      if (modulo.grupo) manual[modulo.grupo] = true
    }
    renderNavs()

    if (ruta === "/panel") main.innerHTML = inicio(params.get("denegado"))
    else if (ruta === "/reportes") {
      main.innerHTML = `<div class="page-wrap">${pageHeader(modulo)}<div id="reportes-root"></div></div>`
      window.ReportesDashboard(document.getElementById("reportes-root"), window.FIISReportes)
    } else main.innerHTML = `<div class="page-wrap">${pageHeader(modulo)}${pendienteHU(modulo)}</div>`

    window.scrollTo(0, 0)
  }

  window.addEventListener("hashchange", route)
  hydrateIcons()
  route()
})()
