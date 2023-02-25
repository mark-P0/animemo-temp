import React from 'react';
import ReactDOM from 'react-dom/client';
import './tailwind.css';

function App() {
  return (
    <div className="h-screen bg-neutral-800 text-white grid place-items-center">Hello, world!</div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
