# 🌌 VOIDPORT

> An interactive 3D futuristic cyber-metropolis exploration experience built with **Three.js**, **Web Audio API**, and procedural real-time world generation.

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-black?style=for-the-badge&logo=vercel)](https://voidport-seven.vercel.app)
[![Three.js](https://img.shields.io/badge/Three.js-r187-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

🔗 **Live Deployment:** [https://voidport-seven.vercel.app](https://voidport-seven.vercel.app)

---

## 🏙️ Overview

**VOIDPORT** drops you into a dormant, atmospheric megacity organized around a central power core and four colossal technological monoliths. Through cinematic camera choreography, dynamic soundscapes, an integrated sci-fi AI narrator, and sequential puzzle-solving, players reactivate the city sector by sector leading to a cinematic restoration finale.

---

## ✨ Features

### 🏛️ The Four Architectural Towers
The city layout features four primary sectors connected by illuminated arterial highways:
- **🗼 The Signal Tower (North):** Broadcast beacon and communication array with frequency re-alignment puzzle.
- **⚡ The Reactor (East):** High-energy power plant wrapped in cyan-teal reactor rings and conduit grids.
- **💾 The Archive (South):** Monolithic quantum data bank with fragment reconstruction puzzle.
- **🌐 The Nexus (West):** Multi-tiered network core adorned with indigo and turquoise energy rings.

### 🎮 Gameplay & Exploration
- **Guided Narrative Sequence:** Walk seamlessly from the central core to each tower via ground-level locomotion with natural camera sway.
- **Interactive Terminal Puzzles:** Custom UI minigames to restore power to each sector:
  - *Frequency Calibration* (Signal Tower)
  - *Core Flow Alignment* (Reactor)
  - *Data Fragment Sequencing* (Archive)
  - *Network Handshake Synchronization* (Nexus)
- **Grand Finale:** A cinematic 5-stage citywide restoration sequence upon reactivating all four towers, igniting the elevated transit loop, energy grids, and central crystal beam.

### 🚊 Living Cyber-Metropolis
- **Elevated Maglev Transit:** Continuous 3-car maglev train looping on a 160m elevated orbital track with neon glow trails.
- **Atmospheric Starfield & Sky Dome:** Custom deep-space gradient dome with 2,800 tinted stars and horizon haze.
- **Cyberpunk Urban Details:** Parked aerocars, illuminated storefronts, holographic road markings, and wet reflective asphalt.

### 🎙️ Audio & Narration
- **Sci-Fi Voice Narrator:** SpeechSynthesis integration with responsive subtitles guiding objectives and lore.
- **Futuristic Ambient Soundtrack:** Integrated audio player with dedicated volume balancing and independent audio/voice controls.

---

## 🕹️ Controls

| Action | Control |
| :--- | :--- |
| **Look Around / Orbit** | Left Click + Drag |
| **Pan Camera** | Right Click + Drag |
| **Zoom In / Out** | Mouse Wheel / Pinch |
| **Interact with Terminals** | Click on terminal markers / UI prompts |
| **Audio / Voice** | Dedicated controls in the top HUD |

---

## 🛠️ Tech Stack

- **3D Engine:** [Three.js](https://threejs.org/) (WebGL)
- **Animation & Tweens:** [GSAP](https://greensock.com/gsap/)
- **Bundler:** [Vite](https://vitejs.dev/)
- **Audio:** Web Audio API + HTML5 Audio + Web Speech Synthesis API
- **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suhitil76/VOIDPORT.git
   cd VOIDPORT
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
