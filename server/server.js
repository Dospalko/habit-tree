// server/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let habits = [
  { id: 1, name: 'Meditovať 10 minút', completedToday: false, daysCompleted: 5 }, // Príklad s daysCompleted
  { id: 2, name: 'Prečítať 1 kapitolu knihy', completedToday: false, daysCompleted: 2 },
];
let nextHabitId = 3;

app.get('/api/habits', (req, res) => {
  res.json(habits);
});

app.post('/api/habits', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") { // Kontrola prázdneho názvu
    return res.status(400).json({ error: 'Názov návyku je povinný' });
  }
  const newHabit = { id: nextHabitId++, name: name.trim(), completedToday: false, daysCompleted: 0 };
  habits.push(newHabit);
  res.status(201).json(newHabit);
});

app.post('/api/habits/:id/toggle', (req, res) => {
  const habitId = parseInt(req.params.id);
  const habitIndex = habits.findIndex(h => h.id === habitId); // Nájdi index pre prípadnú aktualizáciu

  if (habitIndex !== -1) {
    const habit = habits[habitIndex];
    const wasCompletedToday = habit.completedToday;

    // Vytvoríme nový objekt namiesto mutácie existujúceho pre lepšiu prax
    const updatedHabit = { ...habit };

    updatedHabit.completedToday = !updatedHabit.completedToday;

    if (updatedHabit.completedToday) { // Návyk bol práve označený ako splnený
      updatedHabit.daysCompleted = (updatedHabit.daysCompleted || 0) + 1;
    } else if (wasCompletedToday) { // Návyk bol splnený a teraz je odznačený
      updatedHabit.daysCompleted = Math.max(0, (updatedHabit.daysCompleted || 0) - 1);
    }
    // Ak nebol predtým splnený a teraz je odznačený (čo by sa nemalo stať s UI, ale pre istotu), daysCompleted sa nemení

    habits[habitIndex] = updatedHabit; // Aktualizuj pole na serveri
    res.json(updatedHabit); // Vráť celý aktualizovaný objekt
  } else {
    res.status(404).json({ error: 'Návyk nebol nájdený' });
  }
});

app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
});