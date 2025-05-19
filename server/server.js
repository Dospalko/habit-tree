// server.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // Na generovanie unikátnych ID

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let habits = [
  // Príklad počiatočných dát pre testovanie (môžete odstrániť)
  // { id: uuidv4(), name: "Meditovať 10 minút", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), daysCompleted: 2, completedToday: false, lastCompletionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  // { id: uuidv4(), name: "Prečítať 1 kapitolu knihy", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), daysCompleted: 3, completedToday: true, lastCompletionDate: new Date().toISOString() },
];

// GET all habits
app.get('/api/habits', (req, res) => {
  res.json(habits);
});

// POST a new habit
app.post('/api/habits', (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ message: 'Názov návyku je povinný.' });
  }
  const newHabit = {
    id: uuidv4(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    daysCompleted: 0,
    completedToday: false,
    lastCompletionDate: null, // Dátum posledného splnenia
    // Pridáme seed pre deterministické generovanie vetvy - môžeme použiť časť ID alebo timestamp
    branchSeed: parseInt(uuidv4().substring(0, 8), 16) // Príklad generovania seedu
  };
  habits.push(newHabit);
  res.status(201).json(newHabit);
});

// POST toggle habit completion
app.post('/api/habits/:id/toggle', (req, res) => {
  const { id } = req.params;
  const habitIndex = habits.findIndex(h => h.id === id);

  if (habitIndex === -1) {
    return res.status(404).json({ message: 'Návyk nebol nájdený.' });
  }

  const habit = habits[habitIndex];
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (habit.completedToday) {
    // Odznačujeme
    habit.completedToday = false;
    // Ak bol predtým splnený DNES, znížime daysCompleted. Inak by sa mohlo stať,
    // že užívateľ označí a odznačí v ten istý deň a počet dní sa zbytočne zvýši/zníži.
    // Pre jednoduchosť, ak odznačí, znížime, ak bol today jeho lastCompletionDate
    if (habit.lastCompletionDate && habit.lastCompletionDate.startsWith(today)) {
        habit.daysCompleted = Math.max(0, habit.daysCompleted - 1);
    }
    // Tu by mohla byť komplexnejšia logika pre lastCompletionDate, ak chceme presne sledovať, kedy bol posledný reálny splnený deň.
    // Pre jednoduchosť teraz len toggle.
  } else {
    // Označujeme ako splnené
    habit.completedToday = true;
    // Zvýšime daysCompleted len ak to nie je opätovné označenie v ten istý deň,
    // kedy už bol predtým splnený a potom odznačený.
    // Najjednoduchšie je, ak to nezapočítavame duplicitne za ten istý kalendárny deň.
    if (!habit.lastCompletionDate || !habit.lastCompletionDate.startsWith(today)) {
        habit.daysCompleted += 1;
    }
    habit.lastCompletionDate = new Date().toISOString();
  }

  habits[habitIndex] = habit;
  res.json(habit);
});

// DELETE a habit (voliteľné, ale dobré pre testovanie)
app.delete('/api/habits/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = habits.length;
    habits = habits.filter(h => h.id !== id);
    if (habits.length < initialLength) {
        res.status(200).json({ message: 'Návyk odstránený.' });
    } else {
        res.status(404).json({ message: 'Návyk nebol nájdený.' });
    }
});


app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
});