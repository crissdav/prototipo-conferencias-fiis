/*
 * Autenticación simulada en el navegador (reemplaza a POST /auth/login y GET /auth/me).
 * Mismas cuentas que DatabaseSeeder.php; la sesión vive en localStorage.
 */
;(function () {
  const SESSION_KEY = "fiis_panel"
  const ATTEMPTS_KEY = "fiis_intentos"
  const MAX_INTENTOS = 5
  /** Duración del token (Sanctum en el backend): 8 horas. */
  const SESSION_MS = 8 * 60 * 60 * 1000
  const PASSWORD = "Fiis2026!"

  const ROL_NOMBRE = {
    administrador: "Administrador",
    registrador: "Registrador",
    asistencia: "Asistencia",
    certificacion: "Certificación",
  }

  const USERS = [
    { id: 1, nombre: "Administrador FIIS", email: "admin@fiis.test", rol: "administrador" },
    { id: 2, nombre: "Registrador Demo", email: "registrador@fiis.test", rol: "registrador" },
    { id: 3, nombre: "Asistencia Demo", email: "asistencia@fiis.test", rol: "asistencia" },
    { id: 4, nombre: "Certificación Demo", email: "certificacion@fiis.test", rol: "certificacion" },
  ]

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
      /* almacenamiento bloqueado: la sesión dura solo esta página */
    }
  }

  /** Devuelve { ok, status, message }, igual que las respuestas del backend. */
  function login(email, password) {
    const normalized = email.trim().toLowerCase()
    const user = USERS.find((u) => u.email === normalized)
    const attempts = read(ATTEMPTS_KEY) || {}
    const bloqueada = { ok: false, status: 423, message: "Tu cuenta está bloqueada por intentos fallidos. Solicita al Administrador que la restablezca." }

    if (user && attempts[user.email] >= MAX_INTENTOS) return bloqueada

    if (!user || password !== PASSWORD) {
      if (user) {
        attempts[user.email] = (attempts[user.email] || 0) + 1
        write(ATTEMPTS_KEY, attempts)
        if (attempts[user.email] >= MAX_INTENTOS) return bloqueada
      }
      return { ok: false, status: 401, message: "Datos incorrectos." }
    }

    delete attempts[user.email]
    write(ATTEMPTS_KEY, attempts)
    write(SESSION_KEY, { email: user.email, expira_en: Date.now() + SESSION_MS })
    return { ok: true }
  }

  /** Usuario de la sesión actual o null. */
  function getSession() {
    const session = read(SESSION_KEY)
    if (!session || session.expira_en < Date.now()) return null
    const user = USERS.find((u) => u.email === session.email)
    return user ? { ...user, rol_nombre: ROL_NOMBRE[user.rol] } : null
  }

  function hadSession() {
    return read(SESSION_KEY) !== null
  }

  function logout() {
    write(SESSION_KEY, null)
  }

  window.FIISAuth = { login, logout, getSession, hadSession, ROL_NOMBRE }
})()
