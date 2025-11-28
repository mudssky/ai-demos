import React from "react";

export default function App() {
  const [count, setCount] = React.useState(0);
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        padding: 24,
      }}
    >
      <h1>Hello React</h1>
      <p>This is a simple React TSX demo.</p>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        style={{ padding: 8, borderRadius: 6 }}
      >
        Clicked {count} times
      </button>
    </div>
  );
}
