import {
  useAuth,
} from "../../context/AuthContext";

export default function StudentDashboard() {

  const {
    user,
    logout,
  } = useAuth();

  return (
    <main>

      <h1>
        Student Dashboard
      </h1>

      <p>
        Logged in as:
        {" "}
        {user?.email}
      </p>

      <button onClick={logout}>
        Logout
      </button>

    </main>
  );
}