# 📈 Trading-Log

Application web de paper trading moderne, rapide et entièrement locale, conçue avec **Angular (Standalone Components)**, **Tailwind CSS** et **Dexie.js (IndexedDB)**. 

Le projet met l'accent sur la confidentialité des données (stockage client sans serveur tiers), la réactivité en temps réel grâce aux **Signals** d'Angular, et une compatibilité SSR (Server-Side Rendering) transparente.

---

## 🚀 Fonctionnalités principales

- **Tableau de bord dynamique (Dashboard) :** Suivi en temps réel des KPI clés (PnL net total, Win Rate, Profit Factor, nombre total de trades) piloté par les signaux natifs d'Angular (`signal` et `computed`).
- **Mode Incognito 🕶️ :** Masquage instantané des montants et statistiques sensibles d'un simple clic pour préserver la confidentialité.
- **Stockage Local & Persistant :** Utilisation d'IndexedDB via **Dexie.js** pour des performances optimales directement dans le navigateur.
- **Export & Import JSON :** Sauvegarde et restauration complète de la base de données intégrée via `dexie-export-import` avec chargement dynamique sécurisé.
- **Architecture SSR-Safe :** Encapsulation stricte des appels navigateur (`isPlatformBrowser`) pour éviter toute erreur d'exécution côté serveur (Node.js/Vite).

---

## 🛠️ Stack Technique

- **Framework :** Angular (v18+) avec composants autonomes (*Standalone Components*) et routage standard (HTML5 History API).
- **Style :** Tailwind CSS pour une interface utilisateur moderne et épurée (mode sombre par défaut).
- **Persistance :** Dexie.js (IndexedDB wrapper) & `dexie-export-import`.
- **Réactivité :** Angular Signals (`signal`, `computed`).
- **Langage :** TypeScript (typage strict).

---

## ⚙️ Installation et Lancement local

### Prérequis
- **Node.js** (recommandé v18 ou supérieur)
- **npm**