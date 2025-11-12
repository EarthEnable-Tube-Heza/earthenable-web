import { render, screen, fireEvent } from '@testing-library/react';
import { Alert } from '../Alert';

describe('Alert Component', () => {
  it('renders with children', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('border-l-primary');

    rerender(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('border-l-status-success');

    rerender(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('border-l-status-warning');

    rerender(<Alert variant="error">Error</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('border-l-status-error');
  });

  it('renders with title', () => {
    render(<Alert title="Alert Title">Message</Alert>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('renders with icon by default', () => {
    const { container } = render(<Alert>With Icon</Alert>);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('hides icon when showIcon is false', () => {
    const { container } = render(<Alert showIcon={false}>No Icon</Alert>);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  it('renders dismiss button when dismissible', () => {
    render(<Alert dismissible>Dismissible Alert</Alert>);
    const dismissButton = screen.getByLabelText('Dismiss');
    expect(dismissButton).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = jest.fn();
    render(<Alert dismissible onDismiss={handleDismiss}>Alert</Alert>);

    const dismissButton = screen.getByLabelText('Dismiss');
    fireEvent.click(dismissButton);

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Alert className="custom-alert">Alert</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('custom-alert');
  });

  it('forwards ref to div element', () => {
    const ref = jest.fn();
    render(<Alert ref={ref}>Alert</Alert>);
    expect(ref).toHaveBeenCalled();
  });
});
