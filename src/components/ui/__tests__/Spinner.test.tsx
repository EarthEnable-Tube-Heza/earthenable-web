import { render, screen } from "@testing-library/react";
import { Spinner } from "../Spinner";

describe("Spinner Component", () => {
  it("renders spinner", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
    expect(spinner).toHaveClass("rounded-full");
  });

  it("renders with different sizes", () => {
    const { rerender, container } = render(<Spinner size="xs" />);
    expect(container.querySelector(".animate-spin")).toHaveClass("w-4");

    rerender(<Spinner size="sm" />);
    expect(container.querySelector(".animate-spin")).toHaveClass("w-5");

    rerender(<Spinner size="md" />);
    expect(container.querySelector(".animate-spin")).toHaveClass("w-8");

    rerender(<Spinner size="lg" />);
    expect(container.querySelector(".animate-spin")).toHaveClass("w-12");

    rerender(<Spinner size="xl" />);
    expect(container.querySelector(".animate-spin")).toHaveClass("w-16");
  });

  it("renders with different variants", () => {
    const { rerender, container } = render(<Spinner variant="primary" />);
    expect(container.querySelector(".animate-spin")).toHaveClass("border-primary");

    rerender(<Spinner variant="secondary" />);
    expect(container.querySelector(".animate-spin")).toHaveClass("border-secondary");

    rerender(<Spinner variant="white" />);
    expect(container.querySelector(".animate-spin")).toHaveClass("border-white");
  });

  it("renders with label", () => {
    render(<Spinner label="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders centered", () => {
    const { container } = render(<Spinner centered />);
    const wrapper = container.querySelector('div[role="status"]');
    expect(wrapper).toHaveClass("w-full");
  });

  it("applies custom className", () => {
    const { container } = render(<Spinner className="custom-spinner" />);
    const wrapper = container.querySelector('div[role="status"]');
    expect(wrapper).toHaveClass("custom-spinner");
  });
});
