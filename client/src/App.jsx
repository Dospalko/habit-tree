import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import HabitList from './components/HabitList';
import NightSkyVisualizer from './components/NightSkyVisualizer';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/habits`);
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
      await axios.post(`${API_URL}/habits`, { name: newHabitName.trim() });
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
      <div className="flex justify-center items-center min-h-screen bg-cosmic-bg">
        {/* Jednoduchý spinner alebo animácia */}
        <div className="w-16 h-16 border-4 border-cosmic-accent-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-xl text-cosmic-accent-primary italic font-nunito">Loading your cosmos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cosmic-bg text-cosmic-text-main p-4 md:p-8 font-nunito selection:bg-cosmic-accent-primary selection:text-white">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10 md:mb-16 animate-subtle-float">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-merriweather text-transparent bg-clip-text bg-gradient-to-br from-cosmic-accent-primary via-purple-400 to-cosmic-accent-secondary filter drop-shadow-[0_0_8px_rgba(160,32,240,0.5)]">
            My Cosmic Habits
          </h1>
        </header>

        <main className="flex flex-col lg:flex-row gap-6 md:gap-10">
          {/* Sekcia Návykov */}
          <section className="lg:w-2/5 bg-cosmic-card p-6 py-8 rounded-2xl shadow-2xl shadow-cosmic-card/30 border border-cosmic-border relative overflow-hidden">
            {/* Jemný gradient overlay pre hĺbku */}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-cosmic-accent-primary/30 to-transparent rounded-2xl"></div>
            <div className="relative z-10"> {/* Obsah nad gradientom */}
              <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cosmic-accent-primary to-purple-400 mb-8 text-center">
                Daily Quests
              </h2>
              <form onSubmit={handleAddHabit} className="flex gap-3 mb-8">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="New quest (e.g., 15min coding)..."
                  className="flex-grow p-3 bg-cosmic-input-bg border border-cosmic-border rounded-lg text-cosmic-text-main placeholder-cosmic-text-muted focus:ring-2 focus:ring-cosmic-accent-primary focus:border-transparent outline-none transition-all duration-300"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-cosmic-accent-primary to-purple-600 hover:from-cosmic-accent-primary-hover hover:to-purple-700 text-white font-semibold py-3 px-5 rounded-lg shadow-lg hover:shadow-glow-primary transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cosmic-accent-primary focus:ring-offset-2 focus:ring-offset-cosmic-card"
                >
                  Add
                </button>
              </form>
              <div className="max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {habits.length > 0 ? (
                  <HabitList habits={habits} onToggleHabit={toggleHabitCompletion} onDeleteHabit={handleDeleteHabit} />
                ) : (
                  <p className="text-center text-cosmic-text-muted italic py-8">
                    Embark on your first quest and illuminate a star!
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Sekcia Vizualizácie */}
          <section className="lg:w-3/5 bg-cosmic-card p-6 py-8 rounded-2xl shadow-2xl shadow-cosmic-card/30 border border-cosmic-border flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-gradient-to-bl from-cosmic-accent-secondary/30 to-transparent rounded-2xl"></div>
            <div className="relative z-10 w-full"> {/* Obsah nad gradientom */}
              <h2 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cosmic-accent-secondary to-orange-400 mb-8 text-center">
                Constellation of Progress
              </h2>
              <NightSkyVisualizer habits={habits} />
              <p className="text-center mt-6 text-cosmic-text-muted text-sm">
                Stars in your sky: <strong className="text-cosmic-accent-secondary font-medium">{habits.length}</strong>
              </p>
            </div>
          </section>
        </main>
         <footer className="text-center mt-16 mb-8">
            <p className="text-cosmic-text-muted text-xs">
                Crafted with cosmic energy & Tailwind CSS.
            </p>
        </footer>
      </div>
    </div>
  );
}

export default App;