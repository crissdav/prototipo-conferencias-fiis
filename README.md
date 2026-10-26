# Prototipo · Ciclo de Conferencias FIIS 2026

Prototipo funcional de [conferenciasfiis.cloud](https://conferenciasfiis.cloud/) en HTML, CSS y JavaScript puros, sin dependencias ni compilación.

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

Tras 5 contraseñas incorrectas la cuenta se bloquea, como en el backend. Para desbloquearla, borra los datos del sitio en el navegador (localStorage).

## Estructura

```text
index.html              sitio público
admin/index.html        login
admin/panel.html        panel (rutas con #/panel, #/reportes, #/usuarios, …)
assets/css/             base.css · site.css · admin.css
assets/js/
  data.js               textos del sitio (content.ts)
  landing.js            secciones, menú, animaciones
  inscription.js        formulario de inscripción en 3 pasos
  auth.js               sesión y cuentas simuladas
  panel.js              menú por rol, rutas y pantallas
  reportes-data.js      datos de prueba (mismo algoritmo que ReportesTestDataSeeder)
  reportes.js           dashboard de reportes, filtros, exportar CSV e imprimir
  icons.js              iconos Lucide en SVG
```
