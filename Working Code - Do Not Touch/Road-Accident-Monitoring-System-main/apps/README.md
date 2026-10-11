# RAMS Modern Applications Ecosystem Hub

This directory serves as the centralized access hub for the **V2 Modern Software Applications** of the Road Accident Monitoring System:

---

## 📱 [Mobile Android App (Rider Node)](../android_app/)
- **Path**: `../android_app/`
- **Description**: Full native Kotlin Jetpack Compose Android app utilizing the smartphone's calibrated 100Hz IMU, dual-band GPS, and live WebSocket telemetry streaming to the ESP32 wearable.
- **One-Click Deploy**: Run `Build_And_Install_Android_App.bat` in this folder (or `../android_app/build_and_install.bat`).

---

## 🖥️ [Desktop Rescuer App (Operations Station)](../desktop_app/)
- **Path**: `../desktop_app/`
- **Description**: Standalone Windows desktop executable (`RAMS_Rescuer_Desktop.exe`) featuring an embedded offline HTTP server, direct LoRa receiver ingestion API, and chromeless Edge App window.
- **One-Click Launch**: Run `Launch_Desktop_Rescuer.bat` in this folder (or `../desktop_app/launch_desktop.bat`).

---

## ⚡ Quick Launch Scripts

- **`Launch_Desktop_Rescuer.bat`**: Launches the desktop rescuer command center (`RAMS_Rescuer_Desktop.exe`).
- **`Build_And_Install_Android_App.bat`**: Compiles the debug APK and installs directly to your USB-connected Android smartphone via ADB.
- **`Preview_Mobile_App_Web.bat`**: Instantly hosts the local preview server and launches the interactive mobile app showcase in your browser (like AI Studio).
