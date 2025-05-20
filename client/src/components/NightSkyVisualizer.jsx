import React, { useRef, useEffect, useCallback } from 'react';
import p5 from 'p5';

// Jednoduchý deterministický generátor náhodných čísel
class SimpleRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
  nextRange(min, max) {
    return min + this.next() * (max - min);
  }
  nextIntRange(min, max) {
    return Math.floor(this.nextRange(min, max + 1));
  }
}

function NightSkyVisualizer({ habits }) {
  const sketchRef = useRef();
  const p5InstanceRef = useRef(null);

  const didHabitsDataChange = useCallback((prevHabits, newHabits) => {
    if (!prevHabits || !newHabits || prevHabits.length !== newHabits.length) {
      return true;
    }
    for (let i = 0; i < newHabits.length; i++) {
      if (
        newHabits[i].id !== prevHabits[i]?.id ||
        newHabits[i].completedToday !== prevHabits[i]?.completedToday ||
        newHabits[i].daysCompleted !== prevHabits[i]?.daysCompleted ||
        newHabits[i].starSeed !== prevHabits[i]?.starSeed
      ) {
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const sketch = (p) => {
      let currentLocalHabits = [];
      const staticBgStars = [];
      let isSetupComplete = false;

      // farby
      let C_BACKGROUND, C_STAR_NEW, C_STAR_ACTIVE_BASE,
          C_STAR_COMPLETED_CORE, C_STAR_COMPLETED_GLOW, C_STATIC_STAR;

      // vykreslenie hviezdy
      const drawHabitStar = (pInstance, habit) => {
        if (!habit || habit.starSeed === undefined) return;

        const starRand = new SimpleRandom(habit.starSeed);
        const x = starRand.nextRange(pInstance.width * 0.08, pInstance.width * 0.92);
        const y = starRand.nextRange(pInstance.height * 0.08, pInstance.height * 0.80);
        let baseSize = pInstance.map(habit.daysCompleted, 0, 30, 3, 9, true);
        let starCoreColor;
        let starGlowColor = null;
        let glowSize = 0;
        let outerRadius = baseSize;
        let innerRadius = baseSize * starRand.nextRange(0.4, 0.6);

        if (habit.completedToday) {
          starCoreColor = C_STAR_COMPLETED_CORE;
          starGlowColor = C_STAR_COMPLETED_GLOW;
          outerRadius *= starRand.nextRange(1.8, 2.8);
          innerRadius = outerRadius * starRand.nextRange(0.5, 0.7);
          glowSize = outerRadius * starRand.nextRange(1.5, 2.5) + p.abs(p.sin(p.frameCount * starRand.nextRange(3.0, 7.0))) * outerRadius * 0.5;

          pInstance.noStroke();
          if (starGlowColor) {
            pInstance.fill(starGlowColor);
            for (let i = 0; i < 5; i++) {
              pInstance.ellipse(x, y, glowSize * (1 - i * 0.18), glowSize * (1 - i * 0.18));
            }
          }
        } else if (habit.daysCompleted > 0) {
          starCoreColor = pInstance.color(C_STAR_ACTIVE_BASE);
          const alphaValue = pInstance.map(habit.daysCompleted, 1, 15, 160, 255, true);
          starCoreColor.setAlpha(alphaValue);
        } else {
          starCoreColor = C_STAR_NEW;
          outerRadius = starRand.nextRange(2.5, 3.5);
          innerRadius = outerRadius * 0.5;
        }

        pInstance.noStroke();
        pInstance.fill(starCoreColor);
        const points = starRand.nextIntRange(5, 8) * 2;
        const angle = p.TWO_PI / points;

        pInstance.push();
        pInstance.translate(x, y);
        pInstance.rotate(starRand.nextRange(0, p.TWO_PI) + p.frameCount * 0.001 * starRand.nextRange(-1, 1));
        pInstance.beginShape();
        for (let i = 0; i < points; i++) {
          const r = (i % 2 === 0) ? outerRadius : innerRadius;
          const sx = p.cos(i * angle) * r;
          const sy = p.sin(i * angle) * r;
          pInstance.vertex(sx, sy);
        }
        pInstance.endShape(p.CLOSE);
        pInstance.pop();
      };

      p.setup = () => {
        p.createCanvas(400, 400).parent(sketchRef.current);
        p.frameRate(30);

        // Inicializuj farby
        C_BACKGROUND = p.color(0, 0, 0);
        C_STAR_NEW = p.color(100, 100, 120, 180);
        C_STAR_ACTIVE_BASE = p.color(180, 200, 255);
        C_STAR_COMPLETED_CORE = p.color(255, 255, 230);
        C_STAR_COMPLETED_GLOW = p.color('#A020F0');
        C_STAR_COMPLETED_GLOW.setAlpha(70);
        C_STATIC_STAR = p.color(150, 150, 170);

        // Inicializuj dáta
        currentLocalHabits = Array.isArray(habits)
          ? [...habits].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          : [];

        const bgStarRand = new SimpleRandom(98765);
        for (let i = 0; i < 150; i++) {
          staticBgStars.push({
            x: bgStarRand.nextRange(0, p.width),
            y: bgStarRand.nextRange(0, p.height),
            size: bgStarRand.nextRange(0.2, 1.1),
            alpha: bgStarRand.nextRange(20, 80),
            twinkleOffset: bgStarRand.nextRange(0, p.TWO_PI),
          });
        }

        isSetupComplete = true;

        const hasCompleted = currentLocalHabits.some((h) => h.completedToday);
        if (hasCompleted) p.loop();
        else p.noLoop();

        p.redraw();
      };

      p.draw = () => {
        if (!isSetupComplete || !C_STATIC_STAR) return;

        p.background(C_BACKGROUND);
        p.noStroke();

        staticBgStars.forEach((star) => {
          const currentAlpha = star.alpha * (0.5 + Math.abs(p.sin(p.frameCount * 0.015 + star.twinkleOffset)) * 0.5);
          if (C_STATIC_STAR?.levels) {
            p.fill(C_STATIC_STAR.levels[0], C_STATIC_STAR.levels[1], C_STATIC_STAR.levels[2], currentAlpha);
            p.ellipse(star.x, star.y, star.size, star.size);
          }
        });

        currentLocalHabits
          .filter((h) => !h.completedToday)
          .forEach((habit) => drawHabitStar(p, habit));

        currentLocalHabits
          .filter((h) => h.completedToday)
          .forEach((habit) => drawHabitStar(p, habit));
      };

      p.updateWithProps = (newProps) => {
        if (!isSetupComplete) return;

        let habitsActuallyChanged = false;
        if (newProps.habitsFromReact && Array.isArray(newProps.habitsFromReact)) {
          const sortedNewHabits = [...newProps.habitsFromReact].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          if (didHabitsDataChange(currentLocalHabits, sortedNewHabits)) {
            currentLocalHabits = sortedNewHabits;
            habitsActuallyChanged = true;
          }
        }

        const needsLooping = currentLocalHabits.some((h) => h.completedToday);
        let loopStateChanged = false;

        if (needsLooping && !p.isLooping()) {
          p.loop();
          loopStateChanged = true;
        } else if (!needsLooping && p.isLooping()) {
          p.noLoop();
          loopStateChanged = true;
        }

        if (habitsActuallyChanged || loopStateChanged || p.isLooping()) {
          if (p.width > 0 && p.height > 0) {
            p.redraw();
          }
        }
      };
    };

    if (!p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch, sketchRef.current);
    } else {
      p5InstanceRef.current.updateWithProps({ habitsFromReact: habits });
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [habits, didHabitsDataChange]);

  return (
    <div
      ref={sketchRef}
      className="w-[400px] h-[400px] mx-auto mb-4 rounded-xl overflow-hidden border-2 border-cosmic-border shadow-lg shadow-cosmic-accent-primary/20 bg-black"
    />
  );
}

export default NightSkyVisualizer;
