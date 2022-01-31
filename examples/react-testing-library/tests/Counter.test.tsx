import React from "react";
import { render, fireEvent } from "@testing-library/react";

import { Counter } from "../Counter";

describe("Counter", () => {
  test("it renders with count 0", () => {
    const { getByTestId } = render(<Counter />);

    expect(getByTestId("count").innerHTML).toBe("0");
  });

  test("decrement button works", () => {
    const { getByTestId, getByText } = render(<Counter />);

    fireEvent.click(getByText("-1"));
    expect(getByTestId("count").innerHTML).toBe("-1");

    fireEvent.click(getByText("-10"));
    expect(getByTestId("count").innerHTML).toBe("-11");
  });

  test("increment button work", () => {
    const { getByTestId, getByText } = render(<Counter />);

    fireEvent.click(getByText("+1"));
    expect(getByTestId("count").innerHTML).toBe("1");

    fireEvent.click(getByText("+10"));
    expect(getByTestId("count").innerHTML).toBe("11");
  });
});
