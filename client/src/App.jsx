import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import HabitList from './components/HabitList';
import TreeVisualizer from './components/TreeVisualizer';
import './App.css'; // Uisti sa, že je importovaný

const API_URL = 'http://localhost:3001/api';

function App() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/habits`);
      setHabits(response.data);
    } catch (error) {
      console.error("Chyba pri načítaní návykov:", error);
      // TODO: Zobraziť chybu používateľovi
    } finally {
      setIsLoading(false);
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
      setHabits(prevHabits => [...prevHabits, response.data]);
      setNewHabitName('');
    } catch (error) {
      console.error("Chyba pri pridávaní návyku:", error);
      // TODO: Zobraziť chybu používateľovi
    }
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const response = await axios.post(`${API_URL}/habits/${habitId}/toggle`);
      const updatedHabit = response.data;
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habitId ? updatedHabit : h
        )
      );
    } catch (error) {
      console.error("Chyba pri označovaní návyku:", error);
      // TODO: Zobraziť chybu používateľovi
    }
  };

  // Výpočty pre strom ostávajú rovnaké
  const growthFactor = habits.reduce((acc, habit) => acc + (habit.completedToday ? 1 : 0), 0);
  const totalDaysCompletedForTree = habits.reduce((acc, habit) => acc + (habit.daysCompleted || 0), 0);

  if (isLoading) {
    return (
      <div className="app-container">
        <p className="loading-message">Načítavam Tvoj les návykov...</p>
      </div>
    );
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
              placeholder="Napr. Ranná jóga, Čítanie knihy..."
            />
            <button type="submit">Pridať</button>
          </form>
          {habits.length > 0 ? (
            <HabitList habits={habits} onToggleHabit={toggleHabitCompletion} />
          ) : (
            <p className="no-habits-message">
              Zatiaľ žiadne návyky. Pridaj si prvý a sleduj, ako Tvoj strom rastie!
            </p>
          )}
        </section>
        <section className="tree-section">
          <h2>Strom Progresu</h2>
          <TreeVisualizer
            growthFactor={growthFactor}
            totalDaysCompleted={totalDaysCompletedForTree}
          />
           <p style={{textAlign: 'center', marginTop: '5px', color: 'var(--text-medium)', fontSize: '0.95em'}}>
            Dnes splnené: <strong>{growthFactor}</strong> | Celkovo dní s progresom: <strong>{totalDaysCompletedForTree}</strong>
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;