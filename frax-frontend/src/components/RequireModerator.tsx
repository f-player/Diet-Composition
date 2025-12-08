import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Navigate } from 'react-router-dom';

export const RequireModerator: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !user.moderator) return <Navigate to="/403" replace />;
  return children;
};

export default RequireModerator;
