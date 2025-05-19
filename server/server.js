// server/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001; // Alebo iný port, ak je 3000 obsadený frontendom

app.use(cors()); // Povolenie Cross-Origin Resource Sharing
app.use(express.json()); // Pre spracovanie JSON body v requestoch

// V pamäti uložené dáta pre prototyp
let habits = [
  { id: 1, name: 'Meditovať 10 minút', completedToday: false, daysCompleted: 0 },
  { id: 2, name: 'Prečítať 1 kapitolu knihy', completedToday: false, daysCompleted: 0 },
];
let nextHabitId = 3;

// ------- API Endpoints -------

// Získať všetky návyky
app.get('/api/habits', (req, res) => {
  res.json(habits);
});

// Pridať nový návyk
app.post('/api/habits', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Názov návyku je povinný' });
  }
  const newHabit = { id: nextHabitId++, name, completedToday: false, daysCompleted: 0 };
  habits.push(newHabit);
  res.status(201).json(newHabit);
});

// Označiť návyk ako splnený/nesplnený
app.post('/api/habits/:id/toggle', (req, res) => {
  const habitId = parseInt(req.params.id);
  const habit = habits.find(h => h.id === habitId);

  if (habit) {
    habit.completedToday = !habit.completedToday; // Prepnúť stav
    if (habit.completedToday) {
        habit.daysCompleted = (habit.daysCompleted || 0) + 1; // Inkrementuj len ak sa označuje ako splnený
    } else {
        // Ak sa označuje ako nesplnený a predtým bol splnený, znížime (ak chceme takúto logiku)
        // Pre jednoduchosť to môžeme nechať, alebo resetovať len completedToday
        // Ak chceme, aby sa daysCompleted dalo aj znížiť (napr. ak sa užívateľ pomýlil)
        // if (habit.daysCompleted > 0) habit.daysCompleted--;
    }
    res.json(habit);
  } else {
    res.status(404).json({ error: 'Návyk nebol nájdený' });
  }
});


app.listen(PORT, () => {
  console.log(`Server beží na http://localhost:${PORT}`);
});