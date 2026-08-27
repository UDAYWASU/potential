import {
  useAuth,
} from "../../context/AuthContext";

export default function TpoDashboard() {

  const {
    user,
    logout,
  } = useAuth();

  return (
    <main>

      <h1>
        TPO Dashboard
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