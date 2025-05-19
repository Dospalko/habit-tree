import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import './TreeVisualizer.css'; // CSS ostáva pre kontajner

// Helper funkcia pre mapovanie hodnoty z jedného rozsahu do druhého
const mapRange = (value, inMin, inMax, outMin, outMax) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

function TreeVisualizer({ growthFactor, totalDaysCompleted }) {
  const sketchRef = useRef();

  useEffect(() => {
    let currentSketch;

    const sketch = (p) => {
      // --- Nastavenia pre strom ---
      let baseTrunkLength;
      let baseTrunkWidth;
      let branchingAngle; // Uhol vetvenia
      let lengthRatio;   // Pomer skrátenia každej novej vetvy
      let minBranchLength;
      let maxDepth; // Maximálna hĺbka rekurzie

      // Funkcia na kreslenie jednej vetvy a rekurzívne volanie pre ďalšie
      const drawBranch = (len, thickness, level) => {
        if (len < minBranchLength || level > maxDepth) {
          // Sme na konci vetvy, môžeme nakresliť list
          p.noStroke();
          // Ak je growthFactor > 0 a sme na vyššej úrovni (tenšie vetvičky), dajme sviežejšie listy
          const isFreshGrowth = growthFactor > 0 && level > maxDepth * 0.6;
          if (isFreshGrowth) {
            p.fill(100, 220, 100, 200); // Svieža zelená pre nový rast
          } else {
            p.fill(34, 139, 34, 180); // Štandardná zelená
          }
          // Veľkosť listu môže závisieť od levelu alebo byť fixná
          const leafSize = mapRange(thickness, 1, baseTrunkWidth*0.3, 8, 15);
          p.ellipse(0, -leafSize / 2, leafSize * 0.8, leafSize);
          return;
        }

        // Farba a hrúbka vetvy
        // Hnedá, ktorá sa môže mierne meniť s hrúbkou
        const brownR = p.map(thickness, 1, baseTrunkWidth, 100, 160);
        const brownG = p.map(thickness, 1, baseTrunkWidth, 50, 80);
        const brownB = p.map(thickness, 1, baseTrunkWidth, 10, 40);
        p.stroke(brownR, brownG, brownB);
        p.strokeWeight(thickness);
        p.line(0, 0, 0, -len); // Nakresli vetvu smerom hore

        p.translate(0, -len); // Posuň sa na koniec vetvy

        // Pravá vetva
        p.push();
        p.rotate(branchingAngle + p.random(-5, 5)); // Pridaj trochu náhodnosti do uhla
        drawBranch(len * lengthRatio, thickness * 0.7, level + 1);
        p.pop();

        // Ľavá vetva
        p.push();
        p.rotate(-branchingAngle + p.random(-5, 5)); // Pridaj trochu náhodnosti do uhla
        drawBranch(len * lengthRatio, thickness * 0.7, level + 1);
        p.pop();

        // Voliteľne: stredná vetva, ak chceme hustejší strom
        if (len > minBranchLength * 2.5 && Math.random() < 0.3) { // Nie vždy
          p.push();
          p.rotate(p.random(-5, 5)); // Menší náhodný uhol pre strednú vetvu
          drawBranch(len * lengthRatio * 0.8, thickness * 0.6, level + 1);
          p.pop();
        }
      };

      p.setup = () => {
        p.createCanvas(400, 400).parent(sketchRef.current);
        p.angleMode(p.DEGREES);
        p.noLoop(); // Prekreslíme len keď sa zmenia props
      };

      p.draw = () => {
        // ----- Pozadie -----
        // Gradient oblohy
        for (let i = 0; i <= p.height / 2; i++) {
          let inter = p.map(i, 0, p.height / 2, 0, 1);
          let c = p.lerpColor(p.color(135, 206, 250), p.color(220, 240, 255), inter); // Tmavšia hore, svetlejšia dole
          p.stroke(c);
          p.line(0, i, p.width, i);
        }
        // Tráva (viac vrstiev pre hĺbku)
        p.noStroke();
        p.fill(107, 142, 35, 200); // Olivovo zelená
        p.rect(0, p.height - 60, p.width, 60);
        p.fill(85, 107, 47, 180); // Tmavšia olivovo zelená
        p.rect(0, p.height - 45, p.width, 45);
        p.fill(34, 139, 34, 150); // Lesná zelená
        p.rect(0, p.height - 30, p.width, 30);


        // ----- Vypočítaj parametre stromu na základe props -----
        // totalDaysCompleted ovplyvňuje celkovú veľkosť/dospelosť stromu
        baseTrunkLength = mapRange(totalDaysCompleted, 0, 100, 30, 100); // Max 100 dní pre plnú výšku
        baseTrunkLength = p.constrain(baseTrunkLength, 20, 100);

        baseTrunkWidth = mapRange(totalDaysCompleted, 0, 100, 3, 15);
        baseTrunkWidth = p.constrain(baseTrunkWidth, 2, 15);

        // growthFactor (dnešné splnené) ovplyvňuje "čerstvosť" - riešené v drawBranch
        // Pre tento príklad je growthFactor premenná dostupná globálne v skicári,
        // ak ju p.updateWithProps nastaví.

        // Statické parametre pre štruktúru vetvenia
        branchingAngle = p.constrain(mapRange(totalDaysCompleted, 0, 50, 15, 30), 15, 35); // Uhol sa môže meniť s rastom
        lengthRatio = 0.70; // Každá nová vetva je 70% dĺžky predošlej
        minBranchLength = 4;
        maxDepth = p.constrain(Math.floor(mapRange(totalDaysCompleted, 0, 70, 3, 8)), 3, 8); // Max hĺbka rekurzie

        // ----- Kreslenie stromu -----
        p.push();
        p.translate(p.width / 2, p.height - 30); // Počiatok na stred spodku (na tráve)
        
        // Prvá "vetva" je kmeň
        drawBranch(baseTrunkLength, baseTrunkWidth, 1); // Začni kresliť od levelu 1
        
        p.pop();
      };

      p.updateWithProps = (props) => {
        // growthFactor a totalDaysCompleted sú už premenné v scope komponentu,
        // takže ich priamo používame v sketch premenných vyššie (baseTrunkLength atď.)
        // alebo priamo v drawBranch.
        // Ak sa zmenia, useEffect ich odchytí a vytvorí novú inštanciu sketch,
        // ktorá použije nové hodnoty.
        // Alternatívne, môžeme tu tieto hodnoty explicitne nastaviť do premenných v scope skice,
        // ak by sme nechceli nanovo vytvárať celú p5 inštanciu pri každej zmene.
        // Pre jednoduchosť zatiaľ nechávame re-inicializáciu.

        // Ak by sme chceli explicitne aktualizovať premenné bez re-inicializácie:
        /*
        if (props.growthFactor !== undefined) {
          // Tu by sme mohli uložiť props.growthFactor do nejakej premennej v scope `sketch`
          // napr. this.currentGrowthFactor = props.growthFactor; (ak by sketch bola trieda)
        }
        if (props.totalDaysCompleted !== undefined) {
          // Podobne pre totalDaysCompleted
        }
        */
        if (p.redraw && p.width > 0 && p.height > 0) { // Prekresli, len ak je canvas pripravený
          p.redraw();
        }
      };
    };

    currentSketch = new p5(sketch);
    // Počiatočné props nie sú v tomto modeli priamo posielané do updateWithProps,
    // pretože sketch funkcia priamo pristupuje k `growthFactor` a `totalDaysCompleted`
    // z uzáveru useEffect.

    return () => {
      currentSketch.remove();
    };
  }, [growthFactor, totalDaysCompleted]); // Spustí sa znova, ak sa zmení `growthFactor` alebo `totalDaysCompleted`

  return <div ref={sketchRef} className="tree-canvas-container"></div>;
}

export default TreeVisualizer;