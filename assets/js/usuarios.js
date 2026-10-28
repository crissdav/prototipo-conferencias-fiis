/*
 * Usuarios y roles (usuarios/page.tsx) con los mismos className de RolesGrid.tsx (HU-03),
 * TablaUsuarios.tsx y ModalUsuario.tsx (HU-02). Filtros en la URL (#/usuarios?rol=&buscar=&page=).
 */
;(function () {
  const api = () => window.FIISAuth.api
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

  const ICONO_ROL = { administrador: "ShieldCheck", registrador: "UserCheck", asistencia: "ScanLine", certificacion: "Award" }

  // Estado del componente cliente: se conserva mientras se navega dentro de /usuarios.
  let feedback = null
  let modal = null
  let deleteConfirmUser = null
  let isPending = false
  let root = null
  let params = {}
  let onRefresh = () => {}

  // ── RolesGrid.tsx ────────────────────────────────────────────

  function rolesGrid() {
    return `
      <section aria-labelledby="roles-sistema-titulo" class="mb-10">
        <div class="mb-4 flex flex-col gap-1">
          <h2 id="roles-sistema-titulo" class="m-0 text-base font-semibold text-ink">Roles predefinidos del sistema</h2>
          <p class="m-0 text-sm text-mist">El sistema cuenta con cuatro roles fijos con permisos y módulos estrictamente delimitados.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">${api()
          .listarRoles()
          .map((rol) => {
            const esAdmin = rol.slug === "administrador"
            return `
            <div class="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_1px_2px_rgb(2_30_70/0.04)] transition-[border-color,box-shadow] duration-200 hover:border-leaf/30 hover:shadow-[0_8px_24px_-12px_rgb(2_30_70/0.12)]">
              <div>
                <div class="mb-3.5 flex items-center justify-between gap-2">
                  <span class="grid h-10 w-10 place-items-center rounded-xl ${esAdmin ? "bg-purple-50 text-purple-700" : "bg-parchment text-leaf"}">${icon(ICONO_ROL[rol.slug] || "Users", { cls: "h-5 w-5" })}</span>
                  <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    esAdmin ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 ring-inset" : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 ring-inset"
                  }">${icon("CheckCircle2", { cls: "h-3 w-3" })}${esAdmin ? "Acceso Total" : "Operativo"}</span>
                </div>
                <h3 class="m-0 text-base font-semibold text-ink">${esc(rol.nombre)}</h3>
                <p class="m-0 mt-1.5 text-xs leading-relaxed text-mist">${esc(rol.descripcion || "Sin descripción registrada.")}</p>
              </div>
              <div class="mt-5 border-t border-black/[0.05] pt-3.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-mist font-medium">Personal asignado</span>
                  <span class="font-semibold text-ink tabular-nums">${rol.usuarios}<!----> <!---->${rol.usuarios === 1 ? "usuario" : "usuarios"}</span>
                </div>
              </div>
            </div>`
          })
          .join("")}</div>
      </section>`
  }

  // ── TablaUsuarios.tsx ────────────────────────────────────────

  function estado(u) {
    if (u.bloqueado)
      return `<span class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800 ring-1 ring-red-600/20 ring-inset">${icon("Lock", { cls: "h-3 w-3" })}Bloqueado (<!---->${u.intentos_fallidos}<!----> intentos)</span>`
    if (u.activo)
      return `<span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-600/20 ring-inset">${icon("UserCheck", { cls: "h-3 w-3" })}Activo</span>`
    return `<span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-400/20 ring-inset">${icon("UserX", { cls: "h-3 w-3" })}Inactivo</span>`
  }

  function tabla() {
    const { data: usuarios, meta: pagination } = api().listarUsuarios(params)
    const currentRol = params.rol || ""
    const opt = (v, l) => `<option value="${v}"${currentRol === v ? " selected" : ""}>${l}</option>`

    const filas = usuarios.length
      ? usuarios
          .map((u) => {
            const esAdmin = u.rol === "administrador"
            return `<tr class="transition-colors hover:bg-black/[0.01]">
              <td class="px-5 py-4">
                <div class="font-semibold text-ink">${esc(u.nombre)}</div>
                <div class="text-xs text-mist">${esc(u.email)}</div>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  esAdmin ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 ring-inset" : "bg-leaf/10 text-leaf ring-1 ring-leaf/20 ring-inset"
                }">${esc(u.rol_nombre)}</span>
              </td>
              <td class="px-4 py-4"><div class="flex flex-col gap-1 items-start">${estado(u)}</div></td>
              <td class="px-4 py-4 text-xs text-mist">${
                u.ultimo_acceso_en ? new Date(u.ultimo_acceso_en).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) : "Nunca"
              }</td>
              <td class="px-5 py-4 text-right">
                <div class="flex items-center justify-end gap-1.5">
                  ${
                    u.bloqueado
                      ? `<button type="button" data-unlock="${u.id}" ${isPending ? "disabled" : ""} title="Restablecer cuenta bloqueada" class="rounded-lg p-1.5 text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer">${icon("Unlock", { cls: "h-4 w-4" })}</button>`
                      : ""
                  }
                  <button type="button" data-edit="${u.id}" title="Editar usuario" class="rounded-lg p-1.5 text-mist hover:bg-black/[0.04] hover:text-ink transition-colors cursor-pointer">${icon("Edit2", { cls: "h-4 w-4" })}</button>
                  <button type="button" data-del="${u.id}" title="Eliminar usuario" class="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer">${icon("Trash2", { cls: "h-4 w-4" })}</button>
                </div>
              </td>
            </tr>`
          })
          .join("")
      : `<tr><td colspan="5" class="px-5 py-8 text-center text-sm text-mist">No se encontraron usuarios del personal registrados.</td></tr>`

    return `
      <div class="space-y-6">
        ${
          feedback
            ? `<div role="alert" class="flex items-center justify-between gap-3 rounded-xl border p-4 text-sm font-medium ${
                feedback.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"
              }">
                <div class="flex items-center gap-2">${icon(feedback.type === "success" ? "CheckCircle2" : "AlertTriangle", { cls: "h-4 w-4 shrink-0" })}<span>${esc(feedback.message)}</span></div>
                <button type="button" data-dismiss class="text-xs font-semibold hover:underline cursor-pointer">Descartar</button>
              </div>`
            : ""
        }

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form data-search class="relative flex-1 max-w-md">
            <input type="text" name="buscar" value="${esc(searchInput)}" placeholder="Buscar por nombre o correo..." class="w-full rounded-xl border border-black/[0.08] bg-white pl-9 pr-4 py-2 text-sm text-ink placeholder:text-mist/70 focus:border-leaf focus:outline-hidden focus:ring-2 focus:ring-leaf/20 shadow-xs" />
            ${icon("Search", { cls: "absolute left-3 top-2.5 h-4 w-4 text-mist" })}
          </form>
          <div class="flex flex-wrap items-center gap-2.5">
            <select data-rol class="rounded-xl border border-black/[0.08] bg-white px-3 py-2 text-xs font-medium text-ink shadow-xs focus:border-leaf focus:outline-hidden focus:ring-2 focus:ring-leaf/20 cursor-pointer">
              ${opt("", "Todos los roles")}${opt("administrador", "Administrador")}${opt("registrador", "Registrador")}${opt("asistencia", "Asistencia")}${opt("certificacion", "Certificación")}
            </select>
            <button type="button" data-new class="inline-flex items-center gap-2 rounded-xl bg-leaf px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-leaf/90 cursor-pointer">${icon("Plus", { cls: "h-4 w-4" })}Nuevo Usuario</button>
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-black/[0.06] bg-black/[0.02] text-xs font-semibold uppercase tracking-wider text-mist">
                  <th scope="col" class="px-5 py-3.5">Usuario</th>
                  <th scope="col" class="px-4 py-3.5">Rol Asignado</th>
                  <th scope="col" class="px-4 py-3.5">Estado</th>
                  <th scope="col" class="px-4 py-3.5">Último Acceso</th>
                  <th scope="col" class="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-black/[0.05] text-sm text-ink">${filas}</tbody>
            </table>
          </div>
          ${
            pagination.last_page > 1
              ? `<div class="flex items-center justify-between border-t border-black/[0.06] bg-black/[0.01] px-5 py-3 text-xs text-mist">
                  <div>Total: <span class="font-semibold text-ink">${pagination.total}</span> usuarios</div>
                  <div class="flex items-center gap-2"><span>Página <!---->${pagination.current_page}<!----> de <!---->${pagination.last_page}</span></div>
                </div>`
              : ""
          }
        </div>

        ${modalHtml()}
        ${confirmHtml()}
      </div>`
  }

  // El texto del buscador vive en el estado del componente (useState) y no se pierde al repintar.
  let searchInput = ""

  // ── ModalUsuario.tsx ─────────────────────────────────────────

  const INPUT = "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-ink focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
  const LABEL = "mb-2 block text-xs font-semibold uppercase tracking-wider text-ink"

  function errorCampo(key) {
    const e = modal.state.errors && modal.state.errors[key]
    return e ? `<p class="mt-1 text-xs text-red-600">${esc(e[0])}</p>` : ""
  }

  function modalHtml() {
    if (!modal) return ""
    const usuario = modal.usuario
    const isEditing = Boolean(usuario)
    const st = modal.state
    const rolOpt = (v, l) => `<option value="${v}"${modal.rol === v ? " selected" : ""}>${l}</option>`
    const activo = modal.activo

    return `
      <div role="dialog" aria-modal="true" aria-labelledby="modal-usuario-title" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/40 p-4 backdrop-blur-xs">
        <div class="my-auto w-full max-w-lg rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl">
          <div class="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div class="flex items-center gap-3">
              <span class="grid h-10 w-10 place-items-center rounded-xl bg-leaf/10 text-leaf">${icon("User", { cls: "h-5 w-5" })}</span>
              <h3 id="modal-usuario-title" class="text-lg font-semibold text-ink">${isEditing ? "Editar Usuario del Personal" : "Nuevo Usuario del Personal"}</h3>
            </div>
            <button type="button" data-close-modal aria-label="Cerrar modal" class="rounded-lg p-2 text-mist transition-colors hover:bg-gray-100 hover:text-ink">${icon("X", { cls: "h-5 w-5" })}</button>
          </div>

          ${st.message && !st.success ? `<div class="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">${icon("AlertCircle", { cls: "mt-0.5 h-4 w-4 shrink-0" })}<span>${esc(st.message)}</span></div>` : ""}

          <form data-user-form class="mt-5 space-y-5">
            <div>
              <label for="name" class="${LABEL}">Nombre completo</label>
              <input id="name" name="name" type="text" required value="${esc(modal.valores.name)}" placeholder="Ej. Juan Pérez" class="${INPUT}" />
              ${errorCampo("name")}
            </div>

            <div>
              <label for="email" class="${LABEL}">Correo electrónico</label>
              <input id="email" name="email" type="email" required value="${esc(modal.valores.email)}" placeholder="ejemplo@fiis.test" class="${INPUT}" />
              ${errorCampo("email")}
            </div>

            <div>
              <label for="rol" class="${LABEL}">Rol del sistema</label>
              <select id="rol" name="rol" data-modal-rol class="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm text-ink focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100">
                ${rolOpt("registrador", "Registrador")}${rolOpt("asistencia", "Asistencia")}${rolOpt("certificacion", "Certificación")}${rolOpt("administrador", "Administrador")}
              </select>
              ${errorCampo("rol")}
            </div>

            ${
              isEditing
                ? `<div>
                    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">Estado de la cuenta</p>
                    <div class="grid grid-cols-2 gap-3">
                      <button type="button" data-activo="1" aria-pressed="${activo}" class="flex items-start gap-2 rounded-xl border p-3 text-left transition-colors ${activo ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}">
                        ${icon("UserCheck", { cls: `mt-0.5 h-5 w-5 shrink-0 ${activo ? "text-blue-600" : "text-gray-400"}` })}
                        <span><span class="block text-sm font-semibold text-ink">Activo</span><span class="mt-1 block text-xs text-gray-500">Puede acceder al panel</span></span>
                      </button>
                      <button type="button" data-activo="0" aria-pressed="${!activo}" class="flex items-start gap-2 rounded-xl border p-3 text-left transition-colors ${!activo ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:bg-gray-50"}">
                        ${icon("UserX", { cls: `mt-0.5 h-5 w-5 shrink-0 ${!activo ? "text-blue-600" : "text-gray-400"}` })}
                        <span><span class="block text-sm font-semibold text-ink">Inactivo</span><span class="mt-1 block text-xs text-gray-500">No puede acceder al panel</span></span>
                      </button>
                    </div>
                    <input type="hidden" name="activo" value="${activo ? "true" : "false"}" />
                    ${!activo ? `<p class="mt-2 text-xs text-amber-700">Este usuario no podrá iniciar sesión mientras su cuenta esté inactiva.</p>` : ""}
                  </div>`
                : ""
            }

            ${
              isEditing
                ? `<div class="border-t border-gray-200 pt-4">
                    <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-ink">Cambiar contraseña</p>
                    <label class="flex cursor-pointer items-center gap-4">
                      <input type="checkbox" data-cambiar-pass ${modal.cambiarPassword ? "checked" : ""} class="peer sr-only" />
                      <span class="relative h-6 w-11 shrink-0 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2">
                        <span class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></span>
                      </span>
                      <span>
                        <span class="block text-sm font-medium text-ink">Cambiar contraseña</span>
                        <span class="block text-xs text-gray-500">${modal.cambiarPassword ? "Introduce la nueva contraseña." : "La contraseña actual se mantendrá."}</span>
                      </span>
                    </label>
                  </div>`
                : ""
            }

            ${
              !isEditing || modal.cambiarPassword
                ? `<div>
                    <label for="password" class="${LABEL}">${isEditing ? "Nueva contraseña" : "Contraseña inicial"}</label>
                    <div class="relative">
                      <input id="password" name="password" type="${modal.mostrarPassword ? "text" : "password"}" required minlength="8" placeholder="Mínimo 8 caracteres" value="${esc(modal.valores.password)}" class="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-3 pr-12 text-sm text-ink focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                      <button type="button" data-ver-pass aria-label="${modal.mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}" aria-pressed="${modal.mostrarPassword}" class="absolute inset-y-0 right-3 flex items-center text-gray-500 transition-colors hover:text-blue-600">${icon(modal.mostrarPassword ? "EyeOff" : "Eye", { cls: "h-5 w-5" })}</button>
                    </div>
                    ${errorCampo("password")}
                  </div>`
                : ""
            }

            ${
              isEditing
                ? `<div class="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">${icon("AlertCircle", { cls: "mt-0.5 h-4 w-4 shrink-0" })}<p>Si cambias el rol o la contraseña, se cerrarán las sesiones activas de este usuario.</p></div>`
                : ""
            }

            <div class="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <button type="button" data-close-modal ${modal.isPending ? "disabled" : ""} class="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
              <button type="submit" ${modal.isPending ? "disabled" : ""} class="inline-flex items-center gap-2 rounded-xl bg-leaf px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-leaf/90 disabled:opacity-50">${
                modal.isPending ? icon("Loader2", { cls: "h-4 w-4 animate-spin" }) : ""
              }${isEditing ? "Guardar cambios" : "Crear usuario"}</button>
            </div>
          </form>
        </div>
      </div>`
  }

  function confirmHtml() {
    if (!deleteConfirmUser) return ""
    return `
      <div role="dialog" aria-modal="true" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-in fade-in duration-200">
        <div class="w-full max-w-sm rounded-2xl border border-black/[0.08] bg-white p-6 shadow-2xl">
          <div class="flex items-center gap-3 text-rose-600 mb-3">
            <span class="grid h-10 w-10 place-items-center rounded-xl bg-rose-50">${icon("AlertTriangle", { cls: "h-5 w-5" })}</span>
            <h4 class="m-0 text-base font-semibold text-ink">Confirmar Eliminación</h4>
          </div>
          <p class="m-0 text-sm text-mist leading-relaxed">¿Estás seguro de que deseas eliminar la cuenta de<!----> <strong class="text-ink font-semibold">${esc(deleteConfirmUser.nombre)}</strong>? Esta acción revocará todos sus accesos y no se puede deshacer.</p>
          <div class="mt-6 flex items-center justify-end gap-2.5">
            <button type="button" data-cancel-del ${isPending ? "disabled" : ""} class="rounded-xl border border-black/[0.12] px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-black/[0.03] cursor-pointer">Cancelar</button>
            <button type="button" data-confirm-del ${isPending ? "disabled" : ""} class="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 cursor-pointer disabled:opacity-50">Eliminar Cuenta</button>
          </div>
        </div>
      </div>`
  }

  // ── usuarios/page.tsx ────────────────────────────────────────

  function render() {
    root.innerHTML = `
      ${rolesGrid()}
      <div class="mt-8 border-t border-black/[0.06] pt-8">
        <div class="mb-6">
          <h2 class="m-0 text-base font-semibold text-ink">Personal del sistema</h2>
          <p class="m-0 text-sm text-mist">Cuentas habilitadas con acceso al panel. El Administrador tiene acceso total a supervisión y configuración.</p>
        </div>
        ${tabla()}
      </div>`
  }

  /** router.push con los nuevos filtros. */
  function navegar(cambios) {
    const q = new URLSearchParams()
    const next = { ...params, ...cambios }
    if (next.rol) q.set("rol", next.rol)
    if (next.buscar) q.set("buscar", next.buscar)
    q.set("page", next.page || "1")
    location.hash = `#/usuarios?${q.toString()}`
  }

  /** router.refresh(): vuelve a validar la sesión y repinta con datos nuevos. */
  function refrescar() {
    if (onRefresh() === false) return
    render()
  }

  // Latencia de la acción del servidor (isPending / useTransition).
  const servidor = (fn) => setTimeout(fn, 350)

  function buscarUsuario(id) {
    const { meta } = api().listarUsuarios({})
    for (let page = 1; page <= meta.last_page; page++) {
      const u = api().listarUsuarios({ page }).data.find((x) => x.id === id)
      if (u) return u
    }
    return null
  }

  function abrirModal(usuario) {
    modal = {
      usuario,
      rol: usuario ? usuario.rol : "registrador",
      activo: usuario ? usuario.activo : true,
      cambiarPassword: false,
      mostrarPassword: false,
      valores: { name: usuario ? usuario.nombre : "", email: usuario ? usuario.email : "", password: "" },
      state: {},
      isPending: false,
    }
    render()
  }

  /** Los campos del modal son no controlados (defaultValue): se conserva lo escrito al repintar. */
  function leerFormulario() {
    const form = root.querySelector("[data-user-form]")
    if (!form) return
    modal.valores.name = form.elements.name.value
    modal.valores.email = form.elements.email.value
    if (form.elements.password) modal.valores.password = form.elements.password.value
  }

  function onClick(e) {
    const t = e.target
    if (t.closest("[data-dismiss]")) {
      feedback = null
      return render()
    }
    if (t.closest("[data-new]")) return abrirModal(null)

    const edit = t.closest("[data-edit]")
    if (edit) return abrirModal(buscarUsuario(Number(edit.dataset.edit)))

    const del = t.closest("[data-del]")
    if (del) {
      deleteConfirmUser = buscarUsuario(Number(del.dataset.del))
      return render()
    }

    const unlock = t.closest("[data-unlock]")
    if (unlock && !isPending) {
      const u = buscarUsuario(Number(unlock.dataset.unlock))
      isPending = true
      render()
      return servidor(() => {
        isPending = false
        const res = api().desbloquearUsuario(u.id)
        feedback = res.success ? { type: "success", message: `Cuenta de ${u.nombre} restablecida con éxito.` } : { type: "error", message: res.message ?? "Error al desbloquear cuenta." }
        refrescar()
      })
    }

    if (t.closest("[data-cancel-del]") && !isPending) {
      deleteConfirmUser = null
      return render()
    }

    if (t.closest("[data-confirm-del]") && !isPending && deleteConfirmUser) {
      isPending = true
      render()
      return servidor(() => {
        isPending = false
        const res = api().eliminarUsuario(deleteConfirmUser.id)
        if (res.success) {
          feedback = { type: "success", message: res.message ?? "Usuario eliminado correctamente." }
          deleteConfirmUser = null
          refrescar()
        } else {
          feedback = { type: "error", message: res.message ?? "Error al eliminar usuario." }
          render()
        }
      })
    }

    if (!modal) return
    if (t.closest("[data-close-modal]") && !modal.isPending) {
      modal = null
      return render()
    }
    const activo = t.closest("[data-activo]")
    if (activo) {
      leerFormulario()
      modal.activo = activo.dataset.activo === "1"
      return render()
    }
    if (t.closest("[data-ver-pass]")) {
      leerFormulario()
      modal.mostrarPassword = !modal.mostrarPassword
      render()
    }
  }

  function onChange(e) {
    const t = e.target
    if (t.matches("[data-rol]")) return navegar({ rol: t.value, page: "1" })
    if (!modal) return
    if (t.matches("[data-modal-rol]")) modal.rol = t.value
    else if (t.matches("[data-cambiar-pass]")) {
      leerFormulario()
      modal.cambiarPassword = t.checked
      modal.mostrarPassword = false
      render()
    }
  }

  function onInput(e) {
    if (e.target.closest("[data-search]")) searchInput = e.target.value
  }

  function onSubmit(e) {
    e.preventDefault()
    const form = e.target
    if (form.matches("[data-search]")) return navegar({ buscar: searchInput.trim(), page: "1" })
    if (!form.matches("[data-user-form]") || !modal || modal.isPending) return

    leerFormulario()
    const isEditing = Boolean(modal.usuario)
    const password = modal.valores.password
    const datos = { name: modal.valores.name, email: modal.valores.email, rol: modal.rol }
    modal.isPending = true
    render()

    servidor(() => {
      let res
      if (isEditing) {
        const payload = { ...datos, activo: modal.activo }
        if (password && password.trim().length > 0) payload.password = password
        res = api().actualizarUsuario(modal.usuario.id, payload)
      } else {
        // Como en actions.ts: al crear no hay campo "activo" en el formulario, así que se envía activo = false.
        res = api().crearUsuario({ ...datos, password, activo: false })
      }
      modal.isPending = false
      if (res.success) {
        feedback = { type: "success", message: isEditing ? "Usuario actualizado correctamente." : "Usuario creado exitosamente." }
        modal = null
        refrescar()
      } else {
        modal.state = res
        render()
      }
    })
  }

  window.UsuariosModulo = {
    /** Pinta el módulo. `nuevo` = se llega desde otra pantalla (estado del componente limpio). */
    render(container, query, opciones) {
      params = { rol: query.get("rol") || "", buscar: query.get("buscar") || "", page: query.get("page") || "" }
      if (opciones.nuevo) {
        feedback = null
        modal = null
        deleteConfirmUser = null
        isPending = false
        searchInput = params.buscar
      }
      onRefresh = opciones.onRefresh
      root = container
      if (!root.dataset.usuarios) {
        root.dataset.usuarios = "1"
        root.addEventListener("click", onClick)
        root.addEventListener("change", onChange)
        root.addEventListener("input", onInput)
        root.addEventListener("submit", onSubmit)
      }
      render()
    },
  }
})()
