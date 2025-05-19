// client/src/components/HabitItem.jsx
import React from 'react';
import './HabitItem.css'; // Vytvoríme si neskôr

function HabitItem({ habit, onToggle }) {
  return (
    <li className={`habit-item ${habit.completedToday ? 'completed' : ''}`}>
      <span>{habit.name} (Celkovo splnené: {habit.daysCompleted || 0} dní)</span>
      <button onClick={() => onToggle(habit.id)}>
        {habit.completedToday ? 'Odznačiť' : 'Splnené dnes'}
      </button>
    </li>
  );
}

export default HabitItem;