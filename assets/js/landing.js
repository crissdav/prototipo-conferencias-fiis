/* Sitio público: secciones, menú, animaciones y navegación activa. */
;(function () {
  const { event, links, highlights, pillars, speakers, agenda, registrationSteps, tickets, faqs } = window.FIIS
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])

  const navLinks = [
    { href: "#evento", label: "El evento", id: "evento" },
    { href: "#ponentes", label: "Ponentes", id: "ponentes" },
    { href: "#conferencias", label: "Conferencias", id: "conferencias" },
    { href: "#talleres", label: "Talleres", id: "talleres" },
    { href: "#inscripcion", label: "Inscripción", id: "inscripcion" },
    { href: "#preguntas", label: "Preguntas", id: "preguntas" },
    { href: "#ubicacion", label: "Ubicación", id: "ubicacion" },
  ]

  // ── Piezas comunes ───────────────────────────────────────────

  function heading(eyebrow, title, lead, center) {
    return `
      <div class="section-heading${center ? " section-heading--center" : ""}">
        <p class="eyebrow">${esc(eyebrow)}</p>
        <h2 class="section-title">${esc(title)}</h2>
        ${lead ? `<div class="section-lead">${lead}</div>` : ""}
      </div>`
  }

  function reveal(html, delay, tag) {
    const t = tag || "div"
    return `<${t} class="reveal" style="transition-delay:${delay || 0}ms">${html}</${t}>`
  }

  function section(id, tone, inner) {
    return `<section id="${id}" class="section-py section-tone-${tone}"><div class="section-shell">${inner}</div></section>`
  }

  // ── Secciones ────────────────────────────────────────────────

  function about() {
    const stats = highlights
      .map(
        (h) => `
        <div class="stat-card">
          <dt class="sr-only">${esc(h.label)}</dt>
          <dd class="stat-card__value">${esc(h.value)}</dd>
          <dd class="stat-card__label">${esc(h.label)}</dd>
        </div>`,
      )
      .join("")
    const cards = pillars
      .map((p, i) =>
        reveal(
          `<div class="surface-card feature-card h-full">
            <span class="milestone-card__icon">${icon(p.icon, { size: 18 })}</span>
            <h3 class="card-title">${esc(p.title)}</h3>
            <p class="card-text">${esc(p.text)}</p>
          </div>`,
          i * 60,
        ),
      )
      .join("")
    return section(
      "evento",
      "white",
      `<div class="about-grid">
        ${reveal(
          heading(
            "El evento",
            "Un punto de encuentro para el talento digital de la región",
            "La Facultad de Ingeniería en Informática y Sistemas de la UNAS organiza su ciclo de conferencias y talleres para acercar a estudiantes, docentes y profesionales a las tecnologías que hoy mueven la industria.",
          ),
        )}
        ${reveal(`<dl class="stats-grid">${stats}</dl>`, 80)}
      </div>
      <div class="bento-grid mt-12 sm-cols-2 lg-cols-4">${cards}</div>`,
    )
  }

  function initials(name) {
    return name
      .split(" ")
      .filter((part) => part && !part.endsWith("."))
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  function speakersSection() {
    const pending = speakers.some((s) => !s.confirmed)
    const cards = speakers
      .map((s, i) =>
        reveal(
          `<div class="surface-card speaker-card h-full">
            <div class="speaker-avatar">${s.confirmed ? `<span>${initials(s.name)}</span>` : icon("UserRound", { size: 26 })}</div>
            <div style="min-width:0">
              <h3 class="speaker-name">${esc(s.name)}</h3>
              <p class="speaker-topic">${esc(s.topic)} · <span>${esc(s.org)}</span></p>
            </div>
          </div>`,
          i * 50,
        ),
      )
      .join("")
    return section(
      "ponentes",
      "sky",
      reveal(
        heading(
          "Ponentes",
          "Voces de la industria y la academia",
          pending
            ? "Estamos confirmando a nuestros ponentes. Muy pronto anunciaremos los nombres de cada conferencia y taller."
            : "Conoce a quienes compartirán su experiencia en esta edición.",
        ),
      ) + `<div class="bento-grid mt-12 sm-cols-2 lg-cols-3">${cards}</div>`,
    )
  }

  function capacityMeter(enrolled, capacity) {
    const filled = Math.min(capacity, Math.max(0, enrolled))
    const ratio = capacity === 0 ? 0 : filled / capacity
    return `
      <div class="agenda-capacity">
        <div class="agenda-capacity__row">
          <span>Aforo</span>
          <span class="agenda-capacity__count">${filled}<span class="agenda-capacity__total">/${capacity}</span></span>
        </div>
        <div class="agenda-capacity__track" role="meter" aria-valuenow="${filled}" aria-valuemin="0" aria-valuemax="${capacity}" aria-label="${filled} de ${capacity} personas inscritas">
          <div class="agenda-capacity__fill" style="width:${ratio * 100}%"></div>
        </div>
      </div>`
  }

  function trackList(kind) {
    const groups = agenda
      .map((day) => ({ ...day, items: day.items.filter((item) => item.kind === kind) }))
      .filter((day) => day.items.length > 0)

    return `<div class="agenda-groups">${groups
      .map(
        (day) => `
        <div>
          <h3 class="agenda-day"><span class="agenda-day__badge">${day.day}</span><span class="agenda-day__date">${day.date}</span></h3>
          <ul class="agenda-cards">${day.items
            .map((item) => {
              let extra = ""
              if (item.capacity) {
                const full = (item.enrolled || 0) >= item.capacity
                extra =
                  capacityMeter(item.enrolled || 0, item.capacity) +
                  (full
                    ? `<button type="button" class="btn-primary agenda-card__cta" disabled>Cupos agotados</button>`
                    : `<button type="button" class="btn-primary agenda-card__cta" data-inscription data-workshop="${item.id}">Inscribirme<span class="sr-only"> en ${esc(item.title)}</span>${icon("ArrowUpRight", { size: 16 })}</button>`)
              }
              return `
              <li class="h-full">
                <div class="surface-card agenda-card">
                  <time class="agenda-card__time" datetime="${item.time}">${item.time}</time>
                  <p class="agenda-card__title">${esc(item.title)}</p>
                  ${item.speaker ? `<p class="agenda-card__meta">${esc(item.speaker)}</p>` : ""}
                  ${item.location ? `<p class="agenda-card__meta">${esc(item.location)}</p>` : ""}
                  ${extra}
                </div>
              </li>`
            })
            .join("")}</ul>
        </div>`,
      )
      .join("")}</div>`
  }

  function conferencePass() {
    const talkCount = agenda.reduce((sum, day) => sum + day.items.filter((i) => i.kind === "conferencia").length, 0)
    return `
      <div class="conference-pass">
        <div class="conference-pass__body">
          <h3 class="conference-pass__title">Un solo pago, las ${talkCount} ponencias de los 2 días</h3>
          <p class="conference-pass__text">
            No pagas por ponencia: con tu inscripción a la conferencia entras a todas las charlas del ${agenda[0].date.toLowerCase()}
            y del ${agenda[agenda.length - 1].date.toLowerCase()}. Los talleres se inscriben aparte, según cupo.
          </p>
          <ul class="conference-pass__prices">${tickets
            .map((t) => `<li><span>${esc(t.name)}</span><strong>${esc(t.prices.conferencia)}</strong></li>`)
            .join("")}</ul>
        </div>
        <button type="button" class="btn-primary conference-pass__cta" data-inscription data-activity="conferencia">
          Inscribirme a la conferencia ${icon("ArrowUpRight", { size: 16 })}
        </button>
      </div>`
  }

  function agendaSection() {
    const tracks = [
      { id: "conferencias", label: "Conferencias", kind: "conferencia", tone: "white", text: "Charlas magistrales y paneles. Los horarios son tentativos hasta que el comité confirme el programa." },
      { id: "talleres", label: "Talleres", kind: "taller", tone: "plain", text: "Espacios hands-on con aforo limitado. El horario final se publicará con la confirmación de facilitadores." },
    ]
    return `<div id="programa">${tracks
      .map((t) =>
        section(
          t.id,
          t.tone,
          reveal(heading("Programa", t.label, t.text)) +
            reveal(`<div class="mt-10">${trackList(t.kind)}</div>`, 80) +
            (t.kind === "conferencia" ? reveal(conferencePass(), 120) : ""),
        ),
      )
      .join("")}</div>`
  }

  function registration() {
    const steps = registrationSteps
      .map((s, i) =>
        reveal(
          `<div class="step-card">
            <div class="step-head"><span class="step-card__number">${i + 1}</span>${icon(s.icon, { size: 20 })}</div>
            <h3 class="card-title">${esc(s.title)}</h3>
            <p class="card-text">${esc(s.text)}</p>
          </div>`,
          i * 60,
          "li",
        ),
      )
      .join("")
    const ticketCards = tickets
      .map((t, i) =>
        reveal(
          `<div class="surface-card ticket-card">
            <h3 class="ticket-name">${esc(t.name)}</h3>
            <p class="ticket-note">${esc(t.note)}</p>
            <dl class="ticket-prices">
              <div class="ticket-prices__row"><dt>Conferencia (2 días)</dt><dd class="ticket-price">${esc(t.prices.conferencia)}</dd></div>
              <div class="ticket-prices__row"><dt>Por taller</dt><dd class="ticket-price ticket-price--secondary">${esc(t.prices.taller)}</dd></div>
            </dl>
            <ul class="ticket-features">${t.features.map((f) => `<li>${icon("Check", { size: 16 })}${esc(f)}</li>`).join("")}</ul>
            <button type="button" class="btn-primary" data-inscription data-ticket="${esc(t.name)}">Inscribirme ${icon("ArrowUpRight", { size: 16 })}</button>
          </div>`,
          i * 70,
        ),
      )
      .join("")
    return section(
      "inscripcion",
      "white",
      reveal(
        heading(
          "Inscripción",
          "Tu lugar en cuatro pasos",
          "Todo el proceso es digital: registro, pago, asistencia con QR y certificado verificable.",
          true,
        ),
      ) +
        `<ol class="bento-grid mt-12 sm-cols-2 lg-cols-4">${steps}</ol>
        <div class="bento-grid tickets-grid sm-cols-2">${ticketCards}</div>`,
    )
  }

  function faqSection() {
    const items = faqs
      .map(
        (f, i) => `
        <li class="faq-item${i === 0 ? " is-open" : ""}">
          <button type="button" class="faq-item__q" aria-expanded="${i === 0}" aria-controls="faq-${i}">
            ${esc(f.q)}
            <span class="faq-item__icon" aria-hidden="true">${icon("Plus", { size: 18 })}</span>
          </button>
          <div class="faq-item__panel" id="faq-${i}"><div><p class="faq-item__a text-body">${esc(f.a)}</p></div></div>
        </li>`,
      )
      .join("")
    return section(
      "preguntas",
      "tint",
      `<div class="faq-grid">
        ${reveal(heading("Preguntas frecuentes", "Lo que más nos consultan", "¿No encuentras tu respuesta? Escríbenos y el comité organizador te responderá."))}
        ${reveal(`<ul class="faq-list">${items}</ul>`, 80)}
      </div>`,
    )
  }

  function location() {
    const items = [
      { icon: "CalendarDays", content: esc(event.datesLabel) },
      { icon: "MapPin", content: esc(`${event.venue}, Carretera Central km 1.21, ${event.city}`) },
      { icon: "Phone", content: `<a href="tel:+5162561009">${links.phone}</a>` },
      { icon: "Mail", content: `<a href="mailto:${links.email}" class="break-anywhere">${links.email}</a>` },
    ]
    return section(
      "ubicacion",
      "white",
      `<div class="location-grid">
        ${reveal(
          heading("Ubicación", "Te esperamos en el campus principal UNAS", "El ciclo de conferencias se realiza en las instalaciones de la FIIS, en Tingo María.") +
            `<ul class="info-list">${items
              .map((it) => `<li class="glass-surface info-item"><span class="info-icon">${icon(it.icon, { size: 16 })}</span><span>${it.content}</span></li>`)
              .join("")}</ul>`,
        )}
        ${reveal(
          `<div class="surface-card map-card">
            <div class="contact-map">
              <iframe title="Mapa de la FIIS en el campus UNAS, Tingo María" src="${links.maps}" class="contact-map__frame" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
              <a href="${links.mapsOpen}" target="_blank" rel="noreferrer" class="contact-map__open">Abrir en Google Maps</a>
            </div>
          </div>`,
          90,
        )}
      </div>`,
    )
  }

  document.getElementById("secciones").innerHTML =
    about() + speakersSection() + agendaSection() + registration() + faqSection() + location()

  // ── Navegación ───────────────────────────────────────────────

  document.getElementById("nav-desktop").innerHTML =
    navLinks.map((l) => `<a href="${l.href}" class="nav-link" data-section="${l.id}">${l.label}</a>`).join("") +
    `<button type="button" class="nav-desktop-cta btn-primary btn-hint" data-inscription>Inscríbete ahora <i data-icon="ArrowUpRight" data-size="16" class="btn-hint__icon"></i></button>`

  document.getElementById("nav-mobile").innerHTML = navLinks
    .map((l) => `<a href="${l.href}" class="mobile-nav-link" data-section="${l.id}" data-close-nav>${l.label}</a>`)
    .join("")

  hydrateIcons()

  // ── Fondo animado del hero (FluidMorphBg con SMIL) ───────────

  const pathsData = [
    ["M -84.52,-81.13 C -94.62,-73.4 -88.88,-59.55 -90.33,-48.91 -89.29,27.31 -89.61,103.5 -88.33,179.8 -85.99,416.1 -81.32,888.9 -81.32,888.9 -81.32,888.9 974.5,888.7 1587,891.9 1518,719.9 1487,644 1429,533 1388,437.7 1447,259.7 1400,187 1362,132 1270,90.53 1207,39.93 1161,2.932 1071,-74.45 1071,-74.45 1071,-74.45 914.5,-77.77 848.2,-80.17 537.6,-80.84 227,-81.38 -83.6,-81.6 -83.91,-81.44 -84.21,-81.29 -84.52,-81.13 Z",
     "M -84.52,-81.13 C -94.62,-73.4 -88.88,-59.55 -90.33,-48.91 -89.29,27.31 -89.61,103.5 -88.33,179.8 -85.99,416.1 -81.32,888.9 -81.32,888.9 -81.32,888.9 974.5,888.7 1587,891.9 1576,704.7 1517,625.7 1459,514.7 1418,419.4 1430,288.5 1382,187 1349,116.3 1296,54.47 1240,0.3429 1205,-33.51 1120,-83.59 1120,-83.59 1120,-83.59 914.5,-77.77 848.2,-80.17 537.6,-80.84 227,-81.38 -83.6,-81.6 -83.91,-81.44 -84.21,-81.29 -84.52,-81.13 Z"],
    ["M 665.2,-83.08 C 413.7,-81.89 162.2,-82.43 -89.29,-81.61 -90.35,164.3 -85.06,410.2 -84.09,656.1 -83.37,733.7 -82.64,811.3 -81.92,888.9 442.4,889.8 966.7,890.7 1491,891.6 1253,747.5 1417,429.4 1286,245.4 1227,163.2 1107,142.1 1043,64.54 1009,24.41 973,-76.01 973,-76.01 973,-76.01 706.6,-83.67 665.2,-83.08 Z",
     "M 665.2,-83.08 C 413.7,-81.89 162.2,-82.43 -89.29,-81.61 -90.35,164.3 -85.06,410.2 -84.09,656.1 -83.37,733.7 -82.64,811.3 -81.92,888.9 442.4,889.8 966.7,890.7 1491,891.6 1253,747.5 1349,460.4 1243,260.6 1199,176.6 1145,96.92 1083,24.95 1050,-12.63 973,-76.01 973,-76.01 973,-76.01 706.6,-83.67 665.2,-83.08 Z"],
    ["M -85.01,-74.02 C -92.39,-66.64 -85.37,-55.79 -87.81,-46.91 -86.65,265.1 -84.66,577.2 -83.18,889.2 317.2,888.3 717.5,885.8 1118,890.4 1152,890.6 1187,890.9 1221,890 1219,768.3 1224,643.6 1187,526 1153,417 1091,319.3 1029,224.1 998.8,178.5 968.8,132.6 936.6,88.23 891.7,27.39 772.2,-78.96 772.2,-78.96 772.2,-78.96 222.1,-81.07 -85.01,-74.02 Z",
     "M -85.01,-74.02 C -92.39,-66.64 -85.37,-55.79 -87.81,-46.91 -86.65,265.1 -84.66,577.2 -83.18,889.2 317.2,888.3 717.5,885.8 1118,890.4 1152,890.6 1187,890.9 1221,890 1219,768.3 1175,659.3 1150,544.3 1128,438.4 1143,312.6 1081,227.1 1004,121.1 925.8,114.8 851.3,54.73 762,-17.34 772.2,-78.96 772.2,-78.96 772.2,-78.96 222.1,-81.07 -85.01,-74.02 Z"],
    ["M -92.42,-79.11 C -89.97,243.8 -87.52,566.7 -85.07,889.6 201.8,889.9 488.7,889.9 775.5,895.6 880.4,896.9 985.2,894 1090,892.5 1064,773.3 1037,651.6 976.1,544.8 946.7,495.8 914.6,448.3 882,401.3 820.9,314.4 742.3,252 666.4,177.4 583.2,98.01 496.5,12.18 386.7,-23.38 328.4,-45.64 232.6,-81.38 232.6,-81.38 232.6,-81.38 9.82,-84.94 -92.42,-79.11 Z",
     "M -92.42,-79.11 C -89.97,243.8 -87.52,566.7 -85.07,889.6 201.8,889.9 488.7,889.9 775.5,895.6 880.4,896.9 1063,889.5 1063,889.5 1063,889.5 1081,768.2 997.4,608.7 958.5,534.8 969.9,436.8 918.5,370.8 848.4,280.8 717,260.3 629.9,186.5 552.6,121.2 491.5,38.73 426.3,-38.61 412.9,-54.44 387.9,-87.47 387.9,-87.47 387.9,-87.47 9.82,-84.94 -92.42,-79.11 Z"],
    ["M -88.6,95.54 C -90.38,166.1 -88.23,236.7 -88.68,307.4 L -86.19,890 C 229.7,890.2 939.8,892.4 939.8,892.4 855.2,767 831,639.4 721.4,519.4 634.7,424.5 526.4,360.9 428.8,281.8 332.7,204 251.6,102.3 140.1,48.9 70.75,15.73 -24.82,24.2 -85.28,0.03 Z",
     "M -88.6,95.54 C -90.38,166.1 -88.23,236.7 -88.68,307.4 L -86.19,890 C 229.7,890.2 939.8,892.4 939.8,892.4 906.9,734.7 779.3,676 721.4,519.4 676.8,398.8 566.5,307.1 458.9,236.6 355.2,168.7 220.3,165.7 107.8,113.5 40.05,82.12 -24.82,24.2 -85.28,0.03 Z"],
    ["M -95.69,252.3 -87.65,890.4 698.1,892 C 698.1,892 599.1,687.7 518.9,610.6 348,446.2 131.4,466.5 -95.69,252.3 Z",
     "M -95.69,252.3 -87.65,890.4 698.1,892 C 698.1,892 569.8,587.1 448.9,482.7 299.7,353.9 131.4,466.5 -95.69,252.3 Z"],
    ["M -85.59,444.4 -85.59,890.6 489,895.6 C 489,895.6 436.8,745.3 382.5,690.8 258.1,565.8 57.98,629.2 -85.59,444.4 Z",
     "M -85.59,444.4 -85.59,890.6 546.9,895.6 C 546.9,895.6 517.4,695.4 339.9,593.4 187.7,505.9 57.98,629.2 -85.59,444.4 Z"],
  ]
  const colors = ["#014c90", "#013d75", "#014c90", "#021e46", "#014c90", "#013d75", "#021e46"]
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const duration = 18

  document.getElementById("fluid-bg").innerHTML = `
    <svg preserveAspectRatio="none" viewBox="0 0 1440 800" aria-hidden="true">${pathsData
      .map(([a, b], index) => {
        const pathDuration = duration + (index % 3) * 0.5
        const delay = (index % 4) * 0.2
        const anim = reduceMotion
          ? ""
          : `<animate attributeName="d" values="${a};${b};${a}" dur="${pathDuration * 2}s" begin="${delay}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"/>`
        return `<path d="${a}" fill="${colors[index % colors.length]}" opacity="0.78">${anim}</path>`
      })
      .join("")}</svg>`

  // ── Altura del header (--header-offset) ──────────────────────

  const header = document.getElementById("site-header")
  const setOffset = () => document.documentElement.style.setProperty("--header-offset", `${header.querySelector(".site-header__bar").offsetHeight}px`)
  setOffset()
  window.addEventListener("resize", setOffset, { passive: true })
  if ("ResizeObserver" in window) new ResizeObserver(setOffset).observe(header.querySelector(".site-header__bar"))

  // ── Sección activa ───────────────────────────────────────────

  const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean)
  let raf = 0
  function updateActive() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-offset")) || 72
      const line = offset + 20
      let current = ""
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id
      document.querySelectorAll("[data-section]").forEach((a) => {
        const on = a.dataset.section === current
        a.classList.toggle(a.classList.contains("mobile-nav-link") ? "mobile-nav-link-active" : "nav-link-active", on)
      })
    })
  }
  updateActive()
  window.addEventListener("scroll", updateActive, { passive: true })
  window.addEventListener("resize", updateActive, { passive: true })

  // ── Reveal al hacer scroll ───────────────────────────────────

  const reveals = document.querySelectorAll(".reveal")
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    )
    reveals.forEach((el) => io.observe(el))
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"))
  }

  // ── Menú móvil (hoja inferior que se arrastra para cerrar) ───

  const menuBtn = document.getElementById("nav-menu-btn")
  const sheet = document.getElementById("mobile-nav")
  const scrim = document.getElementById("mobile-nav-scrim")
  let navOpen = false

  function setNav(open) {
    navOpen = open
    header.classList.toggle("mobile-nav-open", open)
    menuBtn.setAttribute("aria-expanded", String(open))
    menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú")
    menuBtn.innerHTML = icon(open ? "X" : "Menu", { size: 18 })
    document.body.style.overflow = open ? "hidden" : ""
    sheet.style.transform = ""
    scrim.style.opacity = ""
  }
  window.closeMobileNav = () => navOpen && setNav(false)

  menuBtn.addEventListener("click", () => setNav(!navOpen))
  scrim.addEventListener("click", () => setNav(false))
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navOpen) setNav(false)
  })
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-nav]")) setNav(false)
  })

  sheet.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || reduceMotion) return
    const startY = e.clientY
    const samples = [{ y: startY, t: e.timeStamp }]
    let dragging = false
    let delta = 0

    function onMove(ev) {
      delta = ev.clientY - startY
      samples.push({ y: ev.clientY, t: ev.timeStamp })
      if (samples.length > 6) samples.shift()
      if (!dragging) {
        if (Math.abs(delta) < 10) return
        dragging = true
        sheet.classList.add("is-dragging")
      }
      const y = delta < 0 ? -((-delta * innerHeight * 0.55) / (innerHeight + 0.55 * -delta)) : delta
      sheet.style.transform = `translateY(${y}px)`
      scrim.style.opacity = String(Math.max(0, 1 - y / innerHeight))
    }

    function finish() {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", finish)
      window.removeEventListener("pointercancel", finish)
      sheet.classList.remove("is-dragging")
      if (!dragging) return
      const swallow = (c) => {
        c.preventDefault()
        c.stopPropagation()
        window.removeEventListener("click", swallow, true)
      }
      window.addEventListener("click", swallow, true)
      setTimeout(() => window.removeEventListener("click", swallow, true), 0)
      const first = samples[0]
      const last = samples[samples.length - 1]
      const dt = (last.t - first.t) / 1000
      const velocity = dt > 0 ? (last.y - first.y) / dt : 0
      const projected = delta + ((velocity / 1000) * 0.998) / (1 - 0.998)
      const threshold = velocity > 180 ? 28 : 160
      if (velocity >= -80 && projected > threshold) setNav(false)
      else {
        sheet.style.transform = ""
        scrim.style.opacity = ""
      }
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", finish)
    window.addEventListener("pointercancel", finish)
  })

  // ── Preguntas frecuentes (una abierta a la vez) ──────────────

  document.querySelectorAll(".faq-item__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item")
      const wasOpen = item.classList.contains("is-open")
      document.querySelectorAll(".faq-item").forEach((li) => {
        li.classList.remove("is-open")
        li.querySelector(".faq-item__q").setAttribute("aria-expanded", "false")
      })
      if (!wasOpen) {
        item.classList.add("is-open")
        btn.setAttribute("aria-expanded", "true")
      }
    })
  })

  // ── Volver arriba ────────────────────────────────────────────

  const toTop = document.getElementById("back-to-top")
  const onScroll = () => toTop.classList.toggle("is-visible", window.scrollY > 720)
  onScroll()
  window.addEventListener("scroll", onScroll, { passive: true })
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }))
})()
