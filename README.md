# Pokémon Trainer Application

Technical assessment solution for Front End Developer position at Banco Cuscatlán. Built with Angular 20, TypeScript, and the official PokéAPI.

---

## Overview

The application allows users to register a trainer profile, select a 3-member Pokémon team from the first generation (151 Pokémon), and view their team with interactive capabilities such as stat analysis, sound effects, and shiny variants.

### Key Functionality
- **Trainer Registration (`/new-user`)**: Profile picture upload with client-side preview, reactive form validations, Salvadoran DUI format validation with auto-hyphenation, and conditional requirements based on calculated age (adult vs. minor).
- **Team Selection (`/team-selection`)**: Search filter by name or ID, real-time selection validation, and persistence.
- **Trainer Profile (`/profile`)**: Summary view displaying trainer metadata, stat bars normalized to official Pokémon maximum values, audio cries, and 3-second temporary shiny mode.

---

## Technical Highlights & Bonus Features

- **Virtual Scroll (Bonus Feature 1)**: Integrated `@angular/cdk/scrolling` (`cdk-virtual-scroll-viewport`) to render the 151 Pokémon efficiently, dynamically adjusting column count and row height between desktop (3 columns) and mobile (2 columns).
- **Swiper Integration (Bonus Feature 2)**: Integrated Swiper Web Components to provide a touch-friendly carousel for Pokémon cards on mobile and tablet devices (`<= 960px`), while preserving a clean vertical list layout on desktop.
- **Docker Production Ready (Bonus Feature 3)**: Multi-stage `Dockerfile` using Node.js for building and a lightweight Nginx Alpine image for serving static assets with HTML5 client-side routing support.
- **Signals-First Architecture**: Utilizes Angular Signals (`signal`, `computed`, `toSignal`) and `ChangeDetectionStrategy.OnPush` across all standalone components for optimal performance and memory safety.

---

## Getting Started

### Prerequisites
- Node.js (version 20 or higher)
- pnpm (version 9 or higher recommended) or npm

### Installation & Local Execution

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd PokemonApp
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm start
   ```
   Navigate to `http://localhost:4200/`.

---

## Testing

The project includes an automated test suite executed with Karma and Jasmine in Chrome Headless:

```bash
pnpm test
```

Single execution without watch mode:
```bash
pnpm test -- --watch=false --browsers=ChromeHeadless
```

---

## Production & Docker Deployment

### Local Production Build
```bash
pnpm build
```
Compiled output will be generated in `dist/PokemonApp/browser`.

### Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t pokemon-app .
   ```

2. Start the container:
   ```bash
   docker run -d -p 8080:80 --name pokemon-app-container pokemon-app
   ```

3. Access the application at `http://localhost:8080/`.

---

## Project Structure

```text
src/
├── app/
│   ├── components/       # Reusable presentation components (Header, TrainerCard, etc.)
│   ├── pages/            # Route views: new-user, team-selection, profile
│   ├── services/         # State management (Signals) and API communication
│   ├── types/            # TypeScript data contracts and models
│   └── utils/            # Helper utilities (age calculation, formatters)
├── styles.scss           # Global typography and base CSS tokens
├── styles/               # Design tokens and responsive mixins
nginx.conf                # Nginx configuration with SPA routing and compression
Dockerfile                # Multi-stage production container definition
```
