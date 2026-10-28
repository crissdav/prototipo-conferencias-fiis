/*
 * Flujo de inscripción: InscriptionModal.tsx con los mismos className.
 *   1. Actividad: solo conferencia, solo talleres, o conferencia y talleres (+ elegir talleres con cupo).
 *   2. Datos: según el tipo de participante (Estudiante o Público general).
 *   3. Resumen: actividades, datos e importe total antes de pasar al pago.
 */
;(function () {
  const { agenda, tickets, unasCareers } = window.FIIS
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
  const C = "<!---->"
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const activities = [
    { value: "conferencia", label: "Solo conferencia", hint: "Las ponencias de los 2 días. Sin límite de cupos." },
    { value: "talleres", label: "Solo talleres", hint: "Talleres prácticos con aforo limitado." },
    { value: "ambas", label: "Conferencia y talleres", hint: "Las ponencias y los talleres que elijas." },
  ]

  const UNAS = "Universidad Nacional Agraria de la Selva (UNAS)"
  const OTHER = "otra"

  /** Talleres por día. Se cruzan de horario dentro del mismo día, así que se elige uno por día. */
  const workshopDays = agenda
    .map((day) => ({ id: day.id, label: `${day.day} · ${day.date}`, items: day.items.filter((i) => i.kind === "taller" && i.id) }))
    .filter((day) => day.items.length > 0)
  const allWorkshops = workshopDays.flatMap((d) => d.items)

  function seatsLeft(id) {
    const item = allWorkshops.find((w) => w.id === id)
    if (!item || !item.capacity) return Infinity
    return item.capacity - (item.enrolled || 0)
  }

  /** "S/ 20.00" → 20. Devuelve null mientras el precio sea "Por definir". */
  function parsePrice(value) {
    const number = Number(value.replace(/[^\d.]/g, ""))
    return /\d/.test(value) && Number.isFinite(number) ? number : null
  }

  const featured = (tickets.find((t) => t.featured) || tickets[0]).name
  const emptyPerson = { dni: "", code: "", name: "", email: "", phone: "", career: "", university: "", otherUniversity: "" }

  const root = document.createElement("div")
  document.body.appendChild(root)
  let s = null
  let returnFocus = null
  let prevOverflow = ""

  function open(opts) {
    returnFocus = document.activeElement
    const ticket = (tickets.find((t) => t.name === opts.ticket) || {}).name || featured
    const preset = allWorkshops.find((w) => w.id === opts.workshop && seatsLeft(w.id) > 0)
    const presetDay = preset ? workshopDays.find((d) => d.items.includes(preset)).id : null
    s = {
      step: 1,
      activity: preset ? "talleres" : opts.activity || null,
      selected: preset ? { [presetDay]: preset.id } : {},
      stepError: "",
      ticket,
      person: { ...emptyPerson },
      errors: {},
    }
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    render()
    const scrim = root.firstElementChild
    const dialog = root.querySelector("[role=dialog]")
    scrim.getBoundingClientRect()
    scrim.style.transition = "opacity 220ms ease-out"
    dialog.style.transition = reduceMotion ? "opacity 200ms" : "opacity 350ms cubic-bezier(0.22, 1, 0.36, 1), transform 350ms cubic-bezier(0.22, 1, 0.36, 1)"
    scrim.style.opacity = "1"
    dialog.style.opacity = "1"
    dialog.style.transform = "none"
    requestAnimationFrame(() => dialog.focus())
  }

  function close() {
    if (!s) return
    s = null
    document.body.style.overflow = prevOverflow
    const scrim = root.firstElementChild
    const dialog = root.querySelector("[role=dialog]")
    if (scrim) {
      scrim.style.opacity = "0"
      dialog.style.opacity = "0"
      if (!reduceMotion) dialog.style.transform = "translateY(40px)"
      setTimeout(() => {
        if (!s) root.innerHTML = ""
      }, 350)
    }
    const target = returnFocus
    requestAnimationFrame(() => target && target.focus && target.focus())
  }

  const wantsWorkshops = () => s.activity === "talleres" || s.activity === "ambas"
  const chosenWorkshops = () =>
    wantsWorkshops()
      ? Object.values(s.selected)
          .map((id) => allWorkshops.find((w) => w.id === id))
          .filter(Boolean)
      : []

  function validatePerson(p, ticket) {
    const e = {}
    if (!/^\d{8}$/.test(p.dni)) e.dni = "El DNI debe tener 8 dígitos."
    if (p.name.trim().length < 5) e.name = "Escribe tus nombres y apellidos completos."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) e.email = "Ingresa un correo válido."
    if (!/^9\d{8}$/.test(p.phone)) e.phone = "El celular debe tener 9 dígitos y empezar con 9."
    if (ticket === "Estudiante") {
      if (!/^[A-Za-z0-9-]{4,20}$/.test(p.code.trim())) e.code = "Ingresa tu código de estudiante."
      if (!p.university) e.university = "Indica si eres de la UNAS o de otra institución."
      else if (p.university === OTHER && p.otherUniversity.trim().length < 3) e.otherUniversity = "Escribe el nombre de tu institución o universidad."
      if (p.university && p.career.trim().length < 3) e.career = p.university === UNAS ? "Elige tu carrera." : "Indica tu carrera profesional."
    }
    return e
  }

  // ── Render ───────────────────────────────────────────────────

  /** Field: <label class="grid gap-1.5 text-sm font-semibold text-ink">{label}{children}{error}</label> */
  function Field(label, key, control) {
    const err = s.errors[key]
    return `<label class="grid gap-1.5 text-sm font-semibold text-ink">${label}${control}${err ? `<span class="text-xs font-medium text-red-700">${err}</span>` : ""}</label>`
  }

  const input = (key, attrs) => `<input data-field="${key}" value="${esc(s.person[key])}" class="field font-normal" aria-invalid="${Boolean(s.errors[key])}" ${attrs || ""} />`

  const SummaryRow = (label, value) => `<div class="inscription-summary__row"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`

  function step1() {
    return `
      <form novalidate class="mt-4 grid gap-4" data-form="1">
        <fieldset class="grid gap-2">
          <legend class="sr-only">Actividad</legend>
          ${activities
            .map(
              (item) => `<label class="inscription-choice ${s.activity === item.value ? "inscription-choice--selected" : ""}">
                <input type="radio" name="actividad" value="${item.value}" ${s.activity === item.value ? "checked" : ""} class="sr-only" data-activity-opt />
                <span class="min-w-0"><span class="block text-sm font-semibold text-ink">${item.label}</span><span class="block text-xs text-mist">${item.hint}</span></span>
                <span class="inscription-radio" aria-hidden="true"></span>
              </label>`,
            )
            .join("")}
        </fieldset>
        ${
          wantsWorkshops()
            ? `<div class="grid gap-4">
                <p class="text-sm text-mist">Elige hasta un taller por día: los talleres de un mismo día se dictan a la misma hora.</p>
                ${workshopDays
                  .map(
                    (day) => `<fieldset class="grid gap-2">
                      <legend class="mb-2 text-sm font-semibold text-ink">${day.label}</legend>
                      ${day.items
                        .map((item) => {
                          const left = seatsLeft(item.id)
                          const full = left <= 0
                          const checked = s.selected[day.id] === item.id
                          return `<label class="inscription-choice ${checked ? "inscription-choice--selected" : ""} ${full ? "inscription-choice--disabled" : ""}">
                            <input type="checkbox" ${checked ? "checked" : ""} ${full ? "disabled" : ""} class="sr-only" data-workshop-opt="${item.id}" data-day="${day.id}" />
                            <span class="min-w-0"><span class="block text-sm font-semibold text-ink">${esc(item.title)}</span><span class="block text-xs text-mist">${item.time}${C} · ${C}${esc(item.speaker)}${C} · ${C}${esc(item.location)}</span></span>
                            <span class="inscription-seats ${full ? "is-full" : left <= 5 ? "is-low" : ""}">${full ? "Sin cupos" : `${left} cupos`}</span>
                          </label>`
                        })
                        .join("")}
                    </fieldset>`,
                  )
                  .join("")}
              </div>`
            : ""
        }
        ${s.stepError ? `<p role="alert" class="text-sm font-medium text-red-700">${s.stepError}</p>` : ""}
        <button type="submit" class="btn-primary w-full">Continuar</button>
      </form>`
  }

  function step2() {
    const p = s.person
    let student = ""
    if (s.ticket === "Estudiante") {
      student = `
        <fieldset class="grid grid-cols-2 gap-2">
          <legend class="mb-2 text-sm font-semibold text-ink">Institución o universidad de procedencia</legend>
          ${[
            { value: UNAS, label: "UNAS" },
            { value: OTHER, label: "Otra institución" },
          ]
            .map(
              (u) => `<label class="inscription-choice ${p.university === u.value ? "inscription-choice--selected" : ""}">
                <input type="radio" name="institucion" ${u.value === UNAS ? 'data-field="university"' : ""} value="${esc(u.value)}" ${p.university === u.value ? "checked" : ""} class="sr-only" data-uni-opt />
                <span class="text-sm font-semibold text-ink">${u.label}</span><span class="inscription-radio" aria-hidden="true"></span>
              </label>`,
            )
            .join("")}
          ${s.errors.university ? `<span class="col-span-2 text-xs font-medium text-red-700">${s.errors.university}</span>` : ""}
        </fieldset>
        ${p.university === OTHER ? Field("Nombre de la institución o universidad", "otherUniversity", input("otherUniversity", 'autocomplete="organization"')) : ""}
        ${
          p.university === UNAS
            ? Field(
                "Carrera profesional",
                "career",
                `<select data-field="career" class="field font-normal" aria-invalid="${Boolean(s.errors.career)}"><option value="">Selecciona tu carrera…</option>${unasCareers
                  .map((c) => `<option value="${esc(c)}"${p.career === c ? " selected" : ""}>${esc(c)}</option>`)
                  .join("")}</select>`,
              )
            : ""
        }
        ${p.university === OTHER ? Field("Carrera profesional", "career", input("career")) : ""}`
    }

    return `
      <form novalidate class="mt-4 grid gap-4" data-form="2">
        <fieldset class="grid grid-cols-2 gap-2">
          <legend class="mb-2 text-sm font-semibold text-ink">Tipo de participante</legend>
          ${tickets
            .map(
              (t) => `<label class="inscription-choice ${s.ticket === t.name ? "inscription-choice--selected" : ""}">
                <input type="radio" name="tipo" value="${esc(t.name)}" ${s.ticket === t.name ? "checked" : ""} class="sr-only" data-ticket-opt />
                <span class="text-sm font-semibold text-ink">${esc(t.name)}</span><span class="inscription-radio" aria-hidden="true"></span>
              </label>`,
            )
            .join("")}
        </fieldset>
        ${Field("DNI", "dni", input("dni", 'inputmode="numeric" autocomplete="off"'))}
        ${s.ticket === "Estudiante" ? Field("Código de estudiante", "code", input("code", 'autocomplete="off"')) : ""}
        ${Field("Nombres y apellidos completos", "name", input("name", 'autocomplete="name"'))}
        ${Field("Correo electrónico", "email", input("email", 'type="email" autocomplete="email"'))}
        ${Field("Número de celular", "phone", input("phone", 'type="tel" inputmode="numeric" autocomplete="tel-national"'))}
        ${student}
        <button type="submit" class="btn-primary mt-1 w-full">Continuar</button>
      </form>`
  }

  function lines() {
    const prices = tickets.find((t) => t.name === s.ticket).prices
    return [
      ...(s.activity === "conferencia" || s.activity === "ambas" ? [{ label: "Conferencia (2 días)", price: prices.conferencia }] : []),
      ...chosenWorkshops().map((w) => ({ label: w.title, price: prices.taller })),
    ]
  }

  function step3() {
    const p = s.person
    const ls = lines()
    const amounts = ls.map((l) => parsePrice(l.price))
    const total = amounts.every((v) => v !== null) ? `S/ ${amounts.reduce((a, v) => a + v, 0).toFixed(2)}` : "Por definir"
    const university = p.university === OTHER ? p.otherUniversity.trim() : p.university
    return `
      <div class="mt-4 grid gap-4">
        <section class="inscription-summary">
          <h3>Participante</h3>
          <dl>
            ${SummaryRow("Tipo", s.ticket)}${SummaryRow("Nombre", p.name.trim())}${SummaryRow("DNI", p.dni)}
            ${s.ticket === "Estudiante" ? SummaryRow("Código", p.code.trim()) + SummaryRow("Carrera", p.career.trim()) + SummaryRow("Institución", university) : ""}
            ${SummaryRow("Correo", p.email.trim())}${SummaryRow("Celular", p.phone)}
          </dl>
        </section>
        <section class="inscription-summary">
          <h3>Importe</h3>
          <dl>
            ${ls.map((l) => SummaryRow(l.label, l.price)).join("")}
            <div class="inscription-summary__total"><dt>Total</dt><dd>${total}</dd></div>
          </dl>
        </section>
        <button type="button" class="btn-primary w-full" data-confirm>Confirmar y continuar al pago</button>
      </div>`
  }

  function render() {
    const prevScrim = root.firstElementChild
    const prevDialog = root.querySelector("[role=dialog]")
    const n = s.step === "done" ? 3 : s.step
    const titles = { 1: "¿En qué quieres participar?", 2: "Tus datos", 3: "Revisa tu inscripción" }

    const body =
      s.step === "done"
        ? `<div class="px-1 pt-6 pb-2 text-center">
            <span class="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5e9] text-emerald-700">${icon("Check", { size: 22 })}</span>
            <h2 id="inscription-title" class="mt-4 text-xl font-semibold tracking-tight text-ink">Datos registrados</h2>
            <p class="text-body mt-2 text-sm text-mist">${esc(s.person.name.trim())}${C}, guardamos tu inscripción como ${C}${esc(s.ticket.toLowerCase())}${C}. Tu lugar queda confirmado cuando se apruebe el pago con Yape; te llegará la confirmación a ${C}${esc(s.person.email.trim())}${C}.</p>
            <button type="button" class="btn-primary mt-6 w-full" data-close>Cerrar</button>
          </div>`
        : `<header class="pr-8">
            <div class="flex items-center gap-2">
              ${s.step !== 1 ? `<button type="button" class="inscription-back" aria-label="Volver al paso anterior" data-back>${icon("ArrowLeft", { size: 16 })}</button>` : ""}
              <p class="text-sm text-mist">Inscripción · Paso ${C}${n}${C} de 3</p>
            </div>
            <div class="inscription-progress" aria-hidden="true">${[1, 2, 3].map((i) => `<span class="${i <= n ? "is-active" : ""}"></span>`).join("")}</div>
            <h2 id="inscription-title" class="mt-3 text-xl font-semibold tracking-tight text-ink">${titles[s.step]}</h2>
          </header>
          ${s.step === 1 ? step1() : s.step === 2 ? step2() : step3()}`

    const scrimStyle = prevScrim ? prevScrim.getAttribute("style") : "opacity: 0"
    const dialogStyle = prevDialog ? prevDialog.getAttribute("style") : `opacity: 0; transform: ${reduceMotion ? "none" : "translateY(40px)"}`
    root.innerHTML = `
      <div class="inscription-scrim" style="${scrimStyle}">
        <div role="dialog" aria-modal="true" aria-labelledby="inscription-title" tabindex="-1" class="inscription-dialog" style="${dialogStyle}">
          <button type="button" class="absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center text-ink/45" aria-label="Cerrar" data-close>${icon("X", { size: 18 })}</button>
          ${body}
        </div>
      </div>`
  }

  function goTo(step) {
    s.step = step
    render()
    const dialog = root.querySelector("[role=dialog]")
    dialog.scrollTo({ top: 0 })
    dialog.focus()
  }

  // ── Eventos ──────────────────────────────────────────────────

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-inscription]")
    if (trigger) {
      if (window.closeMobileNav) window.closeMobileNav()
      open({ ticket: trigger.dataset.ticket, workshop: trigger.dataset.workshop, activity: trigger.dataset.activity })
    }
  })

  root.addEventListener("click", (e) => {
    if (!s) return
    if (e.target.classList.contains("inscription-scrim") || e.target.closest("[data-close]")) return close()
    if (e.target.closest("[data-back]")) return goTo(s.step === 3 ? 2 : 1)
    if (e.target.closest("[data-confirm]")) return goTo("done")
  })

  function restoreFocus(t) {
    const sel = t.name ? `input[name="${t.name}"][value="${CSS.escape(t.value)}"]` : t.dataset.workshopOpt ? `[data-workshop-opt="${t.dataset.workshopOpt}"]` : null
    const el = sel && root.querySelector(sel)
    if (el) el.focus()
  }

  root.addEventListener("change", (e) => {
    if (!s) return
    const t = e.target
    if (t.matches("[data-activity-opt]")) {
      s.activity = t.value
      s.stepError = ""
      render()
    } else if (t.matches("[data-workshop-opt]")) {
      const day = t.dataset.day
      const id = t.dataset.workshopOpt
      s.stepError = ""
      if (s.selected[day] === id) delete s.selected[day]
      else s.selected[day] = id
      render()
    } else if (t.matches("[data-ticket-opt]")) {
      s.ticket = t.value
      s.errors = {}
      render()
    } else if (t.matches("[data-uni-opt]")) {
      // La carrera depende de la institución: al cambiarla se vuelve a elegir.
      s.person.university = t.value
      s.person.career = ""
      delete s.errors.university
      delete s.errors.career
      render()
    } else if (t.matches("select[data-field]")) {
      s.person[t.dataset.field] = t.value
      if (s.errors[t.dataset.field]) {
        delete s.errors[t.dataset.field]
        render()
      }
    }
    restoreFocus(t)
  })

  root.addEventListener("input", (e) => {
    if (!s) return
    const t = e.target
    const key = t.dataset.field
    if (!key || t.tagName === "SELECT" || t.type === "radio") return
    let v = t.value
    if (key === "dni") v = v.replace(/\D/g, "").slice(0, 8)
    if (key === "phone") v = v.replace(/\D/g, "").slice(0, 9)
    if (key === "code") v = v.slice(0, 20)
    if (v !== t.value) t.value = v
    s.person[key] = v
    if (s.errors[key]) {
      delete s.errors[key]
      const label = t.closest("label")
      const err = label && label.querySelector(".text-red-700")
      if (err) err.remove()
      t.setAttribute("aria-invalid", "false")
    }
  })

  root.addEventListener("submit", (e) => {
    e.preventDefault()
    if (!s) return
    const form = e.target.dataset.form
    if (form === "1") {
      if (!s.activity) s.stepError = "Elige en qué quieres participar."
      else if (wantsWorkshops() && chosenWorkshops().length === 0) s.stepError = "Elige al menos un taller."
      else {
        s.stepError = ""
        return goTo(2)
      }
      render()
    } else if (form === "2") {
      s.errors = validatePerson(s.person, s.ticket)
      if (Object.keys(s.errors).length === 0) return goTo(3)
      render()
      // Primer campo con error en el orden en que aparece en pantalla.
      const first = [...root.querySelectorAll("[data-field]")].find((n) => s.errors[n.dataset.field])
      if (first) first.focus()
    }
  })

  root.addEventListener("keydown", (e) => {
    if (!s) return
    if (e.key === "Escape") {
      e.stopPropagation()
      return close()
    }
    if (e.key !== "Tab") return
    const dialog = root.querySelector("[role=dialog]")
    const nodes = [...dialog.querySelectorAll("button, input, select, [href], [tabindex]:not([tabindex='-1'])")].filter((n) => !n.hasAttribute("disabled"))
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  })
})()
