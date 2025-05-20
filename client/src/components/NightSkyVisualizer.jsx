import React, { useRef, useEffect, useCallback } from 'react';
import p5 from 'p5';

// SimpleRandom trieda zostáva rovnaká
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

  // Táto funkcia je v scope React komponentu, nie p5 skice
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
    // --- P5 SKETCH DEFINÍCIA ---
    const sketch = (p) => {
      let currentLocalHabits = []; // Lokálna kópia pre p5 skicu
      const staticBgStars = [];

      let C_BACKGROUND, C_STAR_NEW, C_STAR_ACTIVE_BASE,
          C_STAR_COMPLETED_CORE, C_STAR_COMPLETED_GLOW, C_STATIC_STAR;

      const drawHabitStar = (pInstance, habit) => {
        // ... (kód pre drawHabitStar ostáva rovnaký ako v predošlej oprave)
        if (!habit || habit.starSeed === undefined) {
            return;
        }
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
          pInstance.fill(starGlowColor);
          for (let i = 0; i < 5; i++) {
             pInstance.ellipse(x, y, glowSize * (1 - i*0.18), glowSize * (1 - i*0.18));
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
        pInstance.translate(x,y);
        pInstance.rotate(starRand.nextRange(0, p.TWO_PI) + p.frameCount * 0.001 * starRand.nextRange(-1,1));
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

        C_BACKGROUND = p.color(0, 0, 0);
        C_STAR_NEW = p.color(100, 100, 120, 180);
        C_STAR_ACTIVE_BASE = p.color(180, 200, 255);
        C_STAR_COMPLETED_CORE = p.color(255, 255, 230);
        C_STAR_COMPLETED_GLOW = p.color('#A020F0');
        C_STAR_COMPLETED_GLOW.setAlpha(70);
        C_STATIC_STAR = p.color(150, 150, 170);

        // Počiatočné nastavenie currentLocalHabits priamo z `habits` propu
        // Tento `habits` je ten, ktorý je v uzávere `useEffect` pri jeho prvom spustení.
        if (habits && Array.isArray(habits)) {
             currentLocalHabits = [...habits].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
        } else {
            currentLocalHabits = [];
        }
        
        const bgStarRand = new SimpleRandom(98765);
        for (let i = 0; i < 150; i++) {
          staticBgStars.push({
            x: bgStarRand.nextRange(0, p.width),
            y: bgStarRand.nextRange(0, p.height),
            size: bgStarRand.nextRange(0.2, 1.1),
            alpha: bgStarRand.nextRange(20, 80),
            twinkleOffset: bgStarRand.nextRange(0, p.TWO_PI)
          });
        }
        
        if (currentLocalHabits.some(h => h.completedToday)) {
            if (!p.isLooping()) p.loop();
        } else {
            if (p.isLooping()) p.noLoop();
        }
        p.redraw();
      };

      p.draw = () => {
        if (!C_BACKGROUND) return;
        p.background(C_BACKGROUND);
        p.noStroke();

        staticBgStars.forEach(star => {
          const currentAlpha = star.alpha * (0.5 + Math.abs(p.sin(p.frameCount * 0.015 + star.twinkleOffset)) * 0.5);
          if (C_STATIC_STAR) {
              p.fill(C_STATIC_STAR.levels[0], C_STATIC_STAR.levels[1], C_STATIC_STAR.levels[2], currentAlpha);
              p.ellipse(star.x, star.y, star.size, star.size);
          }
        });

        currentLocalHabits.filter(h => !h.completedToday).forEach(habit => {
            drawHabitStar(p, habit);
        });
        currentLocalHabits.filter(h => h.completedToday).forEach(habit => {
            drawHabitStar(p, habit);
        });
      };

      // Metóda pripojená k p5 inštancii pre aktualizáciu z Reactu
      p.updateWithProps = (newProps) => {
        if (!C_BACKGROUND) return; // Ak setup ešte neprebehol
        
        let habitsActuallyChanged = false;
        // `newProps.habitsFromReact` bude obsahovať aktuálne `habits` z Reactu
        if (newProps.habitsFromReact && Array.isArray(newProps.habitsFromReact)) {
          const sortedNewHabits = [...newProps.habitsFromReact].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          // Porovnaj s `currentLocalHabits`
          if (didHabitsDataChange(currentLocalHabits, sortedNewHabits)) {
            currentLocalHabits = sortedNewHabits;
            habitsActuallyChanged = true;
          }
        }

        const needsLooping = currentLocalHabits.some(h => h.completedToday);
        let loopStateChanged = false;

        if (needsLooping) {
          if (!p.isLooping()) {
            p.loop();
            loopStateChanged = true;
          }
        } else {
          if (p.isLooping()) {
            p.noLoop();
            loopStateChanged = true;
          }
        }
        
        if (habitsActuallyChanged || loopStateChanged || p.isLooping()) {
            if (p.width > 0 && p.height > 0) {
                 p.redraw();
            }
        }
      };
    };
    // --- KONIEC P5 SKETCH DEFINÍCIE ---


    // Inicializácia p5 alebo aktualizácia existujúcej inštancie
    if (!p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch, sketchRef.current);
    } else {
      // Pošli AKTUÁLNE `habits` (z props tohto useEffect cyklu) do p5 skice
      if (typeof p5InstanceRef.current.updateWithProps === 'function') {
          p5InstanceRef.current.updateWithProps({ habitsFromReact: habits }); // Zmena názvu propu
      }
    }

    // Cleanup funkcia
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  // Závislosť useEffect hooku je len `habits` z React props a `didHabitsDataChange`.
  // Tento hook sa znovu spustí, keď sa zmení `habits` v rodičovskom komponente.
  }, [habits, didHabitsDataChange]);

  return (
    <div
      ref={sketchRef}
      className="w-[400px] h-[400px] mx-auto mb-4 rounded-xl overflow-hidden border-2 border-cosmic-border shadow-lg shadow-cosmic-accent-primary/20 bg-black"
    >
    </div>
  );
}

export default NightSkyVisualizer;