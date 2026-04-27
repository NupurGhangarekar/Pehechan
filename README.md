# Pehchaan — AI Placement Intelligence Engine

> *"Apni pehchaan banao"*

An AI-powered placement readiness score for Tier 2/3 college students in India. Built as a mobile-first web prototype — no backend, no login required.

## 🚀 Features

- **Placement Score (0–100)** calculated from CV strength, interview readiness, and communication signals
- **Role-specific feedback** tailored to IT, BFSI, Marketing, and Core Engineering
- **Emotional intelligence** — dynamic messaging based on score range
- **Strength & Gap analysis** — instantly see your best and weakest areas
- **Smooth animations** — processing steps, score counter, and progress bars
- **Mobile-first design** — clean, minimal UI with purple accent

## 📱 Screens

1. **Landing Page** — Hero with CTA
2. **Input Form** — Name, target role, project description, interview answer
3. **Processing** — Animated loader with step-by-step progress
4. **Score Output** — Big score, breakdown bars, AI recommendations, emotional messaging
5. **Paywall** — Compelling upgrade prompt

## ⚙️ Scoring Logic

All scoring is computed in frontend JavaScript:

| Component | Weight | Factors |
|-----------|--------|---------|
| CV Score | 40% | Length, action words, numbers, role-keyword matching |
| Interview Score | 30% | Answer length tiers, structured word bonus |
| Communication Score | 30% | Sentence variety, vocabulary richness, clarity |

## 🛠️ Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Google Fonts (Inter)
- No frameworks, no dependencies, no backend

## 📦 Usage

Just open `index.html` in any browser. That's it.

## 📄 License

MIT
