/*
 * Sitio público: About, Speakers, Agenda, Registration, Faq y Location con los mismos className del
 * JSX original, más las animaciones de motion (Reveal, HeroFade, Faq, MobileNavSheet, BackToTop).
 * "<!---->" separa los nodos de texto donde React los separa ({valor} junto a texto fijo).
 */
;(function () {
  const { event, links, highlights, pillars, speakers, agenda, registrationSteps, tickets, faqs } = window.FIIS
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
  const C = "<!---->"
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  /** springSoft / springUI de motionPresets.ts (resortes sin rebote), aproximados con una curva. */
  const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

  const navLinks = [
    { href: "#evento", label: "El evento", id: "evento" },
    { href: "#ponentes", label: "Ponentes", id: "ponentes" },
    { href: "#conferencias", label: "Conferencias", id: "conferencias" },
    { href: "#talleres", label: "Talleres", id: "talleres" },
    { href: "#inscripcion", label: "Inscripción", id: "inscripcion" },
    { href: "#preguntas", label: "Preguntas", id: "preguntas" },
    { href: "#ubicacion", label: "Ubicación", id: "ubicacion" },
  ]

  // ── ui.tsx ───────────────────────────────────────────────────

  function SectionHeading({ eyebrow, title, children, align }) {
    const alignClass = align === "center" ? "mx-auto text-center" : ""
    return `<div class="max-w-3xl xl:max-w-4xl ${alignClass} ">
      <p class="eyebrow ">${esc(eyebrow)}</p>
      <h2 class="section-title mt-2 font-sans font-semibold text-ink sm:mt-2.5 ">${esc(title)}</h2>
      ${children ? `<div class="text-body mt-4 text-[0.975rem] sm:mt-5 sm:text-base text-mist">${children}</div>` : ""}
    </div>`
  }

  const toneClass = { white: "section-tone-white", tint: "section-tone-tint", sky: "section-tone-sky", deep: "section-tone-deep", plain: "section-tone-plain" }
  const Section = (id, tone, inner) => `<section id="${id}" class="section-py ${toneClass[tone]}  "><div class="section-shell">${inner}</div></section>`

  /** Reveal.tsx: aparece al entrar en pantalla (opacity 0 → 1, y 16 → 0). */
  const Reveal = (inner, delay) =>
    `<div data-reveal="${delay || 0}" style="opacity: 0; transform: ${reduceMotion ? "none" : "translateY(16px)"}">${inner}</div>`

  // ── About.tsx ────────────────────────────────────────────────

  function About() {
    return Section(
      "evento",
      "white",
      `<div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-14">
        ${Reveal(
          SectionHeading({
            eyebrow: "El evento",
            title: "Un punto de encuentro para el talento digital de la región",
            children:
              "La Facultad de Ingeniería en Informática y Sistemas de la UNAS organiza su ciclo de conferencias y talleres para acercar a estudiantes, docentes y profesionales a las tecnologías que hoy mueven la industria.",
          }),
        )}
        ${Reveal(
          `<dl class="grid grid-cols-3 gap-3">${highlights
            .map(
              (item) => `<div class="stat-card"><dt class="sr-only">${esc(item.label)}</dt><dd class="stat-card__value">${esc(item.value)}</dd><dd class="stat-card__label">${esc(item.label)}</dd></div>`,
            )
            .join("")}</dl>`,
          80,
        )}
      </div>
      <div class="bento-grid mt-12 sm:grid-cols-2 lg:grid-cols-4">${pillars
        .map((pillar, index) =>
          Reveal(
            `<div class="surface-card  feature-card h-full p-6">
              <span class="milestone-card__icon">${icon(pillar.icon, { size: 18 })}</span>
              <h3 class="mt-5 text-lg font-semibold tracking-tight text-ink">${esc(pillar.title)}</h3>
              <p class="text-body mt-2 text-sm text-mist">${esc(pillar.text)}</p>
            </div>`,
            index * 60,
          ),
        )
        .join("")}</div>`,
    )
  }

  // ── Speakers.tsx ─────────────────────────────────────────────

  function initials(name) {
    return name
      .split(" ")
      .filter((part) => part && !part.endsWith("."))
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  function Speakers() {
    const pending = speakers.some((s) => !s.confirmed)
    return Section(
      "ponentes",
      "sky",
      Reveal(
        SectionHeading({
          eyebrow: "Ponentes",
          title: "Voces de la industria y la academia",
          children: pending
            ? "Estamos confirmando a nuestros ponentes. Muy pronto anunciaremos los nombres de cada conferencia y taller."
            : "Conoce a quienes compartirán su experiencia en esta edición.",
        }),
      ) +
        `<div class="bento-grid mt-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">${speakers
          .map((speaker, index) =>
            Reveal(
              `<div class="surface-card  speaker-card flex h-full items-center gap-4 p-5">
                <div class="speaker-avatar">${speaker.confirmed ? `<span class="text-lg font-semibold">${initials(speaker.name)}</span>` : icon("UserRound", { size: 26 })}</div>
                <div class="min-w-0">
                  <h3 class="font-semibold tracking-tight ${speaker.confirmed ? "text-ink" : "text-ink/55"}">${esc(speaker.name)}</h3>
                  <p class="mt-0.5 text-sm text-mist">${esc(speaker.topic)}${C} · <span class="font-medium text-leaf">${esc(speaker.org)}</span></p>
                </div>
              </div>`,
              index * 50,
            ),
          )
          .join("")}</div>`,
    )
  }

  // ── Agenda.tsx ───────────────────────────────────────────────

  function CapacityMeter(enrolled, capacity) {
    const filled = Math.min(capacity, Math.max(0, enrolled))
    const ratio = capacity === 0 ? 0 : filled / capacity
    return `<div class="agenda-capacity">
      <div class="agenda-capacity__row"><span>Aforo</span><span class="agenda-capacity__count">${filled}<span class="agenda-capacity__total">/${C}${capacity}</span></span></div>
      <div class="agenda-capacity__track" role="meter" aria-valuenow="${filled}" aria-valuemin="0" aria-valuemax="${capacity}" aria-label="${filled} de ${capacity} personas inscritas">
        <div class="agenda-capacity__fill" style="width: ${ratio * 100}%"></div>
      </div>
    </div>`
  }

  function TrackList(kind) {
    const groups = agenda.map((day) => ({ ...day, items: day.items.filter((item) => item.kind === kind) })).filter((day) => day.items.length > 0)
    return `<div class="agenda-groups">${groups
      .map(
        (day) => `<div>
          <h3 class="agenda-day"><span class="agenda-day__badge">${day.day}</span><span class="agenda-day__date">${day.date}</span></h3>
          <ul class="agenda-cards">${day.items
            .map((item) => {
              let extra = ""
              if (item.capacity) {
                extra =
                  CapacityMeter(item.enrolled || 0, item.capacity) +
                  ((item.enrolled || 0) >= item.capacity
                    ? `<button type="button" class="btn-primary agenda-card__cta" disabled>Cupos agotados</button>`
                    : `<button type="button" class="btn-primary agenda-card__cta" data-inscription data-workshop="${item.id}">Inscribirme<span class="sr-only"> en ${C}${esc(item.title)}</span>${icon("ArrowUpRight", { size: 16 })}</button>`)
              }
              return `<li class="h-full"><div class="surface-card  agenda-card">
                <time class="agenda-card__time" datetime="${item.time}">${item.time}</time>
                <p class="agenda-card__title">${esc(item.title)}</p>
                ${item.speaker ? `<p class="agenda-card__meta">${esc(item.speaker)}</p>` : ""}
                ${item.location ? `<p class="agenda-card__meta">${esc(item.location)}</p>` : ""}
                ${extra}
              </div></li>`
            })
            .join("")}</ul>
        </div>`,
      )
      .join("")}</div>`
  }

  function ConferencePass() {
    const talkCount = agenda.reduce((sum, day) => sum + day.items.filter((i) => i.kind === "conferencia").length, 0)
    return `<div class="conference-pass">
      <div class="min-w-0">
        <h3 class="conference-pass__title">Un solo pago, las ${C}${talkCount}${C} ponencias de los 2 días</h3>
        <p class="conference-pass__text">No pagas por ponencia: con tu inscripción a la conferencia entras a todas las charlas del ${C}${agenda[0].date.toLowerCase()}${C} ${C}y del ${C}${agenda[agenda.length - 1].date.toLowerCase()}${C}. Los talleres se inscriben aparte, según cupo.</p>
        <ul class="conference-pass__prices">${tickets.map((t) => `<li><span>${esc(t.name)}</span><strong>${esc(t.prices.conferencia)}</strong></li>`).join("")}</ul>
      </div>
      <button type="button" class="btn-primary conference-pass__cta" data-inscription data-activity="conferencia">Inscribirme a la conferencia${icon("ArrowUpRight", { size: 16 })}</button>
    </div>`
  }

  function Agenda() {
    const tracks = [
      { id: "conferencias", label: "Conferencias", kind: "conferencia", text: "Charlas magistrales y paneles. Los horarios son tentativos hasta que el comité confirme el programa." },
      { id: "talleres", label: "Talleres", kind: "taller", text: "Espacios hands-on con aforo limitado. El horario final se publicará con la confirmación de facilitadores." },
    ]
    return `<div id="programa">${tracks
      .map((track, index) =>
        Section(
          track.id,
          index === 1 ? "plain" : "white",
          Reveal(SectionHeading({ eyebrow: "Programa", title: track.label, children: track.text })) +
            Reveal(`<div class="mt-10">${TrackList(track.kind)}</div>`, 80) +
            (track.kind === "conferencia" ? Reveal(ConferencePass(), 120) : ""),
        ),
      )
      .join("")}</div>`
  }

  // ── Registration.tsx ─────────────────────────────────────────

  function Registration() {
    return Section(
      "inscripcion",
      "white",
      Reveal(
        SectionHeading({
          eyebrow: "Inscripción",
          title: "Tu lugar en cuatro pasos",
          children: "Todo el proceso es digital: registro, pago, asistencia con QR y certificado verificable.",
          align: "center",
        }),
      ) +
        `<ol class="bento-grid mt-12 sm:grid-cols-2 lg:grid-cols-4">${registrationSteps
          .map((step, index) =>
            Reveal(
              `<li class="step-card h-full">
                <div class="flex items-center gap-3"><span class="step-card__number">${index + 1}</span>${icon(step.icon, { size: 20, cls: "text-leaf" })}</div>
                <h3 class="mt-5 text-lg font-semibold tracking-tight text-ink">${esc(step.title)}</h3>
                <p class="text-body mt-2 text-sm text-mist">${esc(step.text)}</p>
              </li>`,
              index * 60,
            ),
          )
          .join("")}</ol>
        <div class="bento-grid mx-auto mt-14 max-w-4xl sm:grid-cols-2">${tickets
          .map((ticket, index) =>
            Reveal(
              `<div class="surface-card  ticket-card flex h-full flex-col p-7">
                <h3 class="text-lg font-semibold tracking-tight text-ink">${esc(ticket.name)}</h3>
                <p class="mt-1 text-sm text-mist">${esc(ticket.note)}</p>
                <dl class="ticket-prices">
                  <div class="ticket-prices__row"><dt>Conferencia (2 días)</dt><dd class="ticket-price">${esc(ticket.prices.conferencia)}</dd></div>
                  <div class="ticket-prices__row"><dt>Por taller</dt><dd class="ticket-price ticket-price--secondary">${esc(ticket.prices.taller)}</dd></div>
                </dl>
                <ul class="mt-6 flex-1 space-y-3">${ticket.features
                  .map((f) => `<li class="flex items-start gap-2.5 text-sm text-ink/85">${icon("Check", { size: 16, cls: "mt-0.5 shrink-0 text-leaf" })}${esc(f)}</li>`)
                  .join("")}</ul>
                <button type="button" class="btn-primary mt-8 w-full" data-inscription data-ticket="${esc(ticket.name)}">Inscribirme${icon("ArrowUpRight", { size: 16 })}</button>
              </div>`,
              index * 70,
            ),
          )
          .join("")}</div>`,
    )
  }

  // ── Faq.tsx ──────────────────────────────────────────────────

  let faqAbierta = 0

  function FaqItem(item, index) {
    const isOpen = faqAbierta === index
    return `<li class="faq-item">
      <button type="button" class="faq-item__q" aria-expanded="${isOpen}" aria-controls="faq-${index}" data-faq="${index}">${esc(item.q)}<span class="faq-item__icon" aria-hidden="true" style="transform: ${isOpen ? "rotate(45deg)" : "none"}">${icon("Plus", { size: 18 })}</span></button>
      ${isOpen ? `<div id="faq-${index}" class="overflow-hidden" style="height: auto; opacity: 1"><p class="faq-item__a text-body">${esc(item.a)}</p></div>` : ""}
    </li>`
  }

  function Faq() {
    return Section(
      "preguntas",
      "tint",
      `<div class="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        ${Reveal(SectionHeading({ eyebrow: "Preguntas frecuentes", title: "Lo que más nos consultan", children: "¿No encuentras tu respuesta? Escríbenos y el comité organizador te responderá." }))}
        ${Reveal(`<ul class="faq-list">${faqs.map(FaqItem).join("")}</ul>`, 80)}
      </div>`,
    )
  }

  // ── Location.tsx ─────────────────────────────────────────────

  function Location() {
    const items = [
      { icon: "CalendarDays", content: esc(event.datesLabel) },
      { icon: "MapPin", content: esc(`${event.venue}, Carretera Central km 1.21, ${event.city}`) },
      { icon: "Phone", content: `<a href="tel:+5162561009" class="font-medium transition hover:text-leaf">${links.phone}</a>` },
      { icon: "Mail", content: `<a href="mailto:${links.email}" class="break-anywhere font-medium transition hover:text-leaf">${links.email}</a>` },
    ]
    return Section(
      "ubicacion",
      "white",
      `<div class="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-start lg:gap-14">
        ${Reveal(
          SectionHeading({ eyebrow: "Ubicación", title: "Te esperamos en el campus principal UNAS", children: "El ciclo de conferencias se realiza en las instalaciones de la FIIS, en Tingo María." }) +
            `<ul class="mt-8 space-y-3">${items
              .map((it) => `<li class="glass-surface flex items-center gap-3 rounded-2xl p-3.5 text-sm text-ink"><span class="info-icon">${icon(it.icon, { size: 16 })}</span><span>${it.content}</span></li>`)
              .join("")}</ul>`,
        )}
        ${Reveal(
          `<div class="surface-card  overflow-hidden p-0">
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

  document.getElementById("secciones").outerHTML = About() + Speakers() + Agenda() + Registration() + Faq() + Location()

  // ── Navbar.tsx ───────────────────────────────────────────────

  let active = ""
  const navDesktop = document.getElementById("nav-desktop")
  function renderNavDesktop() {
    navDesktop.innerHTML =
      navLinks.map((item) => `<a href="${item.href}" class="nav-link rounded-lg ${active === item.id ? "nav-link-active text-leaf" : "text-ink/70"}">${item.label}</a>`).join("") +
      `<button type="button" class="nav-desktop-cta btn-primary btn-hint ml-3" data-inscription>Inscríbete ahora${icon("ArrowUpRight", { size: 16, cls: "btn-hint__icon" })}</button>`
  }
  renderNavDesktop()
  hydrateIcons()

  // ── FluidMorphBg.tsx: siete capas que cambian de forma (motion animate d) ──

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
  document.getElementById("fluid-bg").innerHTML = `<svg class="absolute inset-0 h-full w-full object-cover" preserveAspectRatio="none" viewBox="0 0 1440 800" aria-hidden="true">${pathsData
    .map(([a, b], index) => {
      const dur = 18 + (index % 3) * 0.5
      const delay = (index % 4) * 0.2
      const anim = reduceMotion
        ? ""
        : `<animate attributeName="d" values="${a};${b};${a}" dur="${dur * 2}s" begin="${delay}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;0.5;1" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"/>`
      return `<path d="${a}" fill="${colors[index % colors.length]}" opacity="0.78">${anim}</path>`
    })
    .join("")}</svg>`

  // ── HeroFade: entrada escalonada del hero ────────────────────

  document.querySelectorAll("[data-hero]").forEach((el) => {
    const delay = reduceMotion ? 0 : Number(el.dataset.hero) * 60
    el.style.transition = `opacity ${reduceMotion ? "350ms ease-out" : `400ms ${EASE}`} ${delay}ms, transform 400ms ${EASE} ${delay}ms`
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.opacity = "1"
        el.style.transform = "none"
      }),
    )
  })

  // ── useHeaderOffset ──────────────────────────────────────────

  const header = document.getElementById("site-header")
  const setOffset = () => document.documentElement.style.setProperty("--header-offset", `${header.offsetHeight}px`)
  setOffset()
  window.addEventListener("resize", setOffset, { passive: true })
  if ("ResizeObserver" in window) new ResizeObserver(setOffset).observe(header)

  // ── useActiveSection ─────────────────────────────────────────

  const sections = navLinks.map((l) => document.getElementById(l.id)).filter(Boolean)
  let raf = 0
  function updateActive() {
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      const offset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-offset"))
      const line = (Number.isFinite(offset) && offset > 0 ? offset : 72) + 20
      let current = ""
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.id
      if (current !== active) {
        active = current
        renderNavDesktop()
        renderNavMobile()
      }
    })
  }
  updateActive()
  window.addEventListener("scroll", updateActive, { passive: true })
  window.addEventListener("resize", updateActive, { passive: true })

  // ── Reveal: whileInView, una sola vez ────────────────────────

  const reveals = document.querySelectorAll("[data-reveal]")
  const mostrar = (el) => {
    const delay = Number(el.dataset.reveal)
    el.style.transition = reduceMotion ? `opacity 280ms ease-out ${delay}ms` : `opacity 400ms ${EASE} ${delay}ms, transform 400ms ${EASE} ${delay}ms`
    el.style.opacity = "1"
    el.style.transform = "none"
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            mostrar(e.target)
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    )
    reveals.forEach((el) => io.observe(el))
  } else reveals.forEach(mostrar)

  // ── MobileNavSheet.tsx: hoja inferior que se arrastra para cerrar ──

  const menuBtn = document.getElementById("nav-menu-btn")
  const sheetRoot = document.getElementById("mobile-nav-root")
  let navOpen = false

  function renderNavMobile() {
    const grupo = sheetRoot.querySelector(".mobile-nav-group")
    if (!grupo) return
    grupo.querySelectorAll("a").forEach((a) => {
      a.className = `mobile-nav-link ${a.dataset.id === active ? "mobile-nav-link-active" : ""}`
    })
  }

  function setNav(open) {
    if (open === navOpen) return
    navOpen = open
    menuBtn.setAttribute("aria-expanded", String(open))
    menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú")
    menuBtn.innerHTML = icon(open ? "X" : "Menu", { size: 18 })
    document.body.style.overflow = open ? "hidden" : ""
    if (open) {
      sheetRoot.innerHTML = `
        <button type="button" aria-label="Cerrar menú" class="mobile-nav-scrim fixed inset-0 z-40 lg:hidden" style="opacity: 0" data-scrim></button>
        <div id="mobile-nav" role="dialog" aria-modal="true" aria-label="Navegación móvil" class="mobile-nav-sheet fixed inset-x-0 bottom-0 z-[45] flex w-full max-h-[min(88dvh,calc(100dvh-0.5rem))] flex-col overflow-hidden lg:hidden" style="transform: translateY(${innerHeight}px)">
          <div class="mobile-nav-grab flex shrink-0 cursor-grab justify-center pt-2.5 pb-2 active:cursor-grabbing" aria-hidden="true"><div class="h-1 w-10 rounded-full bg-slate-300/90"></div></div>
          <div class="mobile-nav-body overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <nav aria-label="Móvil">
              <div class="mobile-nav-group">${navLinks
                .map(
                  (item, index) =>
                    `<a href="${item.href}" data-id="${item.id}" data-close-nav class="mobile-nav-link ${active === item.id ? "mobile-nav-link-active" : ""}" style="opacity: 0; transform: translateY(6px); transition: opacity 350ms ${EASE} ${index * 30}ms, transform 350ms ${EASE} ${index * 30}ms">${item.label}</a>`,
                )
                .join("")}</div>
              <div class="mobile-nav-footer"><button type="button" class="btn-primary w-full" data-inscription data-close-nav>Inscríbete ahora</button></div>
            </nav>
          </div>
        </div>`
      const scrim = sheetRoot.querySelector("[data-scrim]")
      const sheet = sheetRoot.querySelector("#mobile-nav")
      sheet.getBoundingClientRect()
      sheet.style.transition = `transform 350ms ${EASE}`
      scrim.style.transition = `opacity 350ms ${EASE}`
      sheet.style.transform = "translateY(0px)"
      scrim.style.opacity = "1"
      sheet.querySelectorAll(".mobile-nav-link").forEach((a) => {
        a.style.opacity = "1"
        a.style.transform = "none"
      })
      activarArrastre(sheet, scrim)
    } else {
      const scrim = sheetRoot.querySelector("[data-scrim]")
      const sheet = sheetRoot.querySelector("#mobile-nav")
      if (!sheet) return
      sheet.style.transition = `transform 320ms cubic-bezier(0.34, 1.2, 0.64, 1)`
      scrim.style.transition = `opacity 320ms ${EASE}`
      sheet.style.transform = `translateY(${innerHeight}px)`
      scrim.style.opacity = "0"
      setTimeout(() => {
        if (!navOpen) sheetRoot.innerHTML = ""
      }, 340)
    }
  }
  window.closeMobileNav = () => setNav(false)

  function activarArrastre(sheet, scrim) {
    sheet.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || reduceMotion) return
      const startY = e.clientY
      const samples = [{ y: startY, t: e.timeStamp }]
      let dragging = false
      let delta = 0
      const onMove = (ev) => {
        delta = ev.clientY - startY
        samples.push({ y: ev.clientY, t: ev.timeStamp })
        if (samples.length > 6) samples.shift()
        if (!dragging) {
          if (Math.abs(delta) < 10) return
          dragging = true
          sheet.style.transition = "none"
        }
        const h = innerHeight
        const y = delta < 0 ? -((-delta * h * 0.55) / (h + 0.55 * -delta)) : delta
        sheet.style.transform = `translateY(${y}px)`
        scrim.style.opacity = String(Math.min(1, Math.max(0, 1 - y / h)))
      }
      const finish = () => {
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", finish)
        window.removeEventListener("pointercancel", finish)
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
          sheet.style.transition = `transform 350ms ${EASE}`
          scrim.style.transition = `opacity 350ms ${EASE}`
          sheet.style.transform = "translateY(0px)"
          scrim.style.opacity = "1"
        }
      }
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", finish)
      window.addEventListener("pointercancel", finish)
    })
  }

  menuBtn.addEventListener("click", () => setNav(!navOpen))
  sheetRoot.addEventListener("click", (e) => {
    if (e.target.closest("[data-scrim]")) setNav(false)
  })
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-nav]")) setNav(false)
  })
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navOpen) setNav(false)
  })

  // ── Faq: una pregunta abierta a la vez, con altura animada ───

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-faq]")
    if (!btn) return
    const index = Number(btn.dataset.faq)
    const lista = btn.closest(".faq-list")
    const anterior = faqAbierta
    faqAbierta = anterior === index ? null : index

    const cerrar = (i) => {
      const li = lista.children[i]
      const panel = li && li.querySelector(`#faq-${i}`)
      const b = li && li.querySelector("[data-faq]")
      if (!panel) return
      b.setAttribute("aria-expanded", "false")
      b.querySelector(".faq-item__icon").style.transform = "none"
      panel.style.height = `${panel.offsetHeight}px`
      panel.getBoundingClientRect()
      panel.style.transition = `height 350ms ${EASE}, opacity 350ms ${EASE}`
      panel.style.height = "0px"
      panel.style.opacity = "0"
      setTimeout(() => panel.remove(), 360)
    }

    if (anterior !== null) cerrar(anterior)
    if (faqAbierta !== null) {
      const li = lista.children[faqAbierta]
      const b = li.querySelector("[data-faq]")
      b.setAttribute("aria-expanded", "true")
      const iconEl = b.querySelector(".faq-item__icon")
      iconEl.style.transition = reduceMotion ? "" : `transform 350ms ${EASE}`
      iconEl.style.transform = "rotate(45deg)"
      li.insertAdjacentHTML("beforeend", `<div id="faq-${faqAbierta}" class="overflow-hidden" style="height: 0px; opacity: 0"><p class="faq-item__a text-body">${esc(faqs[faqAbierta].a)}</p></div>`)
      const panel = li.lastElementChild
      const alto = panel.scrollHeight
      panel.style.transition = `height 350ms ${EASE}, opacity 350ms ${EASE}`
      requestAnimationFrame(() => {
        panel.style.height = `${alto}px`
        panel.style.opacity = "1"
      })
      setTimeout(() => {
        if (panel.isConnected) {
          panel.style.transition = ""
          panel.style.height = "auto"
        }
      }, 360)
    }
  })

  // ── BackToTop.tsx ────────────────────────────────────────────

  const topRoot = document.getElementById("back-to-top-root")
  let topVisible = false
  function onScrollTop() {
    const visible = window.scrollY > 720
    if (visible === topVisible) return
    topVisible = visible
    if (visible) {
      topRoot.innerHTML = `<button type="button" aria-label="Volver arriba" class="back-to-top material-chip fixed z-40 flex items-center justify-center rounded-full text-leaf" style="opacity: 0; transform: scale(0.6); filter: blur(6px)">${icon("ArrowUp", { size: 16 })}</button>`
      const b = topRoot.firstElementChild
      b.getBoundingClientRect()
      b.style.transition = `opacity 350ms ${EASE}, transform 350ms ${EASE}, filter 350ms ${EASE}`
      b.style.opacity = "1"
      b.style.transform = "none"
      b.style.filter = "blur(0px)"
      b.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }))
    } else {
      const b = topRoot.firstElementChild
      if (!b) return
      b.style.opacity = "0"
      b.style.transform = "scale(0.6)"
      b.style.filter = "blur(6px)"
      setTimeout(() => {
        if (!topVisible) topRoot.innerHTML = ""
      }, 360)
    }
  }
  onScrollTop()
  window.addEventListener("scroll", onScrollTop, { passive: true })
})()
