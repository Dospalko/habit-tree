// client/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import HabitList from './components/HabitList';
import TreeVisualizer from './components/TreeVisualizer';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Pridaný stav pre načítanie

  const fetchHabits = useCallback(async () => {
    setIsLoading(true); // Začni načítavať
    try {
      const response = await axios.get(`${API_URL}/habits`);
      setHabits(response.data);
    } catch (error) {
      console.error("Chyba pri načítaní návykov:", error);
      // Tu by mohla byť notifikácia pre užívateľa
    } finally {
      setIsLoading(false); // Ukonči načítavanie
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    try {
      const response = await axios.post(`${API_URL}/habits`, { name: newHabitName.trim() });
      setHabits(prevHabits => [...prevHabits, response.data]); // Pridaj nový návyk na koniec zoznamu
      setNewHabitName('');
    } catch (error) {
      console.error("Chyba pri pridávaní návyku:", error);
      // Notifikácia pre užívateľa
    }
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const response = await axios.post(`${API_URL}/habits/${habitId}/toggle`);
      const updatedHabit = response.data; // Server vráti celý aktualizovaný návyk

      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habitId ? updatedHabit : h // Nahraď starý návyk aktualizovaným
        )
      );
    } catch (error) {
      console.error("Chyba pri označovaní návyku:", error);
      // Notifikácia pre užívateľa, prípadne opätovné načítanie fetchHabits() pre synchronizáciu
    }
  };

  const growthFactor = habits.reduce((acc, habit) => acc + (habit.completedToday ? 1 : 0), 0);
  // totalDaysCompleted sa používa pre trunkHeight a leafSize, môže ostať
  const totalDaysCompletedForTree = habits.reduce((acc, habit) => acc + (habit.daysCompleted || 0), 0);

  if (isLoading) {
    return <div className="app-container"><p style={{textAlign: 'center', fontSize: '1.2em'}}>Načítavam návyky...</p></div>;
  }

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
              placeholder="Názov nového návyku..."
            />
            <button type="submit">Pridať návyk</button>
          </form>
          {habits.length > 0 ? (
            <HabitList habits={habits} onToggleHabit={toggleHabitCompletion} />
          ) : (
            <p style={{textAlign: 'center', color: '#7f8c8d', padding: '20px 0'}}>
              Zatiaľ žiadne návyky. Začni kliknutím na "Pridať návyk"!
            </p>
          )}
        </section>
        <section className="tree-section">
          <h2>Strom Progresu</h2>
          <TreeVisualizer
            growthFactor={growthFactor}
            totalDaysCompleted={totalDaysCompletedForTree}
          />
           {/* Prípadné štatistiky alebo text pod stromom */}
           <p style={{textAlign: 'center', marginTop: '15px', color: '#555'}}>
            Dnes splnené: {growthFactor} | Celkovo dní s progresom: {totalDaysCompletedForTree}
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;