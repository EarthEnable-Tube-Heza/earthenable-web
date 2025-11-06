import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders with label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<Input value="" onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-status-error');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Input size="sm" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-[2.25rem]');
    expect(screen.getByRole('textbox')).toHaveClass('text-sm');

    rerender(<Input size="md" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-[2.75rem]');
    expect(screen.getByRole('textbox')).toHaveClass('text-base');

    rerender(<Input size="lg" />);
    expect(screen.getByRole('textbox')).toHaveClass('h-[3.25rem]');
    expect(screen.getByRole('textbox')).toHaveClass('text-lg');
  });

  it('renders as disabled', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed');
    expect(input).toHaveClass('disabled:bg-background-light');
  });

  it('renders as required', () => {
    render(<Input label="Email" required />);
    expect(screen.getByRole('textbox')).toBeRequired();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with leftIcon', () => {
    const Icon = () => <svg data-testid="left-icon" />;
    render(<Input leftIcon={<Icon />} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with rightIcon', () => {
    const Icon = () => <svg data-testid="right-icon" />;
    render(<Input rightIcon={<Icon />} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<Input type="password" label="Password" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    expect(input).toHaveAttribute('type', 'text');

    fireEvent.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders with helper text', () => {
    render(<Input label="Email" helperText="Enter your work email" />);
    expect(screen.getByText('Enter your work email')).toBeInTheDocument();
  });

  it('forwards ref to input element', () => {
    const ref = jest.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });
});
