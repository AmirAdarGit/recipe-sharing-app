import React from 'react';
import { Link } from 'react-router-dom';

const ActionTile = ({ 
  icon, 
  title, 
  description, 
  to, 
  isComingSoon = false,
  onClick 
}) => {
  const baseClasses = "bg-zinc-800 text-white p-6 rounded-xl shadow hover:scale-105 transition-transform duration-200 block";
  
  if (isComingSoon) {
    return (
      <div className={`${baseClasses} opacity-75 cursor-not-allowed`}>
        <div className="text-center">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-300 mb-4">{description}</p>
          <button 
            disabled 
            className="bg-indigo-500 text-white rounded px-4 py-2 disabled:opacity-50 cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    );
  }

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`${baseClasses} w-full text-left`}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-300 mb-4">{description}</p>
          <div className="bg-indigo-500 text-white rounded px-4 py-2 inline-block">
            Open
          </div>
        </div>
      </button>
    );
  }

  return (
    <Link to={to} className={baseClasses}>
      <div className="text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-300 mb-4">{description}</p>
        <div className="bg-indigo-500 text-white rounded px-4 py-2 inline-block">
          Open
        </div>
      </div>
    </Link>
  );
};

export default ActionTile;
