import React, { useState } from "react";
import ReactDOM from "react-dom";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ display: "flex" }}>
      <button onClick={() => setCount(count - 10)}>-10</button>
      <button onClick={() => setCount(count - 1)}>-1</button>

      <span data-testid="count" style={{ margin: "0 8px" }}>
        {count}
      </span>

      <button onClick={() => setCount(count + 1)}>+1</button>
      <button onClick={() => setCount(count + 10)}>+10</button>
    </div>
  );
}
