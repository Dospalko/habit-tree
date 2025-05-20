import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
// Žiadny import CSS pre NightSkyVisualizer

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
}

function NightSkyVisualizer({ habits }) {
  const sketchRef = useRef();
  const p5InstanceRef = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      let currentHabits = [];
      const staticBgStars = [];

      // FARBY Z PALETY (pre jednoduchší prístup v p5)
      const C_BG_DARK = p.color('#0A0A1A'); // Ešte tmavšie pozadie pre p5
      const C_BG_LIGHT = p.color('#141328');
      const C_STAR_NEW = p.color(120, 120, 150, 180); // Sivastá pre nové
      const C_STAR_ACTIVE_BASE = p.color(200, 200, 255); // Základná pre aktívne
      const C_STAR_COMPLETED = p.color(255, 255, 220); // Žltobiela pre splnené
      const C_GLOW_COMPLETED = p.color(255, 240, 180, 70); // Žiara pre splnené
      const C_STATIC_STAR = p.color(180, 180, 220); // Statické hviezdy v pozadí

      const drawHabitStar = (pInstance, habit) => {
        const starRand = new SimpleRandom(habit.starSeed || parseInt(habit.id.substring(0,8), 16));
        const x = starRand.nextRange(pInstance.width * 0.05, pInstance.width * 0.95);
        const y = starRand.nextRange(pInstance.height * 0.05, pInstance.height * 0.75);
        let baseSize = pInstance.map(habit.daysCompleted, 0, 30, 2.5, 8, true);
        let starColor;
        let glowSize = 0;

        if (habit.completedToday) {
          starColor = C_STAR_COMPLETED;
          baseSize *= starRand.nextRange(1.6, 2.4); // Výrazne väčšia
          // Použijeme fialovú žiaru z palety pre splnené
          const accentPrimary = p.color('#A020F0'); // cosmic-accent-primary
          accentPrimary.setAlpha(90); // Nastav alfu pre žiaru
          glowSize = baseSize * starRand.nextRange(3, 5) + p.abs(p.sin(p.frameCount * starRand.nextRange(2.5,6))) * baseSize * 0.7;

          pInstance.noStroke();
          pInstance.fill(accentPrimary); // Fialová žiara
          for (let i=0; i<4; i++) {
             pInstance.ellipse(x, y, glowSize * (1 - i*0.22), glowSize * (1 - i*0.22));
          }
        } else if (habit.daysCompleted > 0) {
          starColor = C_STAR_ACTIVE_BASE;
          starColor.setAlpha(pInstance.map(habit.daysCompleted, 1, 15, 180, 255, true));
        } else {
          starColor = C_STAR_NEW;
          baseSize = starRand.nextRange(2, 3);
        }
        
        pInstance.noStroke();
        pInstance.fill(starColor);
        // Kreslenie hviezdy s viacerými cípmi pre "cool" efekt
        const points = starRand.nextIntRange(5, 7) * 2; // Počet cípov (5 až 7)
        const angle = p.TWO_PI / points;
        const outerRadius = baseSize;
        const innerRadius = baseSize * starRand.nextRange(0.4, 0.6);
        pInstance.push();
        pInstance.translate(x,y);
        pInstance.rotate(starRand.nextRange(0, p.TWO_PI)); // Náhodná rotácia
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
        if (habits) currentHabits = habits.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        const bgStarRand = new SimpleRandom(98765);
        for (let i = 0; i < 120; i++) { // Viac statických hviezd
          staticBgStars.push({
            x: bgStarRand.nextRange(0, p.width),
            y: bgStarRand.nextRange(0, p.height), // Po celej výške
            size: bgStarRand.nextRange(0.3, 1.2),
            alpha: bgStarRand.nextRange(30, 100)
          });
        }
        
        if (currentHabits.some(h => h.completedToday)) {
            if (!p.isLooping()) p.loop();
        } else {
            if (p.isLooping()) p.noLoop();
        }
        p.frameRate(30); // Mierne zníženie pre plynulosť, ak by bolo náročné
        p.redraw();
      };

      p.draw = () => {
        // Pozadie - tmavý gradient
        for (let i = 0; i <= p.height; i++) {
          let inter = p.map(i, 0, p.height, 0, 1);
          let c = p.lerpColor(C_BG_DARK, C_BG_LIGHT, inter);
          p.stroke(c);
          p.line(0, i, p.width, i);
        }
        p.noStroke();

        // Statické hviezdy - s jemným blikaním
        staticBgStars.forEach(star => {
          p.fill(C_STATIC_STAR.levels[0], C_STATIC_STAR.levels[1], C_STATIC_STAR.levels[2], star.alpha * (0.7 + Math.abs(p.sin(p.frameCount * 0.02 + star.x * 0.1)) * 0.3) );
          p.ellipse(star.x, star.y, star.size, star.size);
        });

        // Hviezdy návykov
        currentHabits.forEach((habit) => {
          drawHabitStar(p, habit);
        });
      };

      // updateWithProps function to update currentHabits when props change
      p.updateWithProps = (newProps) => {
        if (newProps.habits) {
          currentHabits = newProps.habits.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
          
          if (currentHabits.some(h => h.completedToday)) {
            if (!p.isLooping()) p.loop();
          } else {
            if (p.isLooping()) p.noLoop();
          }
          p.redraw();
        }
      };
    };

    // Inicializácia a cleanup p5 inštancie
    if (!p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch, sketchRef.current);
    } else {
      p5InstanceRef.current.updateWithProps({ habits });
    }
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [habits]);

  return (
    <div
      ref={sketchRef}
      className="w-[400px] h-[400px] mx-auto mb-4 rounded-xl overflow-hidden border-2 border-cosmic-border shadow-lg shadow-cosmic-accent-primary/10 bg-black"
    >
    </div>
  );
}

export default NightSkyVisualizer;