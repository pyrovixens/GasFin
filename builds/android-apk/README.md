# GastFin Pro - Versión Móvil para Android (.apk)

Esta carpeta contiene el proyecto nativo completo de Android (Capacitor / Gradle) para compilar e instalar el archivo **`.apk`** en cualquier smartphone o tablet Android.

---

## 📱 Estructura del Proyecto Android

- **`app/src/main/assets/public/`**: Aplicación web compilada y sincronizada en tiempo real.
- **`app/src/main/AndroidManifest.xml`**: Manifiesto de Android con permisos y configuración de pantalla completa.
- **`build.gradle` / `settings.gradle`**: Configuración de compilación con Gradle.

---

## 🚀 Cómo Generar e Instalar el APK

### Opción 1: Compilar desde la terminal (Línea de comandos)
Asegúrate de tener Java JDK y Android SDK instalados, luego ejecuta dentro de esta carpeta:

```bash
# Compilar APK en modo Debug
./gradlew assembleDebug
```
El archivo `.apk` se generará en:
👉 `app/build/outputs/apk/debug/app-debug.apk`

---

### Opción 2: Abrir en Android Studio (Recomendada)
1. Abre **Android Studio**.
2. Selecciona **Open** y elige la carpeta `builds/android-apk`.
3. Conecta tu teléfono por cable USB o inicia un emulador.
4. Presiona el botón verde **Run (▶)** o ve a **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---

## 🔄 Sincronizar Cambios Web

Si realizas cambios en el diseño o código React:

```bash
npm run build:android
```
