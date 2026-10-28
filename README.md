# Prototipo · Ciclo de Conferencias FIIS 2026

Prototipo funcional de [conferenciasfiis.cloud](https://conferenciasfiis.cloud/) en HTML, CSS y JavaScript puros. Es la base visual y de comportamiento del sistema real (repo `Conferencias-FIIS`, rama `develop`): mismo marcado, mismas clases y mismo CSS compilado, comparado píxel a píxel contra producción.

## Cómo abrirlo

Abre `index.html` en el navegador (doble clic), o sírvelo con cualquier servidor estático:

```bash
npx serve .        # o: python -m http.server
```

| Página | Archivo |
|---|---|
| Sitio público | `index.html` |
| Ingreso del panel (`/admin`) | `admin/index.html` |
| Panel interno | `admin/panel.html#/panel` |

## Cuentas de prueba

Contraseña de todas: `Fiis2026!`

| Rol | Correo |
|---|---|
| Administrador | admin@fiis.test |
| Registrador | registrador@fiis.test |
| Asistencia | asistencia@fiis.test |
| Certificación | certificacion@fiis.test |

Tras 5 contraseñas incorrectas la cuenta se bloquea, como en el backend. El Administrador la restablece desde **Usuarios y roles**. Los usuarios y la sesión se guardan en el navegador (localStorage); para volver al estado inicial, borra los datos del sitio.

## Datos

Igual que producción, el panel arranca sin actividades, inscritos, pagos ni documentos (Reportes en 0). Para ver los 150 participantes del seeder (`ReportesTestDataSeeder`), abre el panel con `?datos=prueba`, por ejemplo `admin/panel.html?datos=prueba#/reportes`.

## Estructura

```text
index.html              sitio público (page.tsx, Navbar, Hero, Footer)
admin/index.html        login (admin/page.tsx + AdminLogin.tsx)
admin/panel.html        panel (PanelShell.tsx; rutas #/panel, #/reportes, #/usuarios, …)
assets/css/app.css      CSS compilado (no editar: se genera con tools/css)
assets/css/fonts.css    IBM Plex, mismos archivos que sirve producción (assets/fonts/)
assets/img/             logo optimizado como next/image (48, 64 y 96 px)
assets/js/
  data.js               textos del sitio (content.ts)
  landing.js            secciones del sitio público y animaciones
  inscription.js        formulario de inscripción en 3 pasos (InscriptionModal.tsx)
  auth.js               backend simulado: login, sesión, usuarios y roles
  panel.js              menú por rol, rutas, Inicio y pantallas por implementar
  usuarios.js           Usuarios y roles (RolesGrid, TablaUsuarios, ModalUsuario)
  reportes-data.js      datos de reportes (vacíos; ?datos=prueba carga el seeder)
  reportes.js           Reportes y estadísticas (ReportesDashboard.tsx)
  icons.js              íconos de lucide-react 1.54.0
tools/css/              compilación de app.css (no se publica)
```

## Cómo se mantiene idéntico al sistema real

- Las plantillas usan **los mismos `className`** que el JSX original. Al copiar una pantalla nueva, copia sus clases tal cual.
- `app.css` se compila con **el mismo Tailwind (4.3.3)** y copias de `globals.css` y `conference.css` del proyecto real. Si cambian, cópialas a `tools/css/` (en `globals.css`, sin la primera línea `@import "tailwindcss";`) y recompila:

  ```bash
  cd tools/css
  npm install
  npm run build
  ```

- Donde React separa nodos de texto (`{valor} texto`), las plantillas ponen `<!---->` para que el texto se dibuje igual.
- Tras cambiar CSS o JS, sube el número `?v=` de los enlaces en los tres HTML para que el navegador no use la versión en caché.
