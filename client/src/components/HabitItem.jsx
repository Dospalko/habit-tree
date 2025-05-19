// client/src/components/HabitItem.jsx
import React from 'react';
import './HabitItem.css';

function HabitItem({ habit, onToggle }) {
  return (
    <li className={`habit-item ${habit.completedToday ? 'completed' : ''}`}>
      <span>
        {habit.name}
        <small>(Celkovo splnené: {habit.daysCompleted || 0} dní)</small>
      </span>
      <button onClick={() => onToggle(habit.id)}>
        {habit.completedToday ? 'Odznačiť' : 'Splnené'} {/* Zmenil som text "Splnené dnes" na "Splnené" */}
      </button>
    </li>
  );
}

export default HabitItem;