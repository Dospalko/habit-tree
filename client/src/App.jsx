import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import HabitList from './components/HabitList';
import NightSkyVisualizer from './components/NightSkyVisualizer'; // ZMENA NÁZVU
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
      // Zoradenie návykov pre konzistentné poradie hviezd
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
      // Po pridaní návyku na serveri, znovu načítaj všetky pre konzistenciu
      await axios.post(`${API_URL}/habits`, { name: newHabitName.trim() });
      fetchHabits(); // Znovu načítaj, aby sa zobrazil aj nový `starSeed`
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
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      );
    } catch (error) {
      console.error("Chyba pri označovaní návyku:", error);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
        await axios.delete(`${API_URL}/habits/${habitId}`);
        fetchHabits();
    } catch (error) {
        console.error("Chyba pri mazaní návyku:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <p className="loading-message">Načítavam Tvoju nočnú oblohu...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <h1>Moja Návyková Obloha</h1> {/* ZMENA NÁZVU APLIKÁCIE */}
      </header>
      <main>
        <section className="habits-section">
          <h2>Moje Návyky</h2>
          <form onSubmit={handleAddHabit} className="add-habit-form">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="Napr. Večerná prechádzka..."
            />
            <button type="submit">Pridať</button>
          </form>
          {habits.length > 0 ? (
            <HabitList habits={habits} onToggleHabit={toggleHabitCompletion} onDeleteHabit={handleDeleteHabit} />
          ) : (
            <p className="no-habits-message">
              Pridaj svoj prvý návyk a rozsvieť svoju prvú hviezdu!
            </p>
          )}
        </section>
        <section className="tree-section"> {/* CSS class môže ostať, ak sú štýly univerzálne */}
          <h2>Hviezdna Mapa Progresu</h2>
          <NightSkyVisualizer habits={habits} /> {/* ZMENA NÁZVU KOMPONENTU A PROPS */}
          <p style={{textAlign: 'center', marginTop: '5px', color: 'var(--text-medium)', fontSize: '0.95em'}}>
             Počet hviezd (návykov): <strong>{habits.length}</strong>
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;