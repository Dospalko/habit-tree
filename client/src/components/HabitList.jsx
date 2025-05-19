import React from 'react';
import HabitItem from './HabitItem';
import './HabitList.css';

// Pridáme onDeleteHabit ako prop
function HabitList({ habits, onToggleHabit, onDeleteHabit }) {
  if (!habits || habits.length === 0) {
    // Tento text sa už nezobrazí, ak máme `no-habits-message` v App.jsx
    return null;
  }
  return (
    <ul className="habit-list">
      {habits.map(habit => (
        // Posunieme onDeleteHabit do HabitItem
        <HabitItem key={habit.id} habit={habit} onToggle={onToggleHabit} onDelete={onDeleteHabit} />
      ))}
    </ul>
  );
}

export default HabitList;