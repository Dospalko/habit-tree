// client/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import HabitList from './components/HabitList';
import TreeVisualizer from './components/TreeVisualizer';
import './App.css'; // Vytvoríme si neskôr

const API_URL = 'http://localhost:3001/api'; // Backend URL

function App() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');

  const fetchHabits = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/habits`);
      setHabits(response.data);
    } catch (error) {
      console.error("Chyba pri načítaní návykov:", error);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/habits`, { name: newHabitName });
      setHabits([...habits, response.data]);
      setNewHabitName('');
    } catch (error) {
      console.error("Chyba pri pridávaní návyku:", error);
    }
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      // Optimistic update
      const originalHabits = [...habits];
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habitId ? { ...h, completedToday: !h.completedToday, daysCompleted: h.completedToday ? (h.daysCompleted > 0 ? h.daysCompleted -1 : 0) : h.daysCompleted + 1 } : h
        )
      );

      await axios.post(`${API_URL}/habits/${habitId}/toggle`);
      // Ak by API zlyhalo, vrátime späť pôvodný stav (tu pre jednoduchosť vynechané)
      // Pre istotu môžeme znova načítať po úspešnom toggle, alebo veriť odpovedi z API
      fetchHabits(); // Re-fetch to ensure sync, alebo použi odpoveď z toggle endpointu
    } catch (error) {
      console.error("Chyba pri označovaní návyku:", error);
      // Rollback optimistic update
      // setHabits(originalHabits); // Ak by sme implementovali rollback
    }
  };

  // Vypočítame "rastový faktor" pre strom na základe splnených návykov
  // Pre prototyp to môže byť jednoducho celkový počet `daysCompleted` alebo počet `completedToday`
  const growthFactor = habits.reduce((acc, habit) => acc + (habit.completedToday ? 1 : 0), 0);
  const totalDaysCompleted = habits.reduce((acc, habit) => acc + (habit.daysCompleted || 0), 0);


  return (
    <div className="app-container">
      <header>
        <h1>Môj Návykový Strom</h1>
      </header>
      <main>
        <section className="habits-section">
          <h2>Moje Návyky</h2>
          <form onSubmit={handleAddHabit} className="add-habit-form">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Nový návyk..."
            />
            <button type="submit">Pridať</button>
          </form>
          <HabitList habits={habits} onToggleHabit={toggleHabitCompletion} />
        </section>
        <section className="tree-section">
          <h2>Strom Progresu</h2>
          <TreeVisualizer growthFactor={growthFactor} totalDaysCompleted={totalDaysCompleted} />
        </section>
      </main>
    </div>
  );
}

export default App;