import {
    Asteroid,
    Bullet,
    H,
    Particle,
    POINTS,
    POWERUP_DROP_CHANCE,
    POWERUP_DURATION,
    PowerUp,
    Ship,
    W,
    dist,
    rand,
} from "./entities";
import { createInput } from "./input";

export type AsteroidsStats = {
    score: number;
    lives: number; // 0..3
    level: number; // 1..
};

export type AsteroidsCallbacks = {
    onStats: (stats: AsteroidsStats) => void; // solo cuando algún valor cambia
    onGameOver: (finalScore: number) => void; // una vez por partida, al perder la última vida
};

export type AsteroidsHandle = {
    pause: () => void;
    resume: () => void;
    destroy: () => void; // detiene rAF y quita listeners
};

type State = "playing" | "dead" | "gameover";

export function createAsteroids(
    canvas: HTMLCanvasElement,
    callbacks: AsteroidsCallbacks,
): AsteroidsHandle {
    const ctx = canvas.getContext("2d");
    if (!ctx) return { pause() {}, resume() {}, destroy() {} };

    let input = createInput();

    let ship = new Ship();
    let bullets: Bullet[] = [];
    let asteroids: Asteroid[] = [];
    let particles: Particle[] = [];
    let powerUps: PowerUp[] = [];
    let score = 0;
    let lives = 3;
    let level = 1;
    let state: State = "playing";
    let deadTimer = 0;
    let powerUpSpawned = false;
    let killsSinceSpawn = 0;

    let lastStats: AsteroidsStats | null = null;
    let gameOverNotified = false;

    let rafId: number | null = null;
    let lastTime: number | null = null;
    let paused = false;
    let destroyed = false;

    function emitStats() {
        if (
            lastStats &&
            lastStats.score === score &&
            lastStats.lives === lives &&
            lastStats.level === level
        )
            return;
        lastStats = { score, lives, level };
        callbacks.onStats({ ...lastStats });
    }

    function spawnAsteroids(count: number) {
        const SAFE_DIST = 130;
        for (let i = 0; i < count; i++) {
            let x: number, y: number;
            do {
                x = rand(0, W);
                y = rand(0, H);
            } while (Math.hypot(x - W / 2, y - H / 2) < SAFE_DIST);
            asteroids.push(new Asteroid(x, y, 3));
        }
    }

    function initGame() {
        ship = new Ship();
        bullets = [];
        asteroids = [];
        particles = [];
        powerUps = [];
        powerUpSpawned = false;
        killsSinceSpawn = 0;
        score = 0;
        lives = 3;
        level = 1;
        state = "playing";
        spawnAsteroids(4);
    }

    function nextLevel() {
        level++;
        bullets = [];
        particles = [];
        powerUps = [];
        powerUpSpawned = false;
        killsSinceSpawn = 0;
        ship.reset();
        spawnAsteroids(3 + level);
    }

    function explode(x: number, y: number, count = 8) {
        for (let i = 0; i < count; i++) particles.push(new Particle(x, y));
    }

    function killShip() {
        explode(ship.x, ship.y, 14);
        ship.dead = true;
        lives--;
        if (lives <= 0) {
            state = "gameover";
        } else {
            state = "dead";
            deadTimer = 2;
        }
    }

    function updateParticles(dt: number) {
        particles.forEach((p) => p.update(dt));
        particles = particles.filter((p) => !p.dead);
    }

    function update(dt: number) {
        if (state === "gameover") {
            input.pressed("Space"); // sin disparo ni reinicio por Espacio
            updateParticles(dt);
            return;
        }

        if (state === "dead") {
            deadTimer -= dt;
            updateParticles(dt);
            asteroids.forEach((a) => a.update(dt));
            if (deadTimer <= 0) {
                state = "playing";
                ship.reset();
            }
            return;
        }

        // Disparar
        if (input.pressed("Space")) {
            bullets.push(...ship.tryShoot());
        }

        ship.update(dt, input.keys);
        bullets.forEach((b) => b.update(dt));
        asteroids.forEach((a) => a.update(dt));
        particles.forEach((p) => p.update(dt));
        powerUps.forEach((p) => p.update(dt));

        bullets = bullets.filter((b) => !b.dead);
        particles = particles.filter((p) => !p.dead);
        powerUps = powerUps.filter((p) => !p.dead);

        for (const p of powerUps) {
            if (!p.dead && dist(ship, p) < ship.radius + p.radius) {
                p.dead = true;
                ship.tripleShot = POWERUP_DURATION;
            }
        }

        // Bala vs asteroide
        const newAsteroids: Asteroid[] = [];
        for (const b of bullets) {
            for (const a of asteroids) {
                if (!a.dead && !b.dead && dist(b, a) < a.radius) {
                    b.dead = true;
                    a.dead = true;
                    score += POINTS[a.size];
                    explode(a.x, a.y, a.size * 5);
                    newAsteroids.push(...a.split());
                    if (!powerUpSpawned) {
                        killsSinceSpawn++;
                        const guaranteed = killsSinceSpawn >= 5;
                        if (guaranteed || Math.random() < POWERUP_DROP_CHANCE) {
                            powerUps.push(new PowerUp(a.x, a.y));
                            powerUpSpawned = true;
                        }
                    }
                }
            }
        }
        asteroids = asteroids.filter((a) => !a.dead).concat(newAsteroids);
        bullets = bullets.filter((b) => !b.dead);

        // Nave vs asteroide
        if (ship.invincible <= 0) {
            for (const a of asteroids) {
                if (dist(ship, a) < ship.radius + a.radius * 0.82) {
                    killShip();
                    break;
                }
            }
        }

        // Nivel completado
        if (asteroids.length === 0) nextLevel();
    }

    function drawPowerUpTimer(c: CanvasRenderingContext2D) {
        if (ship.tripleShot <= 0) return;
        c.save();
        c.fillStyle = "#0ff";
        c.font = "15px monospace";
        c.textAlign = "left";
        c.textBaseline = "alphabetic";
        c.fillText(`3x  ${ship.tripleShot.toFixed(1)}s`, 14, 26);
        c.restore();
    }

    function draw(c: CanvasRenderingContext2D) {
        c.fillStyle = "#000";
        c.fillRect(0, 0, W, H);

        particles.forEach((p) => p.draw(c));
        asteroids.forEach((a) => a.draw(c));
        powerUps.forEach((p) => p.draw(c));
        bullets.forEach((b) => b.draw(c));
        ship.draw(c);

        drawPowerUpTimer(c);
    }

    function loop(ts: number) {
        if (destroyed || paused) return;
        const dt =
            lastTime === null ? 0 : Math.min((ts - lastTime) / 1000, 0.05);
        lastTime = ts;
        update(dt);
        emitStats();
        if (state === "gameover" && !gameOverNotified) {
            gameOverNotified = true;
            callbacks.onGameOver(score);
        }
        draw(ctx!);
        rafId = requestAnimationFrame(loop);
    }

    function stopLoop() {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        lastTime = null;
    }

    initGame();
    emitStats();
    rafId = requestAnimationFrame(loop);

    return {
        pause() {
            if (destroyed || paused) return;
            paused = true;
            stopLoop();
            // Suelta el teclado: en pausa Espacio debe activar los botones.
            input.destroy();
        },
        resume() {
            if (destroyed || !paused) return;
            paused = false;
            input = createInput(); // teclas limpias, sin pulsaciones de la pausa
            lastTime = null;
            rafId = requestAnimationFrame(loop);
        },
        destroy() {
            if (destroyed) return;
            destroyed = true;
            stopLoop();
            input.destroy();
        },
    };
}
