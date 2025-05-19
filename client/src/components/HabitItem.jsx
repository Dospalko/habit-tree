import React from 'react';
import './HabitItem.css'; // Uisti sa, že je importovaný

function HabitItem({ habit, onToggle }) {
  return (
    <li className={`habit-item ${habit.completedToday ? 'completed' : ''}`}>
      <div className="habit-info"> {/* Nový wrapper */}
        <span className="habit-name">{habit.name}</span>
        <small>(Celkovo splnené: {habit.daysCompleted || 0} dní)</small>
      </div>
      <button onClick={() => onToggle(habit.id)}>
        {habit.completedToday ? 'Odznačiť' : 'Splnené'}
      </button>
    </li>
  );
}

export default HabitItem;