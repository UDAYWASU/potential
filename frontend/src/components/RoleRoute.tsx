import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import type {
  UserRole,
} from "../api/auth";

interface RoleRouteProps {
  allowedRole: UserRole;
}

export default function RoleRoute({
  allowedRole,
}: RoleRouteProps) {

  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== allowedRole) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <Outlet />;
}