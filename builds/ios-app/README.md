# GastFin Pro - Versión Móvil para iOS (iPhone & iPad)

Esta carpeta contiene el proyecto nativo completo de Xcode para compilar e instalar la aplicación en dispositivos **iPhone**, **iPad** o en el simulador de iOS.

---

## 🍎 Estructura del Proyecto iOS

- **`App/App.xcodeproj`**: Proyecto nativo de Xcode listo para abrir.
- **`App/App/public/`**: Código web React sincronizado.
- **`App/App/Info.plist`**: Configuración de permisos, orientaciones y metadatos de iOS.

---

## 🚀 Cómo Abrir y Compilar en Xcode

1. En tu Mac, haz doble clic en el archivo:
   👉 **`builds/ios-app/App/App.xcodeproj`** (o ejecuta `npx cap open ios`).
2. En Xcode:
   - Selecciona tu equipo de desarrollo en **Signing & Capabilities** (cuenta gratuita de Apple ID).
   - Elige tu iPhone conectado por cable o un Simulador de iOS (ej: iPhone 15 / 16).
3. Presiona el botón **Play (▶ / Cmd + R)** para compilar e instalar directamente en tu iPhone o iPad.

---

## 🔄 Sincronizar Cambios Web

Si realizas cambios en el diseño o código React:

```bash
npm run build:ios
```
