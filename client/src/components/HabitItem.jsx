import React from 'react';
// Žiadny import HabitItem.css

function HabitItem({ habit, onToggle, onDelete }) {
  return (
    <li className={`
      flex justify-between items-center p-3.5 rounded-lg transition-all duration-200 border
      ${habit.completedToday
        ? 'bg-green-700/30 border-green-500 shadow-md shadow-green-500/20' // Jemnejšia žiara a pozadie
        : 'bg-gray-700/50 border-gray-600 hover:border-gray-500 hover:bg-gray-700/70'}
    `}>
      <div className="flex-grow mr-3">
        <span className={`
          font-semibold text-base md:text-lg
          ${habit.completedToday ? 'text-green-300 line-through' : 'text-gray-200'}
        `}>
          {habit.name}
        </span>
        <small className={`
          block text-xs 
          ${habit.completedToday ? 'text-green-400' : 'text-gray-400'}
        `}>
          (Splnené: {habit.daysCompleted || 0} dní)
        </small>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={() => onToggle(habit.id)}
          className={`
            py-1.5 px-3 md:py-2 md:px-4 rounded-md font-medium text-xs md:text-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
            ${habit.completedToday
              ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
              : 'bg-sky-600 hover:bg-sky-700 text-sky-100 focus:ring-sky-500'}
          `}
        >
          {habit.completedToday ? 'Odznačiť' : 'Splnené'}
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          title="Odstrániť návyk"
          className="p-1.5 md:p-2 rounded-md text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  );
}

export default HabitItem;