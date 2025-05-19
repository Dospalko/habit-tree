import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import HabitList from './components/HabitList';
import TreeVisualizer from './components/TreeVisualizer';
import './App.css';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/habits`);
      // Zoradenie návykov podľa dátumu vytvorenia pre konzistentné poradie vetiev
      const sortedHabits = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setHabits(sortedHabits);
    } catch (error) {
      console.error("Chyba pri načítaní návykov:", error);
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
      // Znova načítame všetky návyky, aby sme mali správne zoradenie a seed z backendu
      fetchHabits();
      setNewHabitName('');
    } catch (error) {
      console.error("Chyba pri pridávaní návyku:", error);
    }
  };

  const toggleHabitCompletion = async (habitId) => {
    try {
      const response = await axios.post(`${API_URL}/habits/${habitId}/toggle`);
      const updatedHabit = response.data;
      setHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habitId ? updatedHabit : h
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) // Udržuj zoradenie
      );
    } catch (error) {
      console.error("Chyba pri označovaní návyku:", error);
    }
  };

  // Odstránenie návyku pre testovanie
  const handleDeleteHabit = async (habitId) => {
    try {
        await axios.delete(`${API_URL}/habits/${habitId}`);
        fetchHabits(); // Znovu načítaj návyky
    } catch (error) {
        console.error("Chyba pri mazaní návyku:", error);
    }
  };


  // growthFactor pre celkovú "sviežosť" stromu (počet dnes splnených)
  const growthFactor = habits.reduce((acc, habit) => acc + (habit.completedToday ? 1 : 0), 0);

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
              placeholder="Napr. Ranná jóga..."
            />
            <button type="submit">Pridať</button>
          </form>
          {habits.length > 0 ? (
            // Upravíme HabitList, aby prijímal aj handleDelete
            <HabitList habits={habits} onToggleHabit={toggleHabitCompletion} onDeleteHabit={handleDeleteHabit} />
          ) : (
            <p className="no-habits-message">
              Zatiaľ žiadne návyky. Pridaj si prvý a sleduj, ako Tvoj strom rastie!
            </p>
          )}
        </section>
        <section className="tree-section">
          <h2>Strom Progresu</h2>
          <TreeVisualizer
            habits={habits} // Posielame celé pole návykov
            overallGrowthFactor={growthFactor} // Pre celkovú sviežosť
          />
          {/* Štatistiky môžu byť zjednodušené alebo odstránené, ak sa strom stará o vizualizáciu */}
          <p style={{textAlign: 'center', marginTop: '5px', color: 'var(--text-medium)', fontSize: '0.95em'}}>
             Počet návykov: <strong>{habits.length}</strong> | Dnes splnených: <strong>{growthFactor}</strong>
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;