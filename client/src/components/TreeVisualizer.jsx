import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import './TreeVisualizer.css';

const mapRange = (value, inMin, inMax, outMin, outMax) => {
  if (inMin === inMax) return outMin;
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

// Jednoduchý LCG generátor pseudonáhodných čísel, aby sme neovplyvňovali globálny p5.random
class SimpleRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646; // Vráti číslo medzi 0 (vrátane) a 1 (bez)
  }
  nextRange(min, max) {
    return min + this.next() * (max - min);
  }
  nextIntRange(min, max) {
      return Math.floor(this.nextRange(min, max + 1)); // +1 aby bolo max inclusive
  }
}


function TreeVisualizer({ habits, overallGrowthFactor }) {
  const sketchRef = useRef();
  const p5InstanceRef = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      let currentHabits = [];
      let currentOverallGF = 0;
      const FIXED_SEED_EMPTY_TREE = 12345; // Seed pre konzistentný prázdny strom

      // ---- Funkcia na kreslenie JEDNEJ vetvy pre návyk ----
      const drawHabitBranch = (pInstance, habit, index, totalHabits) => {
        const branchRand = new SimpleRandom(habit.branchSeed || parseInt(habit.id.substring(0,8), 16)); // Použi seed z habitu

        const maxDaysForFullBranch = 30; // Po koľkých dňoch je vetva "plne" vyvinutá
        const growthProgress = p.constrain(mapRange(habit.daysCompleted, 0, maxDaysForFullBranch, 0.1, 1), 0.1, 1);

        let branchLength = branchRand.nextRange(40, 70) * growthProgress;
        let branchThickness = p.constrain(mapRange(habit.daysCompleted, 0, maxDaysForFullBranch, 1, 6), 1, 8);
        const maxDepthForBranch = habit.daysCompleted > 5 ? branchRand.nextIntRange(2, 4) : branchRand.nextIntRange(1,2);
        const angleVariance = 20; // +- stupne
        let initialAngle;

        // Rozmiestnenie vetiev pozdĺž kmeňa
        // Striedavo vľavo / vpravo, začínajúc vyššie pre staršie návyky (nižší index = starší)
        const heightRatio = mapRange(index, 0, Math.max(1, totalHabits -1 ), 0.75, 0.25); // Vyššie pre staršie
        const trunkEffectHeight = p.height * 0.6; // Výška kmeňa dostupná pre vetvy
        
        pInstance.translate(0, -trunkEffectHeight * (1 - heightRatio)); // Posun na miesto na kmeni

        if (index % 2 === 0) { // Párne indexy doprava
          initialAngle = branchRand.nextRange(20, 50);
        } else { // Nepárne doľava
          initialAngle = -branchRand.nextRange(20, 50);
        }
        pInstance.rotate(initialAngle);


        // Rekurzívna funkcia pre vetvenie tejto konkrétnej vetvy
        function branchOut(len, thick, level) {
          if (level > maxDepthForBranch || len < 5) {
            // Nakresli listy ak je návyk splnený, alebo aspoň nejaké ak je starší
            if (habit.completedToday || habit.daysCompleted > 2) {
                pInstance.noStroke();
                let leafColor;
                if (habit.completedToday) {
                    leafColor = pInstance.color(
                        branchRand.nextRange(80,120),
                        pInstance.map(currentOverallGF, 0, 5, 180, 230), // Jasnejšie zelená ak je viac splnených celkovo
                        branchRand.nextRange(80,120),
                        200
                    );
                } else {
                    leafColor = pInstance.color(
                        branchRand.nextRange(50,80),
                        branchRand.nextRange(120,160),
                        branchRand.nextRange(50,80),
                        150
                    );
                }
                pInstance.fill(leafColor);
                const leafSize = pInstance.map(thick, 1, 5, 6, 12);
                for (let i = 0; i < branchRand.nextIntRange(1,3); i++){ // Viac lístkov
                    pInstance.ellipse(branchRand.nextRange(-leafSize/3, leafSize/3), -leafSize / 2 + branchRand.nextRange(-leafSize/4, leafSize/4), leafSize * branchRand.nextRange(0.7, 1), leafSize * branchRand.nextRange(0.7, 1));
                }
            }
            return;
          }

          const brownR = pInstance.map(thick, 1, 8, 100, 130);
          const brownG = pInstance.map(thick, 1, 8, 60, 90);
          const brownB = pInstance.map(thick, 1, 8, 20, 50);
          pInstance.stroke(brownR, brownG, brownB);
          pInstance.strokeWeight(thick);
          pInstance.line(0, 0, 0, -len);
          pInstance.translate(0, -len);

          const branches = branchRand.nextIntRange(1, thick > 2 ? 2 : 1); // Max 2 podvetvy
          for (let i = 0; i < branches; i++) {
            pInstance.push();
            // Striedanie uhlov pre vetvy
            const angle = (i % 2 === 0) ? branchRand.nextRange(15, angleVariance + 10) : -branchRand.nextRange(15, angleVariance + 10);
            pInstance.rotate(angle);
            branchOut(len * branchRand.nextRange(0.6, 0.8), thick * 0.7, level + 1);
            pInstance.pop();
          }
        }
        branchOut(branchLength, branchThickness, 1);
      };
      // -------- Koniec drawHabitBranch --------


      p.setup = () => {
        p.createCanvas(400, 400).parent(sketchRef.current);
        p.angleMode(p.DEGREES);
        p.noLoop();
        // Nastavenie currentHabits a GF z props pri prvom spustení
        if (habits) currentHabits = habits;
        if (overallGrowthFactor !== undefined) currentOverallGF = overallGrowthFactor;
        p.redraw();
      };

      p.draw = () => {
        // --- Pozadie (ako predtým, ale môžeme znížiť náhodnosť alebo použiť SimpleRandom s fixným seedom) ---
        const bgRand = new SimpleRandom(54321); // Fixný seed pre konzistentné pozadie
        // Gradient oblohy
        for (let i = 0; i <= p.height / 2; i++) {
            let inter = p.map(i, 0, p.height / 2, 0, 1);
            let c = p.lerpColor(p.color(135, 206, 250), p.color(220, 240, 255), inter); // Tm. modrá hore, sv. modrá dole
            p.stroke(c);
            p.line(0, i, p.width, i);
        }
        // Tráva
        p.noStroke();
        p.fill(bgRand.nextIntRange(90,120), bgRand.nextIntRange(130,160), bgRand.nextIntRange(30,50), 200);
        p.rect(0, p.height - 60, p.width, 60);
        p.fill(bgRand.nextIntRange(70,100), bgRand.nextIntRange(90,120), bgRand.nextIntRange(40,60), 180);
        p.rect(0, p.height - 45, p.width, 45);
        p.fill(bgRand.nextIntRange(30,50), bgRand.nextIntRange(120,150), bgRand.nextIntRange(30,50), 150);
        p.rect(0, p.height - 30, p.width, 30);


        // --- Kreslenie kmeňa ---
        p.push();
        p.translate(p.width / 2, p.height - 30); // Počiatok na stred spodku

        let baseTrunkLength, baseTrunkWidth;
        const kmenRand = new SimpleRandom(FIXED_SEED_EMPTY_TREE); // Konzistentný kmeň

        if (currentHabits.length === 0) {
          baseTrunkLength = kmenRand.nextRange(30, 50);
          baseTrunkWidth = kmenRand.nextRange(4, 7);
        } else {
          // Kmeň môže trochu rásť s počtom návykov alebo ich "vekom"
          const totalAge = currentHabits.reduce((sum, h) => sum + h.daysCompleted, 0);
          baseTrunkLength = p.constrain(mapRange(currentHabits.length + totalAge / 5, 0, 20, 50, 100), 40, 120);
          baseTrunkWidth = p.constrain(mapRange(currentHabits.length + totalAge / 10, 0, 20, 5, 15), 4, 18);
        }
        p.stroke(kmenRand.nextIntRange(100,120), kmenRand.nextIntRange(60,80), kmenRand.nextIntRange(30,50)); // Hnedá farba kmeňa
        p.strokeWeight(baseTrunkWidth);
        p.line(0, 0, 0, -baseTrunkLength);
        p.translate(0, -baseTrunkLength); // Posun na vrch kmeňa pre začiatok vetiev


        // --- Kreslenie vetiev pre každý návyk ---
        currentHabits.forEach((habit, index) => {
          p.push(); // Izoluj transformácie pre každú vetvu návyku
          drawHabitBranch(p, habit, index, currentHabits.length);
          p.pop();
        });

        p.pop(); // Koniec transformácií pre kmeň
      };

      p.updateWithProps = (newProps) => {
        if (newProps.habits) {
          currentHabits = newProps.habits.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)); // Vždy zoradiť
        }
        if (newProps.overallGrowthFactor !== undefined) {
          currentOverallGF = newProps.overallGrowthFactor;
        }
        if (p.width > 0 && p.height > 0) {
          p.redraw();
        }
      };
    };

    if (!p5InstanceRef.current) {
      p5InstanceRef.current = new p5(sketch);
    } else {
      p5InstanceRef.current.updateWithProps({ habits, overallGrowthFactor });
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [habits, overallGrowthFactor]); // Znovu spustí useEffect pri zmene habits alebo overallGrowthFactor

  return <div ref={sketchRef} className="tree-canvas-container"></div>;
}

export default TreeVisualizer;