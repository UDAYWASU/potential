import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

export default function Dashboard() {

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

  switch (user.role) {

    case "ADMIN":
      return (
        <Navigate
          to="/admin"
          replace
        />
      );

    case "TPO":
      return (
        <Navigate
          to="/tpo"
          replace
        />
      );

    case "DEPARTMENT":
      return (
        <Navigate
          to="/department"
          replace
        />
      );

    case "STUDENT":
      return (
        <Navigate
          to="/student"
          replace
        />
      );

    default:
      return (
        <Navigate
          to="/login"
          replace
        />
      );
  }
}