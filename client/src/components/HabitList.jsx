import React from 'react';
import HabitItem from './HabitItem';
// Žiadny import HabitList.css

function HabitList({ habits, onToggleHabit, onDeleteHabit }) {
  // Kontrola sa už deje v App.jsx, ale pre istotu
  if (!habits || habits.length === 0) {
    return null;
  }
  return (
    <ul className="space-y-3"> {/* Pridáva medzeru medzi li prvkami */}
      {habits.map(habit => (
        <HabitItem key={habit.id} habit={habit} onToggle={onToggleHabit} onDelete={onDeleteHabit} />
      ))}
    </ul>
  );
}

export default HabitList;