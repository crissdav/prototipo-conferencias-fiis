/*
 * Backend simulado en el navegador: cuentas del personal, sesión y gestión de usuarios.
 * Reproduce AuthController (POST /auth/login, GET /auth/me) y UsuarioController / RolController
 * (GET|POST|PUT|DELETE /admin/usuarios, POST /admin/usuarios/{id}/desbloquear, GET /admin/roles).
 * Todo se guarda en localStorage.
 */
;(function () {
  const SESSION_KEY = "fiis_panel"
  const USERS_KEY = "fiis_usuarios"
  const MAX_INTENTOS = 5
  /** Duración del token (Sanctum en el backend): 8 horas. */
  const SESSION_MS = 8 * 60 * 60 * 1000
  const MENSAJE_GENERICO = "Datos incorrectos."
  const MENSAJE_BLOQUEO = "Tu cuenta está bloqueada por intentos fallidos. Solicita al Administrador que la restablezca."

  /** App\Enums\Rol, en el mismo orden que la tabla roles. */
  const ROLES = [
    { slug: "administrador", nombre: "Administrador", descripcion: "Acceso completo: usuarios, actividades, reportes y supervisión." },
    { slug: "registrador", nombre: "Registrador", descripcion: "Registro presencial, cobro en efectivo y confirmación de registros." },
    { slug: "asistencia", nombre: "Asistencia", descripcion: "Escaneo de códigos y control de asistencia por fecha y actividad." },
    { slug: "certificacion", nombre: "Certificación", descripcion: "Plantillas, generación y envío de certificados y constancias." },
  ]
  const ROL_NOMBRE = Object.fromEntries(ROLES.map((r) => [r.slug, r.nombre]))

  /** Cuentas de DatabaseSeeder.php (contraseña Fiis2026!). */
  function seed() {
    const creado = "2026-10-17T11:32:53-05:00"
    return [
      ["Administrador FIIS", "admin@fiis.test", "administrador"],
      ["Registrador Demo", "registrador@fiis.test", "registrador"],
      ["Asistencia Demo", "asistencia@fiis.test", "asistencia"],
      ["Certificación Demo", "certificacion@fiis.test", "certificacion"],
    ].map(([name, email, rol], i) => ({
      id: i + 1,
      name,
      email,
      rol,
      password: "Fiis2026!",
      activo: true,
      intentos_fallidos: 0,
      bloqueado_en: null,
      ultimo_acceso_en: null,
      created_at: creado,
      tokens: 0,
    }))
  }

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null")
    } catch {
      return null
    }
  }

  function write(key, value) {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* almacenamiento bloqueado: los cambios duran solo esta página */
    }
  }

  let memoria = null
  function users() {
    const guardados = read(USERS_KEY)
    if (Array.isArray(guardados)) return guardados
    if (!memoria) {
      memoria = seed()
      write(USERS_KEY, memoria)
    }
    return memoria
  }

  function save(list) {
    memoria = list
    write(USERS_KEY, list)
  }

  /** "Revoca" los tokens del usuario: las sesiones abiertas dejan de ser válidas. */
  const revocar = (u) => (u.tokens = (u.tokens || 0) + 1)

  /** UsuarioAdminResource */
  const recurso = (u) => ({
    id: u.id,
    nombre: u.name,
    email: u.email,
    rol: u.rol,
    rol_nombre: ROL_NOMBRE[u.rol],
    activo: Boolean(u.activo),
    bloqueado: u.bloqueado_en !== null,
    bloqueado_en: u.bloqueado_en,
    intentos_fallidos: u.intentos_fallidos,
    ultimo_acceso_en: u.ultimo_acceso_en,
    creado_en: u.created_at,
  })

  // ── Sesión ───────────────────────────────────────────────────

  /** Devuelve { ok, status, message }, igual que las respuestas del backend. */
  function login(email, password) {
    const list = users()
    const user = list.find((u) => u.email === email.trim().toLowerCase())
    if (!user) return { ok: false, status: 401, message: MENSAJE_GENERICO }

    const passwordOk = password === user.password

    // Solo revelamos el bloqueo a quien conoce la contraseña.
    if (user.bloqueado_en !== null) {
      return passwordOk ? { ok: false, status: 423, message: MENSAJE_BLOQUEO } : { ok: false, status: 401, message: MENSAJE_GENERICO }
    }

    if (!passwordOk) {
      user.intentos_fallidos++
      if (user.intentos_fallidos >= MAX_INTENTOS) {
        user.bloqueado_en = new Date().toISOString()
        revocar(user)
      }
      save(list)
      return user.bloqueado_en !== null ? { ok: false, status: 423, message: MENSAJE_BLOQUEO } : { ok: false, status: 401, message: MENSAJE_GENERICO }
    }

    if (!user.activo) return { ok: false, status: 401, message: MENSAJE_GENERICO }

    user.intentos_fallidos = 0
    user.ultimo_acceso_en = new Date().toISOString()
    save(list)
    write(SESSION_KEY, { id: user.id, token: user.tokens || 0, expira_en: Date.now() + SESSION_MS })
    return { ok: true }
  }

  /** Usuario de la sesión actual (GET /auth/me) o null si el token ya no es válido. */
  function getSession() {
    const session = read(SESSION_KEY)
    if (!session || session.expira_en < Date.now()) return null
    const user = users().find((u) => u.id === session.id)
    if (!user || (user.tokens || 0) !== session.token) return null
    return { id: user.id, nombre: user.name, email: user.email, rol: user.rol, rol_nombre: ROL_NOMBRE[user.rol] }
  }

  function hadSession() {
    return read(SESSION_KEY) !== null
  }

  function logout() {
    write(SESSION_KEY, null)
  }

  // ── Gestión de usuarios (solo Administrador) ─────────────────

  const esCorreo = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

  /** Respuesta 422 de Laravel: message = primer error (+ "and N more errors"). */
  function error422(errors) {
    const lista = Object.values(errors).flat()
    const resto = lista.length - 1
    const message = resto > 0 ? `${lista[0]} (and ${resto} more ${resto === 1 ? "error" : "errors"})` : lista[0]
    return { success: false, message, errors }
  }

  /** GET /admin/usuarios?rol=&buscar=&page= (15 por página, más recientes primero). */
  function listarUsuarios({ rol, buscar, page } = {}) {
    let list = [...users()].sort((a, b) => b.id - a.id)
    if (rol && ROL_NOMBRE[rol]) list = list.filter((u) => u.rol === rol)
    const termino = (buscar || "").trim().toLowerCase()
    if (termino) list = list.filter((u) => u.name.toLowerCase().includes(termino) || u.email.toLowerCase().includes(termino))
    const porPagina = 15
    const total = list.length
    const lastPage = Math.max(1, Math.ceil(total / porPagina))
    const current = Math.min(Math.max(1, Number(page) || 1), lastPage)
    return {
      data: list.slice((current - 1) * porPagina, current * porPagina).map(recurso),
      meta: { current_page: current, last_page: lastPage, total },
    }
  }

  /** GET /admin/roles */
  function listarRoles() {
    const list = users()
    return ROLES.map((r) => ({ ...r, usuarios: list.filter((u) => u.rol === r.slug).length }))
  }

  /** POST /admin/usuarios */
  function crearUsuario({ name, email, password, rol, activo }) {
    const list = users()
    const errors = {}
    const correo = (email || "").trim().toLowerCase()
    if (!name || !name.trim()) errors.name = ["El nombre completo es obligatorio."]
    if (!correo) errors.email = ["El correo electrónico es obligatorio."]
    else if (!esCorreo(correo)) errors.email = ["El correo electrónico debe ser una dirección válida."]
    else if (list.some((u) => u.email === correo)) errors.email = ["Este correo electrónico ya está registrado en el sistema."]
    if (!password) errors.password = ["La contraseña inicial es obligatoria."]
    else if (password.length < 8) errors.password = ["La contraseña debe tener al menos 8 caracteres."]
    if (!rol) errors.rol = ["El rol del personal es obligatorio."]
    else if (!ROL_NOMBRE[rol]) errors.rol = ["El rol seleccionado no es válido."]
    if (Object.keys(errors).length) return error422(errors)

    list.push({
      id: list.reduce((max, u) => Math.max(max, u.id), 0) + 1,
      name: name.trim(),
      email: correo,
      rol,
      password,
      activo: activo !== false,
      intentos_fallidos: 0,
      bloqueado_en: null,
      ultimo_acceso_en: null,
      created_at: new Date().toISOString(),
      tokens: 0,
    })
    save(list)
    return { success: true, message: "Usuario registrado exitosamente." }
  }

  /** PUT /admin/usuarios/{id} — al cambiar rol, contraseña o desactivar, se revocan sus sesiones. */
  function actualizarUsuario(id, { name, email, password, rol, activo }) {
    const list = users()
    const user = list.find((u) => u.id === id)
    if (!user) return { success: false, message: "No query results for model [App\\Models\\User]." }

    const errors = {}
    const correo = email === undefined ? undefined : email.trim().toLowerCase()
    if (name !== undefined && !name.trim()) errors.name = ["El nombre completo es obligatorio."]
    if (correo !== undefined) {
      if (!correo) errors.email = ["El correo electrónico es obligatorio."]
      else if (!esCorreo(correo)) errors.email = ["El correo electrónico debe ser una dirección válida."]
      else if (list.some((u) => u.email === correo && u.id !== id)) errors.email = ["Este correo electrónico ya está en uso por otro usuario."]
    }
    if (password && password.length < 8) errors.password = ["La contraseña debe tener al menos 8 caracteres."]
    if (rol !== undefined && !ROL_NOMBRE[rol]) errors.rol = [rol ? "El rol seleccionado no es válido." : "El rol del personal es obligatorio."]
    if (Object.keys(errors).length) return error422(errors)

    const nuevoRol = rol !== undefined ? rol : user.rol
    const nuevoActivo = activo !== undefined ? activo : user.activo
    const eraAdminActivo = user.rol === "administrador" && user.activo
    const seguiraAdminActivo = nuevoRol === "administrador" && nuevoActivo
    if (eraAdminActivo && !seguiraAdminActivo) {
      const otros = list.filter((u) => u.rol === "administrador" && u.activo && u.id !== id)
      if (!otros.length) return { success: false, message: "No es posible desactivar ni cambiar el rol del único Administrador activo del sistema." }
    }

    let revocarTokens = false
    if (name !== undefined) user.name = name.trim()
    if (correo !== undefined) user.email = correo
    if (password) {
      user.password = password
      revocarTokens = true
    }
    if (rol !== undefined && user.rol !== nuevoRol) {
      user.rol = nuevoRol
      revocarTokens = true
    }
    if (activo !== undefined) {
      user.activo = nuevoActivo
      if (!nuevoActivo) revocarTokens = true
    }
    if (revocarTokens) revocar(user)
    save(list)
    return { success: true, message: "Usuario actualizado exitosamente." }
  }

  /** DELETE /admin/usuarios/{id} */
  function eliminarUsuario(id) {
    const list = users()
    const user = list.find((u) => u.id === id)
    if (!user) return { success: false, message: "No query results for model [App\\Models\\User]." }
    if (user.rol === "administrador") {
      const otros = list.filter((u) => u.rol === "administrador" && u.activo && u.id !== id)
      if (!otros.length) return { success: false, message: "No es posible eliminar al único Administrador activo del sistema." }
    }
    save(list.filter((u) => u.id !== id))
    return { success: true, message: "Usuario eliminado exitosamente." }
  }

  /** POST /admin/usuarios/{id}/desbloquear */
  function desbloquearUsuario(id) {
    const list = users()
    const user = list.find((u) => u.id === id)
    if (!user) return { success: false, message: "No query results for model [App\\Models\\User]." }
    user.intentos_fallidos = 0
    user.bloqueado_en = null
    save(list)
    return { success: true, message: "Cuenta restablecida." }
  }

  window.FIISAuth = {
    login,
    logout,
    getSession,
    hadSession,
    ROL_NOMBRE,
    api: { listarUsuarios, listarRoles, crearUsuario, actualizarUsuario, eliminarUsuario, desbloquearUsuario },
  }
})()
