// src/components/Toolbar/ToolbarButton.tsx
import React from 'react';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
                                                              icon,
                                                              title,
                                                              onClick,
                                                              isActive,
                                                              disabled = false
                                                            }) => (
  <button
    className={`toolbar-button icon-button ${isActive ? 'active' : ''}`}
    onMouseDown={(e) => e.preventDefault()}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    disabled={disabled}
  >
    {icon}
  </button>
);
