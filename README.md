# SpotifyFiFi - Spotify Daten Analyzer

Eine moderne Web-Anwendung zur Analyse deiner Spotify-Daten mit einem schönen Discord/Spotify-Design.

## Features

- 🎵 **Moderne Benutzeroberfläche** im Discord/Spotify-Stil
- 📊 **Detaillierte Analyse** deiner Hörgewohnheiten
- 📅 **Intuitive Slider** für Zeitraumauswahl
- 🚀 **Schnelle Presets** (7 Tage, 30 Tage, 3 Monate, 1 Jahr)
- 📁 **Drag & Drop** Datei-Upload
- 📱 **Responsive Design** für alle Geräte

## Installation

1. **Repository klonen:**
   ```bash
   git clone <repository-url>
   cd spotiffifi
   ```

2. **Python-Abhängigkeiten installieren:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Anwendung starten:**
   ```bash
   python app.py
   ```

4. **Im Browser öffnen:**
   ```
   http://localhost:5000
   ```

## Verwendung

### 1. Spotify-Daten herunterladen
- Gehe zu [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
- Scrolle zu "Download your Data"
- Wähle nur "Extended Streaming history" aus
- Warte auf die E-Mail mit deinen Daten (kann bis zu 30 Tage dauern)

### 2. Daten analysieren
- Lade die JSON-Dateien aus dem ZIP-Archiv hoch
- Wähle einen Zeitraum mit dem Slider oder den Preset-Buttons
- Klicke auf "Analysieren"
- Erhalte detaillierte Einblicke in deine Hörgewohnheiten

## Technologien

- **Backend:** Python Flask
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Design:** Modern Discord/Spotify-Style mit blau-schwarzem Farbschema
- **Features:** Drag & Drop, Slider, Responsive Design

## Projektstruktur

```
spotiffifi/
├── app.py                 # Flask-Anwendung
├── requirements.txt       # Python-Abhängigkeiten
├── README.md             # Projekt-Dokumentation
├── templates/            # HTML-Templates
│   ├── index.html        # Hauptseite
│   └── spotify_analyzer.html  # Analyzer-Seite
├── static/               # Statische Dateien
│   ├── css/
│   │   └── style.css     # Haupt-Stylesheet
│   └── js/
│       ├── main.js       # Haupt-JavaScript
│       └── analyzer.js   # Analyzer-JavaScript
└── uploads/              # Upload-Verzeichnis (wird automatisch erstellt)
```

## Lizenz

Dieses Projekt basiert auf dem [Spotify Data Converter](https://github.com/Timo348/Spotify_Data_Converter) von Timo348.

## Support

Bei Fragen oder Problemen erstelle bitte ein Issue im Repository.
