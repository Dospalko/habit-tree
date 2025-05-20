import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
// Štýly pre kontajner môžu byť podobné TreeVisualizer.css, premenuj súbor ak treba
import './NightSkyVisualizer.css'; // Alebo použite rovnaký ako TreeVisualizer.css

// Pomocná trieda pre generovanie pseudonáhodných čísel
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
      const staticBgStars = []; // Pole pre statické hviezdy v pozadí

      // ---- Funkcia na kreslenie JEDNEJ hviezdy pre návyk ----
      const drawHabitStar = (pInstance, habit) => {
        const starRand = new SimpleRandom(habit.starSeed || parseInt(habit.id.substring(0,8), 16));

        // Deterministická pozícia na základe seedu
        const x = starRand.nextRange(pInstance.width * 0.1, pInstance.width * 0.9);
        const y = starRand.nextRange(pInstance.height * 0.1, pInstance.height * 0.7); // Vyššie na oblohe

        // Základná veľkosť podľa počtu dní, min. veľkosť
        let baseSize = pInstance.map(habit.daysCompleted, 0, 30, 2, 7, true); // true pre constrain

        // Farba a jas
        let starColor;
        let glowColor;
        let glowSize = 0;

        if (habit.completedToday) {
          starColor = pInstance.color(255, 255, starRand.nextRange(180, 220)); // Jasná, žltkastá
          baseSize *= starRand.nextRange(1.5, 2.2); // Väčšia ak je splnená
          glowColor = pInstance.color(255, 255, 200, 80); // Jemná žltá žiara
          // Pulzujúca žiara
          glowSize = baseSize * starRand.nextRange(2.5, 4) + pInstance.sin(pInstance.frameCount * starRand.nextRange(3,7)) * baseSize * 0.5;

        } else if (habit.daysCompleted > 0) {
          starColor = pInstance.color(220, 220, 255 - pInstance.map(habit.daysCompleted, 0, 30, 0, 50, true)); // Bledomodrá až biela
        } else {
          starColor = pInstance.color(150, 150, 180, 200); // Slabá, šedivá pre nové/nesplnené
          baseSize = starRand.nextRange(1.5, 2.5);
        }

        // Kreslenie žiary (ak je)
        if (glowSize > 0 && habit.completedToday) {
          pInstance.noStroke();
          pInstance.fill(glowColor);
          for (let i=0; i<3; i++) { // Viac vrstiev žiary pre jemnejší efekt
             pInstance.ellipse(x, y, glowSize * (1 - i*0.2), glowSize * (1 - i*0.2));
          }
        }

        // Kreslenie samotnej hviezdy
        pInstance.noStroke();
        pInstance.fill(starColor);
        // Jednoduchý kruh pre hviezdu, alebo môže byť komplexnejší tvar
        pInstance.ellipse(x, y, baseSize, baseSize);

        // Voliteľné: meno návyku pri hover (zložitejšie, vynecháme pre jednoduchosť v p5)
      };
      // -------- Koniec drawHabitStar --------

      p.setup = () => {
        p.createCanvas(400, 400).parent(sketchRef.current); // Zhoduje sa s .tree-canvas-container (alebo .night-sky-container)
        if (habits) currentHabits = habits;

        // Vygeneruj statické hviezdy v pozadí (len raz)
        const bgStarRand = new SimpleRandom(98765); // Fixný seed pre pozadie
        for (let i = 0; i < 100; i++) {
          staticBgStars.push({
            x: bgStarRand.nextRange(0, p.width),
            y: bgStarRand.nextRange(0, p.height * 0.85), // Nech sú len na oblohe
            size: bgStarRand.nextRange(0.5, 1.5),
            alpha: bgStarRand.nextRange(50, 150)
          });
        }
        if (habits.some(h => h.completedToday)) {
            p.loop(); // Ak je niečo splnené, potrebujeme animáciu pulzovania
        } else {
            p.noLoop(); // Inak stačí statický obrázok
            p.redraw();
        }
      };

      p.draw = () => {
        // --- Pozadie ---
        // Tmavý gradient pre nočnú oblohu
        for (let i = 0; i <= p.height; i++) {
          let inter = p.map(i, 0, p.height, 0, 1);
          // Z tmavomodrej/čiernej hore do tmavofialovej/tmavomodrej dole
          let c1 = p.color(10, 10, 30);
          let c2 = p.color(25, 20, 55);
          let c = p.lerpColor(c1, c2, inter);
          p.stroke(c);
          p.line(0, i, p.width, i);
        }
        p.noStroke();

        // Kreslenie statických hviezd v pozadí
        staticBgStars.forEach(star => {
          p.fill(255, 255, 255, star.alpha);
          p.ellipse(star.x, star.y, star.size, star.size);
        });

        // --- Kreslenie hviezd pre každý návyk ---
        currentHabits.forEach((habit) => {
          drawHabitStar(p, habit);
        });
      };

      p.updateWithProps = (newProps) => {
        let habitsChanged = false;
        if (newProps.habits) {
            // Jednoduchá kontrola, či sa pole zmenilo (môže byť sofistikovanejšia)
            if (newProps.habits.length !== currentHabits.length ||
                newProps.habits.some((h, i) => h.id !== currentHabits[i]?.id || h.completedToday !== currentHabits[i]?.completedToday || h.daysCompleted !== currentHabits[i]?.daysCompleted)) {
                habitsChanged = true;
            }
          currentHabits = newProps.habits.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        if (habitsChanged && p.width > 0 && p.height > 0) {
          // Ak je aspoň jedna hviezda, ktorá bude pulzovať (completedToday), zapni loop. Inak vypni.
          if (currentHabits.some(h => h.completedToday)) {
            if (!p.isLooping()) p.loop();
          } else {
            if (p.isLooping()) p.noLoop();
          }
          p.redraw(); // Vždy prekresli pri zmene dát
        } else if (p.isLooping()) {
            // Ak beží loop (pre pulzovanie), nech sa kreslí ďalej
        } else {
            // Ak sa dáta nezmenili a loop nebeží, nerob nič
        }
      };
    };

    if (!p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch);
    } else {
      // Pošli nové props existujúcej inštancii
      p5InstanceRef.current.updateWithProps({ habits });
    }

    // Cleanup
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [habits]); // Závislosť na `habits`

  // Kontajner pre p5 canvas
  return <div ref={sketchRef} className="night-sky-canvas-container"></div>;
}

export default NightSkyVisualizer;