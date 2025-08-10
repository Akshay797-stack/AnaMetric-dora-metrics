import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/contexts/ThemeContext";

describe("Navbar", () => {
  it("renders all navigation links and theme toggle", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
  });

  it("toggles theme on button click", async () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );
    const toggle = screen.getByLabelText(/theme/i);
    await userEvent.click(toggle);
    // Should update aria-pressed
    expect(toggle).toHaveAttribute("aria-pressed");
  });
});
