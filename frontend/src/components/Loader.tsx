import React from "react";

export const Loader: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-500" role="status">
    <div className="w-10 h-10 border-4 border-orange-200 border-t-primary-600 rounded-full animate-spin mb-3" />
    <p>{message}</p>
  </div>
);

export const EmptyState: React.FC<{ icon?: string; message: string }> = ({
  icon = "🍽️",
  message,
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-500 text-center px-4">
    <span className="text-5xl mb-3" aria-hidden="true">
      {icon}
    </span>
    <p className="max-w-sm">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-red-500 text-center px-4">
    <span className="text-5xl mb-3" aria-hidden="true">
      ⚠️
    </span>
    <p>{message}</p>
  </div>
);
