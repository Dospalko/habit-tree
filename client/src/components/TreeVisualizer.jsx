import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import './TreeVisualizer.css'; // Uisti sa, že máš tento súbor a je správne naimportovaný

// Helper funkcia pre mapovanie hodnoty z jedného rozsahu do druhého (ostáva)
const mapRange = (value, inMin, inMax, outMin, outMax) => {
  if (inMin === inMax) return outMin; // Aby sa predišlo deleniu nulou
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

function TreeVisualizer({ growthFactor, totalDaysCompleted }) {
  const sketchRef = useRef(); // Ref pre DOM element, kam sa pripojí canvas
  const p5InstanceRef = useRef(null); // Ref pre uloženie p5 inštancie

  useEffect(() => {
    // --- Definícia p5 skice ---
    const sketch = (p) => {
      // Interné premenné skice pre parametre stromu
      let currentTotalDays = 0;
      let currentGrowthFactor = 0;

      let baseTrunkLength;
      let baseTrunkWidth;
      let branchingAngle;
      let maxDepth;
      const minBranchLength = 4; // Minimálna dĺžka vetvy, aby sa ďalej vetvila
      const lengthRatio = 0.70; // Pomer skrátenia každej novej vetvy

      // Funkcia na aktualizáciu parametrov stromu na základe props
      const updateTreeParameters = (newTotalDays, newGF) => {
        currentTotalDays = newTotalDays;
        currentGrowthFactor = newGF; // Ulož aktuálny growthFactor

        baseTrunkLength = mapRange(currentTotalDays, 0, 100, 30, 100);
        baseTrunkLength = p.constrain(baseTrunkLength, 20, 100);

        baseTrunkWidth = mapRange(currentTotalDays, 0, 100, 3, 15);
        baseTrunkWidth = p.constrain(baseTrunkWidth, 2, 15);

        branchingAngle = p.constrain(mapRange(currentTotalDays, 0, 50, 15, 30), 15, 35);
        maxDepth = p.constrain(Math.floor(mapRange(currentTotalDays, 0, 70, 3, 8)), 3, 8);
      };

      // Funkcia na kreslenie jednej vetvy a rekurzívne volanie pre ďalšie
      const drawBranch = (len, thickness, level) => {
        if (len < minBranchLength || level > maxDepth) {
          p.noStroke();
          // Sviežosť listov závisí od currentGrowthFactor (dnešné splnené návyky)
          const isFreshGrowth = currentGrowthFactor > 0 && level > maxDepth * 0.5;
          if (isFreshGrowth) {
            p.fill(100, p.random(200, 230), 100, 220); // Sviežejšia zelená, mierne náhodná
          } else {
            p.fill(34, 139, 34, 180); // Štandardná zelená
          }
          const leafSize = mapRange(thickness, 1, baseTrunkWidth * 0.3, 8, 16);
          p.ellipse(0, -leafSize / 2, leafSize * p.random(0.7, 0.9), leafSize * p.random(0.9,1.1)); // Náhodnosť veľkosti listov
          return;
        }

        const brownR = p.map(thickness, 1, baseTrunkWidth, 100, 160);
        const brownG = p.map(thickness, 1, baseTrunkWidth, 50, 80);
        const brownB = p.map(thickness, 1, baseTrunkWidth, 10, 40);
        p.stroke(brownR, brownG, brownB);
        p.strokeWeight(thickness);
        p.line(0, 0, 0, -len);

        p.translate(0, -len);

        // Pravá vetva
        p.push();
        p.rotate(branchingAngle + p.random(-5, 5));
        drawBranch(len * lengthRatio, thickness * 0.7, level + 1);
        p.pop();

        // Ľavá vetva
        p.push();
        p.rotate(-branchingAngle + p.random(-5, 5));
        drawBranch(len * lengthRatio, thickness * 0.7, level + 1);
        p.pop();

        // Voliteľne: stredná vetva pre hustejší strom
        if (len > minBranchLength * 2.5 && p.random(1) < 0.3) {
          p.push();
          p.rotate(p.random(-7, 7));
          drawBranch(len * lengthRatio * p.random(0.75, 0.85), thickness * 0.6, level + 1);
          p.pop();
        }
      };

      p.setup = () => {
        p.createCanvas(400, 400).parent(sketchRef.current);
        p.angleMode(p.DEGREES);
        updateTreeParameters(totalDaysCompleted, growthFactor); // Iniciálne nastavenie parametrov
        p.noLoop(); // Kreslíme len keď je to potrebné (cez redraw)
        p.redraw(); // Prvé vykreslenie
      };

      p.draw = () => {
        // Gradient oblohy
        for (let i = 0; i <= p.height / 2; i++) {
          let inter = p.map(i, 0, p.height / 2, 0, 1);
          let c = p.lerpColor(p.color(135, 206, 250), p.color(220, 240, 255), inter);
          p.stroke(c);
          p.line(0, i, p.width, i);
        }
        // Tráva (viac vrstiev pre hĺbku)
        p.noStroke();
        p.fill(107, 142, 35, 200);
        p.rect(0, p.height - 60, p.width, 60);
        p.fill(85, 107, 47, 180);
        p.rect(0, p.height - 45, p.width, 45);
        p.fill(34, 139, 34, 150);
        p.rect(0, p.height - 30, p.width, 30);

        // Kreslenie stromu
        p.push();
        p.translate(p.width / 2, p.height - 30); // Počiatok na stred spodku (na tráve)
        drawBranch(baseTrunkLength, baseTrunkWidth, 1);
        p.pop();
      };

      // Metóda, ktorú bude React volať na aktualizáciu dát a prekreslenie
      p.updateWithProps = (props) => {
        updateTreeParameters(props.totalDaysCompleted, props.growthFactor);
        if (p.width > 0 && p.height > 0) { // Uisti sa, že canvas je pripravený
          p.redraw();
        }
      };
    };
    // --- Koniec definície p5 skice ---


    // Inicializácia p5 alebo aktualizácia existujúcej inštancie
    if (!p5InstanceRef.current) {
      // Vytvor novú p5 inštanciu, ak ešte neexistuje
      p5InstanceRef.current = new p5(sketch);
    } else {
      // Ak p5 inštancia už existuje, len jej pošli nové props
      p5InstanceRef.current.updateWithProps({ growthFactor, totalDaysCompleted });
    }

    // Cleanup funkcia - odstráni p5 inštanciu, keď sa komponent odmontuje
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null; // Vyčisti ref
      }
    };
  }, [growthFactor, totalDaysCompleted]); // Tento useEffect sa spustí, keď sa zmenia props

  return <div ref={sketchRef} className="tree-canvas-container"></div>;
}

export default TreeVisualizer;