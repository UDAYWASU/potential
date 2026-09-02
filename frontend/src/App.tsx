import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import AdminDashboard from "./pages/dashboards/AdminDashboard";
import TpoDashboard from "./pages/dashboards/TpoDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";

import DepartmentLayout from "./components/department/DepartmentLayout";
import DepartmentDashboard from "./pages/department/DepartmentDashboard";
import DepartmentStudents from "./pages/department/DepartmentStudents";
import DepartmentTests from "./pages/department/DepartmentTests";
import TestCreationPage from "./pages/department/TestCreationPage";

import DepartmentTestDetail from "./pages/department/DepartmentTestDetail";
import DepartmentStudentDetail from "./pages/department/DepartmentStudentDetail";
import DepartmentTestControls from "./pages/department/DepartmentTestControls";

import StudentTestAttempt from "./pages/student/StudentTestAttempt";


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

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


        {/* =====================================================
            PROTECTED ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute />}>

          {/* =================================================
              COMMON DASHBOARD
          ================================================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* =================================================
              ADMIN
          ================================================= */}

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


          {/* =================================================
              TPO
          ================================================= */}

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


          {/* =================================================
              DEPARTMENT
          ================================================= */}

          <Route
            element={
              <RoleRoute allowedRole="DEPARTMENT" />
            }
          >

            {/* Department Dashboard */}

            <Route
              path="/department"
              element={
                <DepartmentLayout>
                  <DepartmentDashboard />
                </DepartmentLayout>
              }
            />


            {/* Department Students */}

            <Route
              path="/department/students"
              element={
                <DepartmentLayout>
                  <DepartmentStudents />
                </DepartmentLayout>
              }
            />


            {/* Department Tests */}

            <Route
              path="/department/tests"
              element={
                <DepartmentLayout>
                  <DepartmentTests />
                </DepartmentLayout>
              }
            />


            {/* Create Test */}

            <Route
              path="/department/tests/create"
              element={
                <DepartmentLayout>
                  <TestCreationPage />
                </DepartmentLayout>
              }
            />


            {/* Test Detail */}

            <Route
              path="/department/tests/:testId"
              element={
                <DepartmentLayout>
                  <DepartmentTestDetail />
                </DepartmentLayout>
              }
            />


            {/* Test Controls */}

            <Route
              path="/department/test-controls"
              element={
                <DepartmentLayout>
                  <DepartmentTestControls />
                </DepartmentLayout>
              }
            />


            {/* Student Detail */}

            <Route
              path="/department/students/:studentId"
              element={
                <DepartmentLayout>
                  <DepartmentStudentDetail />
                </DepartmentLayout>
              }
            />

          </Route>


          {/* =================================================
              STUDENT
          ================================================= */}

          <Route
            element={
              <RoleRoute allowedRole="STUDENT" />
            }
          >

            {/* Student Dashboard */}

            <Route
              path="/student"
              element={<StudentDashboard />}
            />


            {/* =================================================
                4C — STUDENT TEST ATTEMPT

                IMPORTANT:
                This MUST match the URL used by
                StudentDashboard.tsx:

                /student/assignments/:assignmentId
            ================================================= */}

            <Route
  path="/student/tests/:assignmentId"
  element={<StudentTestAttempt />}
/>


          </Route>

        </Route>


        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;
