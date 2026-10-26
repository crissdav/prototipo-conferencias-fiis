/**
 * Contenido del Ciclo de Conferencias FIIS 2026 (copia de frontend/src/data/content.ts).
 */
window.FIIS = {
  event: {
    name: "Ciclo de Conferencias FIIS 2026",
    shortName: "Conferencias FIIS",
    tagline: "Tecnología, innovación y talento digital desde la Amazonía",
    datesLabel: "25 y 26 de noviembre de 2026",
    venue: "Facultad de Ingeniería en Informática y Sistemas — UNAS",
    city: "Tingo María, Huánuco",
  },

  links: {
    inscripcion: "#inscripcion",
    fiis: "https://fiis.unas.edu.pe/",
    unas: "https://www.unas.edu.pe/",
    email: "fiis@unas.edu.pe",
    phone: "062-561009",
    mapsOpen: "https://maps.app.goo.gl/NRZYuDWGh8nMfxgUA",
    maps: "https://maps.google.com/maps?q=-9.3139774,-75.9955033&hl=es&z=17&output=embed",
  },

  highlights: [
    { value: "2", label: "días de conferencias" },
    { value: "12", label: "ponencias y talleres" },
    { value: "100%", label: "certificado digital verificable" },
  ],

  pillars: [
    { icon: "Mic", title: "Conferencias magistrales", text: "Ponentes de la industria y la academia comparten experiencias reales sobre tecnología aplicada." },
    { icon: "Laptop", title: "Talleres prácticos", text: "Sesiones hands-on para llevarte habilidades concretas: nube, desarrollo, datos y seguridad." },
    { icon: "Users", title: "Networking", text: "Conecta con estudiantes, docentes, egresados y profesionales del sector TI de la región." },
    { icon: "BadgeCheck", title: "Certificación", text: "Certificado digital con código de validación en línea para quienes cumplan la asistencia." },
  ],

  speakers: [
    { name: "Ing. Einstein Ortiz Morales", org: "Día 1 · 09:00", topic: "Título por confirmar", confirmed: true },
    { name: "Ing. Abel Silva Trujillo", org: "Día 1 · 10:00", topic: "Título por confirmar", confirmed: true },
    { name: "Mg. Julio Gonzales Paico", org: "Día 1 · 11:15", topic: "Título por confirmar", confirmed: true },
    { name: "José Antonio Cárdenas Vega", org: "Día 2 · 09:00", topic: "Título por confirmar", confirmed: true },
    { name: "Msc. Darwin E. Guerrero", org: "Día 2 · 10:00", topic: "Título por confirmar", confirmed: true },
    { name: "Incuba UNAS", org: "Día 2 · 11:15", topic: "Procesamiento de imágenes y video con IA", confirmed: true },
  ],

  agenda: [
    {
      id: "dia-1",
      day: "Día 1",
      date: "Miércoles 25 de noviembre",
      items: [
        { time: "08:00", title: "Acreditación y entrega de credenciales", kind: "general" },
        { time: "08:30", title: "Inauguración del ciclo de conferencias", kind: "general", speaker: "Decanatura FIIS" },
        { time: "09:00", title: "Ponencia 1: Título por confirmar", kind: "conferencia", speaker: "Ing. Einstein Ortiz Morales" },
        { time: "10:00", title: "Ponencia 2: Título por confirmar", kind: "conferencia", speaker: "Ing. Abel Silva Trujillo" },
        { time: "11:00", title: "Break, sorteo de premios y publicidad de auspiciadores", kind: "general" },
        { time: "11:15", title: "Ponencia 3: Título por confirmar", kind: "conferencia", speaker: "Mg. Julio Gonzales Paico" },
        { time: "12:15", title: "Receso", kind: "general" },
        { id: "d1-t1", time: "16:00", title: "Taller 1: Título por confirmar", kind: "taller", speaker: "Mg. Abraham Ríos Rivera", location: "Laboratorio de Simulación", capacity: 20, enrolled: 14 },
        { id: "d1-t2", time: "16:00", title: "Taller 2: Título por confirmar", kind: "taller", speaker: "Mg. Alberto Acevedo", location: "Laboratorio de Ingeniería de Software", capacity: 20, enrolled: 18 },
        { id: "d1-t3", time: "16:00", title: "Taller 3: Título por confirmar", kind: "taller", speaker: "Mg. Juan Ramos Estela", location: "Laboratorio de Multipropósito", capacity: 25, enrolled: 11 },
      ],
    },
    {
      id: "dia-2",
      day: "Día 2",
      date: "Jueves 26 de noviembre",
      items: [
        { time: "08:30", title: "Registro de asistencia", kind: "general" },
        { time: "09:00", title: "Ponencia 1: Título por confirmar", kind: "conferencia", speaker: "José Antonio Cárdenas Vega" },
        { time: "10:00", title: "Ponencia 2: Título por confirmar", kind: "conferencia", speaker: "Msc. Darwin E. Guerrero" },
        { time: "11:00", title: "Break, sorteo de premios y publicidad de auspiciadores", kind: "general" },
        { time: "11:15", title: "Ponencia 3: Procesamiento de imágenes y video con IA", kind: "conferencia", speaker: "Incuba UNAS" },
        { time: "12:15", title: "Receso", kind: "general" },
        { id: "d2-t1", time: "16:00", title: "Taller 1: Título por confirmar", kind: "taller", speaker: "Mg. Jimmy Loloy Laurencio / José Castillo", location: "Laboratorio de Ingeniería de Software", capacity: 25, enrolled: 20 },
        { id: "d2-t2", time: "15:00", title: "Taller 2: Título por confirmar", kind: "taller", speaker: "Ing. Max D. Condor", location: "Laboratorio de Simulación", capacity: 25, enrolled: 23 },
        { id: "d2-t3", time: "16:00", title: "Taller 3: Título por confirmar", kind: "taller", speaker: "Mg. Jorge Jara Linares", location: "Laboratorio de Multipropósito", capacity: 20, enrolled: 8 },
        { time: "17:00", title: "Clausura y sorteos", kind: "general" },
      ],
    },
  ],

  registrationSteps: [
    { icon: "UserPlus", title: "Regístrate", text: "Crea tu cuenta en la plataforma con tu DNI y correo, y elige si te inscribes como estudiante o público general." },
    { icon: "CreditCard", title: "Realiza el pago", text: "Paga en línea desde la plataforma y sube tu comprobante si corresponde. Recibirás la confirmación por correo." },
    { icon: "QrCode", title: "Asiste con tu QR", text: "Presenta tu código QR en la entrada de cada jornada para registrar tu asistencia en segundos." },
    { icon: "Award", title: "Descarga tu certificado", text: "Al cumplir la asistencia mínima, descarga tu certificado digital con código de validación." },
  ],

  unasCareers: [
    "Administración",
    "Agronomía",
    "Contabilidad",
    "Economía",
    "Ingeniería Ambiental",
    "Ingeniería Civil",
    "Ingeniería en Ciberseguridad",
    "Ingeniería en Conservación de Suelos y Agua",
    "Ingeniería en Industrias Alimentarias",
    "Ingeniería en Informática y Sistemas",
    "Ingeniería en Recursos Naturales Renovables",
    "Ingeniería Forestal",
    "Ingeniería Mecánica Eléctrica",
    "Turismo y Hotelería",
    "Zootecnia",
  ],

  tickets: [
    {
      name: "Estudiante",
      prices: { conferencia: "Por definir", taller: "Por definir" },
      note: "De la UNAS o de cualquier universidad · registra tu código universitario",
      features: ["Acceso a conferencias", "Acceso a talleres (según aforo)", "Certificado digital"],
      featured: true,
    },
    {
      name: "Público general",
      prices: { conferencia: "Por definir", taller: "Por definir" },
      note: "Egresados, profesionales y público en general",
      features: ["Acceso a conferencias", "Acceso a talleres (según aforo)", "Certificado digital"],
      featured: false,
    },
  ],

  faqs: [
    { q: "¿El evento es presencial?", a: "Sí. Las conferencias y talleres se desarrollan en la Facultad de Ingeniería en Informática y Sistemas, campus principal de la UNAS en Tingo María." },
    { q: "¿Cómo registro mi asistencia?", a: "Al inscribirte recibirás un código QR personal. Muéstralo en el punto de control al ingresar a cada jornada; no necesitas imprimirlo." },
    { q: "¿Cuándo recibo el certificado?", a: "Una vez cerrado el evento y validada tu asistencia mínima, el certificado estará disponible para descarga en la plataforma. Cualquier persona puede verificar su autenticidad con el código impreso." },
    { q: "¿Necesito llevar laptop a los talleres?", a: "Se recomienda. Los requisitos específicos de cada taller se publicarán en el programa y se enviarán por correo a los inscritos." },
    { q: "¿Puedo inscribirme el mismo día?", a: "Sujeto a aforo. Te recomendamos inscribirte con anticipación para asegurar tu cupo en los talleres." },
  ],
}
