import React from 'react';

function HabitItem({ habit, onToggle, onDelete }) {
  const isCompleted = habit.completedToday;

  return (
    <li className={`
      flex justify-between items-center p-4 rounded-xl border transition-all duration-300 ease-in-out group
      ${isCompleted
        ? 'bg-cosmic-success/10 border-cosmic-success/60 shadow-glow-success hover:bg-cosmic-success/20'
        : 'bg-cosmic-input-bg/50 border-cosmic-border hover:border-cosmic-accent-primary/70 hover:bg-cosmic-input-bg/80'}
    `}>
      <div className="flex-grow mr-3 overflow-hidden"> {/* overflow-hidden pre text-ellipsis */}
        <span className={`
          font-semibold text-base md:text-lg block truncate {/* truncate pre dlhé názvy */}
          ${isCompleted ? 'text-cosmic-success line-through decoration-cosmic-success/70' : 'text-cosmic-text-main group-hover:text-cosmic-accent-primary'}
        `}>
          {habit.name}
        </span>
        <small className={`
          block text-xs 
          ${isCompleted ? 'text-cosmic-success/80' : 'text-cosmic-text-muted group-hover:text-cosmic-text-muted/80'}
        `}>
          (Illuminated: {habit.daysCompleted || 0} days)
        </small>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={() => onToggle(habit.id)}
          className={`
            py-2 px-4 rounded-lg font-medium text-xs md:text-sm transition-all duration-200 transform hover:scale-105
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cosmic-card
            ${isCompleted
              ? 'bg-cosmic-success/80 hover:bg-cosmic-success text-cosmic-bg font-semibold focus:ring-cosmic-success'
              : 'bg-cosmic-accent-primary hover:bg-cosmic-accent-primary-hover text-white focus:ring-cosmic-accent-primary'}
          `}
        >
          {isCompleted ? 'Dim' : 'Ignite'}
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          title="Remove quest"
          className="p-2 rounded-lg text-cosmic-danger/70 hover:bg-cosmic-danger/20 hover:text-cosmic-danger transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cosmic-danger focus:ring-offset-1 focus:ring-offset-cosmic-card"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </li>
  );
}

export default HabitItem;