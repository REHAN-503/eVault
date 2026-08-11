import Login from './Login';

// The landing page IS the login page — a single unified
// two-panel composition as shown in the reference design.
// The "/" route renders the same visual as "/login".
export default function Landing() {
  return <Login />;
}