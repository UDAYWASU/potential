import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import AdminDashboard from "./pages/dashboards/AdminDashboard";
import TpoDashboard from "./pages/dashboards/TpoDashboard";
import DepartmentDashboard from "./pages/dashboards/DepartmentDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import RegisterPage from "./pages/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public routes */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        {/* Protected routes */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ADMIN */}

          <Route
            element={
              <RoleRoute allowedRole="ADMIN" />
            }
          >
            <Route
              path="/admin"
              element={<AdminDashboard />}
            />
          </Route>

          {/* TPO */}

          <Route
            element={
              <RoleRoute allowedRole="TPO" />
            }
          >
            <Route
              path="/tpo"
              element={<TpoDashboard />}
            />
          </Route>

          {/* DEPARTMENT */}

          <Route
            element={
              <RoleRoute allowedRole="DEPARTMENT" />
            }
          >
            <Route
              path="/department"
              element={<DepartmentDashboard />}
            />
          </Route>

          {/* STUDENT */}

          <Route
            element={
              <RoleRoute allowedRole="STUDENT" />
            }
          >
            <Route
              path="/student"
              element={<StudentDashboard />}
            />
          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;