# Thandup Sherpa — Developer Portfolio

A high-performance, dark-first professional developer portfolio website engineered with pure **HTML5**, **CSS3**, and **Vanilla JavaScript**. Designed with a modern, futuristic aesthetic for showcasing full-stack capabilities, architecture skills, and clean design.

Built for **100% static hosting** with zero build steps — ready for instant deployment to **GitHub Pages**.

---

## Live Preview & Features

- **Dark-First Modern Aesthetic**: Deep dark canvas with subtle gradients, glassmorphic surfaces, and thin border glow effects.
- **Dark / Light Theme Toggle**: Seamless switching between themes with automatic preference persistence in `localStorage` and zero flash of unstyled content (FOUC).
- **Interactive Hero Visual**: Monospaced developer terminal component featuring live status indicators, syntax highlighting, and floating capability badges.
- **Structured Sections**:
  - **Hero**: High-impact introduction, status badge (`AVAILABLE FOR OPPORTUNITIES`), and quick CTAs.
  - **About Me**: Engineering mindset narrative, professional background, and verified stats.
  - **Experience**: Timeline detailing Full Stack Developer Internship at EMEYC Pvt Limited.
  - **Skills & Tech Stack**: 5 categorized cards with inline SVG iconography (Frontend, Backend, Database, Tools & DevOps, Design).
  - **What I Do**: 4 capability cards highlighting Full Stack, Backend, UI/UX, and Continuous Learning.
  - **Education**: BCA at Medhavi Skills University focusing on Full Stack Development.
  - **Achievements**: Hackathon SumMIT@Sikkim'50 (Finalist & Team Leader) and Smart India Hackathon 2025.
  - **Currently Exploring**: Active learning topics (Go, Gin, Python, Django, DevOps Fundamentals).
  - **Selected Work**: Curated placeholder section ready for adding real projects.
  - **Contact**: Direct profile links (Email `thandupsherpa153@gmail.com`, WhatsApp `+91 7864928627`, GitHub, Location) and a client-validated demo contact form.
- **Micro-Interactions & Moving Animations**:
  - Futuristic page preloader with animated progress bar on initial load.
  - Smooth floating ambient light orbs and animated vertical grid scanline.
  - Interactive 3D tilt on the developer terminal and dynamic mouse spotlight on cards.
  - Reading progress bar across the top of the viewport.
  - Smooth scroll reveal animations via `IntersectionObserver`.
  - Active section scroll spy highlighting current navigation links.
  - Desktop-only custom cursor with smooth trailing ring (automatically disabled on touch devices).
  - Fully accessible mobile hamburger drawer with escape key listener and focus locking.
- **Accessibility & SEO**:
  - Semantic HTML5 structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
  - OpenGraph, Twitter card metadata, and JSON-LD `Person` schema markup.
  - Full keyboard `:focus-visible` support and `prefers-reduced-motion` compliance.

---

## Technologies Used

- **HTML5**: Semantic elements, accessible ARIA attributes, SVG iconography, JSON-LD structured data.
- **CSS3**: CSS Custom Properties (design tokens), Flexbox, CSS Grid, glassmorphism (`backdrop-filter`), keyframe animations, media queries.
- **Vanilla JavaScript (ES6+)**: `IntersectionObserver`, `localStorage` theme state, DOM event listeners, form validation.
- **Google Fonts**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono).

---

## Directory Structure

```text
portfolio/
│
├── index.html       # Primary HTML document & semantic structure
├── style.css        # Core stylesheet, theme variables, animations & responsiveness
├── script.js        # Vanilla JS logic (theme, navigation, animations, form)
├── README.md        # Documentation & deployment guide
│
└── assets/
    ├── icons/       # Favicon SVG & vector icons
    └── images/      # Media & image assets
```

---

## How to Run Locally

Because this project is built entirely with standard web technologies and has **no build steps or npm dependencies**, you can run it immediately:

### Option 1: Double-Click
Simply double-click `index.html` in your file manager to open it directly in any modern browser.

### Option 2: Local HTTP Server (Recommended)
Running through a lightweight local server ensures optimal loading of local assets and fonts:

**Using Python 3:**
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000` in your web browser.

**Using VS Code Live Server:**
Right-click `index.html` inside VS Code and select **"Open with Live Server"**.

---

## How to Deploy to GitHub Pages

Deploying to GitHub Pages takes under two minutes:

1. **Commit & Push** your changes to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initialize professional developer portfolio"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub (`https://github.com/USERNAME/REPOSITORY`).
   - Navigate to **Settings** > **Pages** (in the left sidebar).
   - Under **Build and deployment**:
     - **Source**: `Deploy from a branch`
     - **Branch**: `main` (or `master`)
     - **Folder**: `/ (root)`
   - Click **Save**.

3. **Visit Your Website**:
   GitHub Pages will publish your site at:
   `https://USERNAME.github.io/REPOSITORY/`

---

## Customization Guide

### 1. Update Contact & Social Information
Your email and WhatsApp are already integrated:
- **Email**: `thandupsherpa153@gmail.com`
- **WhatsApp**: `https://wa.me/917864928627` (`+91 7864928627`)
- **GitHub**: Search for `yourusername` in `index.html` and replace with your GitHub handle.

### 2. How to Add Real Projects
When you are ready to showcase real projects, locate the `<!-- PROJECTS PLACEHOLDER NOTICE -->` in `index.html` under `<section id="projects">`.

Replace any `.project-placeholder-card` with an active project card like this:

```html
<article class="project-card">
  <div class="project-media">
    <img src="./assets/images/your-project-preview.png" alt="Project Screenshot" loading="lazy">
  </div>
  <div class="project-details">
    <div class="project-header">
      <span class="project-category">Full Stack</span>
      <h3 class="project-title">Your Project Name</h3>
    </div>
    <p class="project-description">
      A concise description explaining the problem solved, architecture choices, and key features.
    </p>
    <div class="project-tech-tags">
      <span>React</span>
      <span>Node.js</span>
      <span>MongoDB</span>
      <span>REST API</span>
    </div>
    <div class="project-links">
      <a href="https://github.com/yourusername/repo-name" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        GitHub
      </a>
      <a href="https://your-demo-link.com" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        Live Demo
      </a>
    </div>
  </div>
</article>
```

---

## License & Attribution

Designed and created for **Thandup Sherpa**. Feel free to use this template as a base for personal portfolio projects.