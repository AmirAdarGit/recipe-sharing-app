import React from 'react';
import { Link } from 'react-router-dom';

interface ActionTileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to?: string;
  isComingSoon?: boolean;
  onClick?: () => void;
}

const ActionTile: React.FC<ActionTileProps> = ({
  icon,
  title,
  description,
  to,
  isComingSoon = false,
  onClick
}) => {
  const baseClasses = "theme-card theme-text-primary p-6 rounded-xl hover:scale-105 transition-all duration-200 block hover:shadow-lg";

  if (isComingSoon) {
    return (
      <div className={`${baseClasses} opacity-75 cursor-not-allowed`}>
        <div className="text-center">
          <div className="text-4xl mb-4">{icon}</div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm theme-text-secondary mb-4">{description}</p>
          <button
            disabled
            className="theme-button rounded px-4 py-2 disabled:opacity-50 cursor-not-allowed"
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
          <p className="text-sm theme-text-secondary mb-4">{description}</p>
          <div className="theme-button rounded px-4 py-2 inline-block">
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
        <p className="text-sm theme-text-secondary mb-4">{description}</p>
        <div className="theme-button rounded px-4 py-2 inline-block">
          Open
        </div>
      </div>
    </Link>
  );
};

export default ActionTile;
