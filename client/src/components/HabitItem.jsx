import React from 'react';
import './HabitItem.css';

// Pridáme onDelete ako prop
function HabitItem({ habit, onToggle, onDelete }) {
  return (
    <li className={`habit-item ${habit.completedToday ? 'completed' : ''}`}>
      <div className="habit-info">
        <span className="habit-name">{habit.name}</span>
        <small>(Celkovo splnené: {habit.daysCompleted || 0} dní)</small>
      </div>
      <div className="habit-actions"> {/* Wrapper pre tlačidlá */}
        <button className="toggle-btn" onClick={() => onToggle(habit.id)}>
          {habit.completedToday ? 'Odznačiť' : 'Splnené'}
        </button>
        {/* Tlačidlo na mazanie */}
        <button className="delete-btn" onClick={() => onDelete(habit.id)} title="Odstrániť návyk">
          🗑️
        </button>
      </div>
    </li>
  );
}

export default HabitItem;