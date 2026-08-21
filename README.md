# 💰 GastFin - Sistema Inteligente de Gestión Financiera & Costos

GastFin es una aplicación web moderna de finanzas personales y gestión de costos empresariales/personales, diseñada para registrar ingresos, egresos, amortización de deudas (Avalancha/Bola de Nieve), metas de ahorro y simuladores financieros en tiempo real.

---

## 🚀 Despliegue en GitHub Pages (Acceso Remoto Gratuito)

Este repositorio incluye un flujo automatizado de **GitHub Actions** (`.github/workflows/deploy.yml`) que compila y publica la aplicación automáticamente en GitHub Pages cada vez que subes cambios a la rama `main` o `master`.

### Pasos para subir a tu GitHub:

1. **Crea un repositorio en GitHub**:
   - Ingresa a [github.com/new](https://github.com/new).
   - Nómbralo por ejemplo: `sistema-de-costos` o `gastfin`.
   - Deja el repositorio como **Público** (o Privado con GitHub Pro).
   - **No** inicialices con README (para subir el código local directamente).

2. **Sube tu código desde la terminal**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GastFin App"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/sistema-de-costos.git
   git push -u origin main
   ```

3. **Activar GitHub Pages**:
   - En tu repositorio de GitHub, ve a **Settings** > **Pages** (en el menú lateral izquierdo).
   - En **Build and deployment** > **Source**, selecciona: **`GitHub Actions`**.
   - ¡Listo! En 1-2 minutos tu web estará disponible en:
     `https://TU-USUARIO.github.io/sistema-de-costos/`

---

## ⚡ Alternativas de Despliegue en 1 Clic (Vercel / Netlify)

- **Vercel**: Importa tu repositorio en [vercel.com](https://vercel.com) y se desplegará instantáneamente en `https://tu-app.vercel.app`.
- **Netlify**: Arrastra la carpeta `dist/` a [app.netlify.com/drop](https://app.netlify.com/drop) para tener una URL remota en 5 segundos sin configurar nada.

---

## 🛠️ Tecnologías Utilizadas
- **React 18** + **TypeScript**
- **Vite 6** (Compilador de alto rendimiento)
- **Tailwind CSS** (Diseño moderno dark-mode)
- **Lucide Icons**
- **Recharts** (Gráficos analíticos)
- **Canvas Confetti** (Feedback interactivo)
- **LocalStorage** (Persistencia de datos 100% en el dispositivo del usuario)
