// client/src/components/TreeVisualizer.jsx
import React, { useRef, useEffect } from 'react';
import p5 from 'p5';
import './TreeVisualizer.css'; // Vytvoríme si neskôr

// Helper funkcia pre mapovanie hodnoty z jedného rozsahu do druhého
const mapRange = (value, inMin, inMax, outMin, outMax) => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};


function TreeVisualizer({ growthFactor, totalDaysCompleted }) {
  const sketchRef = useRef();

  useEffect(() => {
    // `currentSketch` uchová inštanciu p5, aby sme ju mohli odstrániť
    let currentSketch;

    const sketch = (p) => {
      let trunkHeight;
      let trunkWidth;
      let numLeaves;
      let leafSize;

      p.setup = () => {
        p.createCanvas(400, 400).parent(sketchRef.current);
        p.angleMode(p.DEGREES); // Pre ľahšiu prácu s uhlami
        p.noLoop(); // Prekreslíme len keď sa zmenia props
      };

      p.draw = () => {
        p.background(220, 240, 255); // Svetlo modrá obloha

        // ----- Vypočítaj parametre stromu na základe props -----
        // growthFactor je počet návykov splnených dnes
        // totalDaysCompleted je celkový počet dní, kedy boli návyky splnené

        // Základná výška a šírka kmeňa
        trunkHeight = mapRange(totalDaysCompleted, 0, 50, 50, p.height - 100); // Rastie do max 50 splnených dní
        trunkHeight = p.constrain(trunkHeight, 50, p.height - 100); // Obmedzenie

        trunkWidth = mapRange(totalDaysCompleted, 0, 50, 10, 40);
        trunkWidth = p.constrain(trunkWidth, 10, 40);

        // Počet listov/vetiev na základe `growthFactor` (splnené dnes)
        numLeaves = p.constrain(growthFactor * 2, 0, 10); // Max 10 listov pre tento prototyp

        leafSize = p.constrain(mapRange(totalDaysCompleted, 0, 30, 5, 20), 5, 20);


        // ----- Kreslenie stromu -----
        p.push(); // Začni novú kresliacu transformáciu
        p.translate(p.width / 2, p.height - 30); // Posuň počiatok na stred spodnej časti plátna

        // Tráva
        p.fill(100, 200, 100);
        p.noStroke();
        p.rect(-p.width/2, 0, p.width, 30);


        // Kmeň
        p.fill(139, 69, 19); // Hnedá farba
        p.noStroke();
        p.rect(-trunkWidth / 2, 0, trunkWidth, -trunkHeight);

        // Jednoduché "listy" alebo "vetvy" na vrchu kmeňa
        // Tieto sa objavia, ak je dnes niečo splnené
        p.translate(0, -trunkHeight); // Posuň sa na vrch kmeňa

        for (let i = 0; i < numLeaves; i++) {
          p.push();
          // Náhodné natočenie a pozícia pre každý "list"
          // Rotácia okolo 0 je hore, 180 je dole. My chceme hore.
          let angle = p.map(i, 0, numLeaves, -60, 60); // Rozlož listy do oblúka
          if (numLeaves === 1) angle = 0; // Ak je len jeden, nech je v strede

          p.rotate(angle);

          // Farba listu (môže sa meniť na základe niečoho iného)
          p.fill(34, 139, 34, 200); // Zelená s trochou priehľadnosti
          p.ellipse(0, -leafSize, leafSize * 1.5, leafSize); // Kresli list
          p.pop();
        }
        p.pop(); // Ukonči kresliacu transformáciu
      };

      // Táto funkcia sa zavolá, keď sa zmenia props
      p.updateWithProps = (props) => {
        if (props.growthFactor !== undefined) {
          growthFactor = props.growthFactor;
        }
        if (props.totalDaysCompleted !== undefined) {
            totalDaysCompleted = props.totalDaysCompleted;
        }
        if(p.redraw) p.redraw(); // Ak sa p5 už inicializovalo, prekresli
      };
    };

    // Vytvor novú inštanciu p5 sketch a priraď ju currentSketch
    currentSketch = new p5(sketch);
    // Aktualizuj sketch s počiatočnými props
    currentSketch.updateWithProps({ growthFactor, totalDaysCompleted });


    // Cleanup funkcia, ktorá sa zavolá pri odmontovaní komponentu alebo pred ďalším useEffect
    return () => {
      currentSketch.remove();
    };
  }, [growthFactor, totalDaysCompleted]); // useEffect sa spustí znova, ak sa zmení growthFactor alebo totalDaysCompleted

  return <div ref={sketchRef} className="tree-canvas-container"></div>;
}

export default TreeVisualizer;