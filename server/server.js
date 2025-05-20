// server.js
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let habits = [
    // Príklady:
    // { id: "...", name: "Návyk 1", createdAt: "...", daysCompleted: 5, completedToday: true, lastCompletionDate: "...", starSeed: 12345 },
    // { id: "...", name: "Návyk 2", createdAt: "...", daysCompleted: 2, completedToday: false, lastCompletionDate: "...", starSeed: 67890 },
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
    lastCompletionDate: null,
    // Seed pre pozíciu a vzhľad hviezdy, môžeme použiť časť ID alebo generovať
    starSeed: parseInt(uuidv4().substring(0, 8), 16) // Unikátny seed pre každú hviezdu
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
  const today = new Date().toISOString().split('T')[0];

  if (habit.completedToday) {
    habit.completedToday = false;
    if (habit.lastCompletionDate && habit.lastCompletionDate.startsWith(today)) {
        habit.daysCompleted = Math.max(0, habit.daysCompleted - 1);
    }
  } else {
    habit.completedToday = true;
    if (!habit.lastCompletionDate || !habit.lastCompletionDate.startsWith(today)) {
        habit.daysCompleted += 1;
    }
    habit.lastCompletionDate = new Date().toISOString();
  }

  habits[habitIndex] = habit;
  res.json(habit);
});

// DELETE a habit
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