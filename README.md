# Lonely Runner Conjecture — Interactive Visualization

An interactive tool that visualizes the [Lonely Runner Conjecture](https://en.wikipedia.org/wiki/Lonely_runner_conjecture) through animated runners moving on a circular track at different speeds.

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-cyan)

## What is the Lonely Runner Conjecture?

The conjecture states that if *n* runners start at the same point on a circular track and run at distinct constant speeds, then each runner will eventually be **"lonely"** — at some moment, their closest neighbor is at least 1/*n* of the track away.

This has been **proven for n ≤ 7** runners but remains an open problem for n ≥ 8.

## Features

- **Real-time animation** of 2–8 runners on a circular track at 60 fps
- **Loneliness detection** with visual highlighting when a runner becomes lonely
- **Preset configurations** — classic cases (primes, Fibonacci, harmonic series, etc.)
- **Speed controls** — per-runner sliders from −10× to +10×
- **Statistics** — track lonely time per runner and collectively
- **Randomize** speeds to explore new configurations
- **Responsive** — works on desktop and mobile

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Deploying to GitHub Pages

This repo includes a GitHub Actions workflow that automatically builds and deploys to GitHub Pages on every push to `main`.

1. Push to your GitHub repo
2. Go to **Settings → Pages**
3. Under **Source**, select **GitHub Actions**
4. The next push to `main` will trigger a deploy

Your site will be available at `https://sn2b.github.io/lonely-runner-visual/`.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/) primitives (slider, select, separator)
- [Phosphor Icons](https://phosphoricons.com/)

## License

[MIT](LICENSE)
