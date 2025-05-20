import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import HabitList from './components/HabitList';
import NightSkyVisualizer from './components/NightSkyVisualizer';
// Žiadny import App.css

const API_URL = 'http://localhost:3001/api'; // Uisti sa, že port je správny

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
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <p className="text-xl text-sky-300 italic">Načítavam Tvoju nočnú oblohu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 selection:bg-sky-500 selection:text-white">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10 md:mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-400 font-merriweather"> {/* Ak máš font nakonfigurovaný */}
            Moja Návyková Obloha
          </h1>
        </header>

        <main className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Sekcia Návykov */}
          <section className="lg:w-2/5 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
            <h2 className="text-2xl sm:text-3xl font-semibold text-sky-300 mb-6 text-center border-b border-gray-600 pb-3">
              Moje Návyky
            </h2>
            <form onSubmit={handleAddHabit} className="flex gap-3 mb-8">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Názov nového návyku..."
                className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Pridať
              </button>
            </form>
            <div className="max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar"> {/* max-h a overflow pre scroll */}
              {habits.length > 0 ? (
                <HabitList habits={habits} onToggleHabit={toggleHabitCompletion} onDeleteHabit={handleDeleteHabit} />
              ) : (
                <p className="text-center text-gray-400 italic py-6">
                  Pridaj svoj prvý návyk a rozsvieť svoju prvú hviezdu!
                </p>
              )}
            </div>
          </section>

          {/* Sekcia Vizualizácie */}
          <section className="lg:w-3/5 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700 flex flex-col items-center">
            <h2 className="text-2xl sm:text-3xl font-semibold text-sky-300 mb-6 text-center border-b border-gray-600 pb-3 w-full">
              Hviezdna Mapa Progresu
            </h2>
            <NightSkyVisualizer habits={habits} />
            <p className="text-center mt-4 text-sky-300 text-sm">
               Hviezd na oblohe: <strong className="font-medium">{habits.length}</strong>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;