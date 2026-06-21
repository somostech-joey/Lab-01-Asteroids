# Lab 01 - Asteroids

This lab creates a playable Asteroids-style browser game using plain HTML, CSS, and JavaScript.

## What was created

- index.html: the page structure, canvas, score display, and game-over overlay.
- style.css: the full-screen visual design, HUD styling, and overlay panel.
- script.js: the game loop, player movement, bullet shooting, asteroid spawning, collision detection, scoring, and restart logic.
- README.md: this guide with beginner-friendly instructions.

## How the files work together

- HTML provides the structure of the page.
- CSS makes the page look like a space game with a full-screen canvas.
- JavaScript uses the HTML5 Canvas API to draw the game world and handle gameplay.
- The canvas is the drawing surface where the ship, bullets, and asteroids appear.

## How to run the game locally

1. Open the project folder in VS Code.
2. Start a local server from the project folder.
   - If you have Python installed, run: `python -m http.server 8000`
3. Open your browser to: `http://localhost:8000`

## How to verify the game

1. Movement: use the arrow keys to rotate and move the ship.
2. Shooting: press the spacebar to fire bullets.
3. Collisions: crash into asteroids to trigger the game over screen.
4. Scoring: destroy asteroids to gain points.

## Git and GitHub

Git is a tool that tracks changes to your project files. A GitHub repository is a cloud copy of your project that lets you share and back up your work.

## Git commands

Run these commands from the project folder:

```bash
git init
git add .
git commit -m "Create Asteroids game"
```

Then create a repository on GitHub and connect it:

```bash
git remote add origin https://github.com/your-username/Lab-01-Asteroids.git
git push -u origin main
```

## Notes

The goal of this lab is gameplay first. The game loads immediately when the page is opened and is designed to be played in the browser.
