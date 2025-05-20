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

      const drawHabitStar = (pInstance, habit) => {
        const starRand = new SimpleRandom(habit.starSeed || parseInt(habit.id.substring(0,8), 16));
        const x = starRand.nextRange(pInstance.width * 0.1, pInstance.width * 0.9);
        const y = starRand.nextRange(pInstance.height * 0.1, pInstance.height * 0.7);
        let baseSize = pInstance.map(habit.daysCompleted, 0, 30, 2, 7, true);
        let starColor;
        let glowColor;
        let glowSize = 0;

        if (habit.completedToday) {
          starColor = pInstance.color(255, 255, starRand.nextRange(180, 220)); // Jasná bielo-žltá
          baseSize *= starRand.nextRange(1.5, 2.2);
          glowColor = pInstance.color(255, 255, 200, 80); // Jemná žltá žiara
          glowSize = baseSize * starRand.nextRange(2.5, 4) + pInstance.sin(pInstance.frameCount * starRand.nextRange(3,7)) * baseSize * 0.5;
        } else if (habit.daysCompleted > 0) {
          starColor = pInstance.color(220, 220, 255 - pInstance.map(habit.daysCompleted, 0, 30, 0, 50, true)); // Bledomodrá až biela
        } else {
          starColor = pInstance.color(150, 150, 180, 200); // Slabá, šedivá pre nové
          baseSize = starRand.nextRange(1.5, 2.5);
        }

        if (glowSize > 0 && habit.completedToday) {
          pInstance.noStroke();
          pInstance.fill(glowColor);
          for (let i=0; i<3; i++) {
             pInstance.ellipse(x, y, glowSize * (1 - i*0.2), glowSize * (1 - i*0.2));
          }
        }
        pInstance.noStroke();
        pInstance.fill(starColor);
        pInstance.ellipse(x, y, baseSize, baseSize);
      };

      p.setup = () => {
        p.createCanvas(400, 400).parent(sketchRef.current); // Prispôsob veľkosť, ak treba
        if (habits) currentHabits = habits.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); // Vždy zoradiť
        
        const bgStarRand = new SimpleRandom(98765);
        for (let i = 0; i < 100; i++) {
          staticBgStars.push({
            x: bgStarRand.nextRange(0, p.width),
            y: bgStarRand.nextRange(0, p.height * 0.85),
            size: bgStarRand.nextRange(0.5, 1.5),
            alpha: bgStarRand.nextRange(50, 150)
          });
        }
        
        if (currentHabits.some(h => h.completedToday)) {
            if (!p.isLooping()) p.loop();
        } else {
            if (p.isLooping()) p.noLoop();
        }
        p.redraw(); // Vždy spraviť počiatočné prekreslenie
      };

      p.draw = () => {
        // Pozadie
        for (let i = 0; i <= p.height; i++) {
          let inter = p.map(i, 0, p.height, 0, 1);
          let c1 = p.color(10, 10, 25); // Tmavšia modrá/čierna
          let c2 = p.color(20, 15, 45); // Tmavofialová
          let c = p.lerpColor(c1, c2, inter);
          p.stroke(c);
          p.line(0, i, p.width, i);
        }
        p.noStroke();

        // Statické hviezdy
        staticBgStars.forEach(star => {
          p.fill(220, 220, 250, star.alpha); // Jemne modrasté
          p.ellipse(star.x, star.y, star.size, star.size);
        });

        // Hviezdy návykov
        currentHabits.forEach((habit) => {
          drawHabitStar(p, habit);
        });
      };

      p.updateWithProps = (newProps) => {
        let habitsChanged = false;
        if (newProps.habits) {
            const sortedNewHabits = [...newProps.habits].sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
            if (sortedNewHabits.length !== currentHabits.length ||
                sortedNewHabits.some((h, i) => 
                    h.id !== currentHabits[i]?.id || 
                    h.completedToday !== currentHabits[i]?.completedToday || 
                    h.daysCompleted !== currentHabits[i]?.daysCompleted)) {
                habitsChanged = true;
            }
          currentHabits = sortedNewHabits;
        }

        if (p.width > 0 && p.height > 0) { // Canvas je pripravený
            if (currentHabits.some(h => h.completedToday)) {
                if (!p.isLooping()) p.loop();
            } else {
                if (p.isLooping()) p.noLoop();
            }
            // Vždy prekresli, ak sa zmenili dáta ALEBO ak beží animácia (loop)
            if (habitsChanged || p.isLooping()) {
                 p.redraw();
            } else if (habitsChanged && !p.isLooping()){ // Ak sa zmenili dáta ale loop nebeží (lebo nie je completedToday)
                 p.redraw(); // aj tak prekresli
            }
        }
      };
    };

    if (!p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch);
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
      className="w-[400px] h-[400px] mx-auto mb-4 rounded-lg overflow-hidden border border-gray-700 shadow-inner bg-black"
      // Šírka a výška by mali korešpondovať s createCanvas v p5.js
      // bg-black zabezpečí, že pozadie je čierne, aj keby sa p5 canvas nenačítal hneď
    >
      {/* p5.js canvas sa sem pripojí */}
    </div>
  );
}

export default NightSkyVisualizer;