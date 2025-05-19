// client/src/components/HabitList.jsx
import React from 'react';
import HabitItem from './HabitItem';
import './HabitList.css'; // Vytvoríme si neskôr

function HabitList({ habits, onToggleHabit }) {
  if (!habits || habits.length === 0) {
    return <p>Zatiaľ žiadne návyky. Pridaj si nejaký!</p>;
  }
  return (
    <ul className="habit-list">
      {habits.map(habit => (
        <HabitItem key={habit.id} habit={habit} onToggle={onToggleHabit} />
      ))}
    </ul>
  );
}

export default HabitList;