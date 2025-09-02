# AGENTS Instructions for Singaseong Numbers

## Project Overview
This repository hosts a lightweight static web app that generates random integers between a minimum and maximum value. The site is deployed to GitHub Pages via the workflow in `.github/workflows/deploy-pages.yml`.

## Development Guidelines
- Use vanilla HTML, CSS, and JavaScript; no framework or build tools.
- Indent with **2 spaces** across all file types.
- In JavaScript, end statements with semicolons and prefer `const`/`let` over `var`.
- Keep JavaScript wrapped in the existing IIFE pattern to avoid global variables.
- When adding assets (icons, manifest files, etc.), place them in the `src/` directory.
- Keep CSS class names descriptive and avoid utility frameworks.

## Testing
There are no automated tests or build steps. After making changes, manually open `index.html` in a modern browser and confirm that:
- Minimum/maximum inputs are accepted and swapped if min > max.
- The "Allow repeats" toggle behaves as expected.
- Generated numbers appear in the history list.
- The status line and error messages update correctly.

Pushing to the `main` branch will automatically deploy the site to GitHub Pages.
