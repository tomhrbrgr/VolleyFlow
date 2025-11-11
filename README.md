# Volleyball Rotation App (Expo + TypeScript)

A clean 9‑person volleyball rotation visualizer with 6–2 / 5–1 modes, legality checks, and PNG/PDF export.

## Features
- 3×3 grid (zones **1–6** + off‑court **O1–O3**) with **drag & snap** player chips
- **Rotate ↻** button moves the full 9‑person ring clockwise (including off‑court)
- **Mode toggle** 6–2 ↔ 5–1 with **active setter** badge (**S***)
- **Legality check**: front/back and left/right overlap rules at serve
- **Roster editor**: set **name**, **jersey #**, and **primary role** for each player
- **Export** court as **PNG** or **PDF**
- **Theme**: red / light grey / black

## Quick Start

```bash
# 1) Create a fresh Expo project (if you don't already have one)
npx create-expo-app volleyball-rotation --template
cd volleyball-rotation

# 2) Install deps
npm i zustand react-native-view-shot pdf-lib expo-file-system expo-sharing

# 3) Replace the generated files with the contents of this zip
#    - Put App.tsx at project root
#    - Put src/ folder at project root

# 4) Run
npm run start
```

Open on your phone with **Expo Go** (scan the QR), or press **i** for iOS simulator.

## Notes
- Active setter: **6–2** chooses whichever setter is **back‑row**; **5–1** always uses **Setter1 (p1)**. ## 🖼️ Screenshot

![Court](screenshots/ChatGPT%20Image%20Nov%2010,%202025,%2008_33_25%20PM.png)

- Legality errors are outlined on chips and summarized in a banner.
- Export buttons will open your platform’s share sheet.## 🖼️ Screenshot

![Court Screenshot](screenshots/court.png)


