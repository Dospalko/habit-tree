import React from 'react';
import HabitItem from './HabitItem';

function HabitList({ habits, onToggleHabit, onDeleteHabit }) {
  if (!habits || habits.length === 0) {
    return null;
  }
  // space-y-4 sa presunul do rodiča v App.jsx
  return (
    <ul>
      {habits.map(habit => (
        <HabitItem key={habit.id} habit={habit} onToggle={onToggleHabit} onDelete={onDeleteHabit} />
      ))}
    </ul>
  );
}

export default HabitList;