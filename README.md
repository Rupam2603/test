# SubhOne Health Group - Cross Platform App

Complete source code for the SubhOne Health Group cross-platform application.

## 📱 Project Structure

```
SubhOne_CrossPlatform_Source/
│
├── app/                          # Android Native App
│   ├── build.gradle.kts
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/subhone/healthgroup/
│       │   └── MainActivity.kt
│       └── res/
│           ├── values/
│           │   ├── colors.xml
│           │   ├── strings.xml
│           │   └── themes.xml
│           └── xml/
│               ├── file_paths.xml
│               └── network_security_config.xml
│
├── web/                          # React/Vite Website
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── public/
│   └── api/
│
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
└── README.md
```

## 🚀 Getting Started

### Android App

1. **Open in Android Studio**
   - Open Android Studio
   - Select "Open an existing project"
   - Navigate to the `SubhOne_CrossPlatform_Source` folder

2. **Sync Gradle**
   - Wait for Gradle sync to complete

3. **Configure Website URL**
   - Open `app/src/main/java/com/subhone/healthgroup/MainActivity.kt`
   - Modify the `websiteUrl` variable

4. **Build APK**
   - `Build > Build Bundle(s) / APK(s) > Build APK(s)`

### Web Application

1. **Install dependencies**
   ```bash
   cd web
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## ✨ Features

- ✅ WebView-based native app
- ✅ JavaScript enabled with DOM storage
- ✅ File upload support
- ✅ Geolocation permissions
- ✅ Camera access
- ✅ External link handling
- ✅ Back navigation support

## 📄 License

Proprietary software for SubhOne Health Group.

---

**Built with ❤️ for SubhOne Health Group**
