# 🎂 Interactive Birthday Surprise Greeting App

A polished, premium, full-stack Next.js (App Router) greeting card designed as a digital gift. The experience guides the recipient through a curated 5-stage interactive journey filled with memories, games, music, and highly compatible voice note greetings.

---

## 🚀 Live Production Demo

The application is deployed and running live on **Railway**:

- **Live Greeting Card:** [https://birthday-app-production-4ca5.up.railway.app/wish/pappa-70](https://birthday-app-production-4ca5.up.railway.app/wish/pappa-70)
- **Interactive Editor Panel:** [https://birthday-app-production-4ca5.up.railway.app/wish/pappa-70/edit](https://birthday-app-production-4ca5.up.railway.app/wish/pappa-70/edit) *(Passcode: `birthday2024`)*

---

## 🎭 The 5-Screen Magical Experience

1. **Magical Intro Landing Page:** A centered polaroid card featuring a dynamic rotating glow border, ambient background music, and a smooth slider unlock mechanism.
2. **Balloon Pop Interactive Game:** A playful mini-game requiring the user to pop floating balloons to unlock the next surprise.
3. **Cake Blowing Ceremony:** A virtual 3D-styled birthday cake with candles that can be blown out by physically blowing into the device microphone.
4. **Surprise Gift Box Reveal:** An interactive present box that unfolds a custom heartwarming message when tapped.
5. **Memory Polaroid Wall:** A beautiful scattered wall of polaroid photos with an interactive lightbox and a custom audio playlist.

---

## 🎛️ Special Audio DSP & Voice Notes Integration

This project implements a custom-engineered, browser-side Web Audio API digital signal processing (DSP) pipeline for high-fidelity voice greetings:

- **Browser MIME Type Negotiation:** Dynamically queries browser support using `MediaRecorder.isTypeSupported` to record native AAC files (`.m4a`) on iOS Safari and WebM files (`.webm`) on Chrome/Android.
- **Background Noise Reduction:** Real-time Biquad Filters strip low-frequency AC/fan rumble below `110Hz` and high-frequency hiss/static above `4000Hz`.
- **Dynamic Volume Boosting:** Built-in volume boost factor slider (adjustable from `1.0x` to `4.0x`) that multiplies the audio amplitude dynamically before upload, ensuring crystal-clear playback.
- **Passcode-Protected Management:** Includes secure voice note uploads and secure deletion API endpoints verified by the card's admin passcode.

---

## 🛠️ Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Production Build
```bash
npm run build
```

---

## ⚙️ Baseline Access PINs
- **Default Card PIN:** `birthday2024`
- **Pappa-70 Card PIN:** `birthday2024`
- **Hitesh4 Card PIN:** `123456`
