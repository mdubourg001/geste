import React, { useState, useCallback } from "react";
import { render, fireEvent } from "@testing-library/react";

const Counter = () => {
  const [count, setCount] = useState(42);

  const increment = useCallback(() => {
    setCount(count + 1);
  }, [count]);

  const decrement = useCallback(() => {
    setCount(count - 1);
  }, [count]);

  return (
    <div>
      <button data-testid="decrement" onClick={decrement}>
        -
      </button>
      <span data-testid="count">{count}</span>
      <button data-testid="increment" onClick={increment}>
        +
      </button>
    </div>
  );
};

test("react-testing-library", () => {
  const { getByTestId, getByText } = render(<Counter />);

  expect(getByTestId("count").innerHTML).toBe("42");

  fireEvent.click(getByText("-"));
  expect(getByTestId("count").innerHTML).toBe("41");

  fireEvent.click(getByText("+"));
  expect(getByTestId("count").innerHTML).toBe("42");
});
