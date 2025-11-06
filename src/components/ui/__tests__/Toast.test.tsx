import { render, screen, waitFor } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders when visible is true', () => {
    render(<Toast visible={true} type="success" message="Success message" />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('does not render when visible is false', () => {
    render(<Toast visible={false} type="success" message="Hidden message" />);
    expect(screen.queryByText('Hidden message')).not.toBeInTheDocument();
  });

  it('renders with different types', () => {
    const { rerender } = render(<Toast visible={true} type="success" message="Success" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-[#2ecc71]');

    rerender(<Toast visible={true} type="error" message="Error" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-[#e74c3c]');

    rerender(<Toast visible={true} type="warning" message="Warning" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-[#f39c12]');

    rerender(<Toast visible={true} type="info" message="Info" />);
    expect(screen.getByRole('alert')).toHaveClass('bg-[#3498db]');
  });

  it('renders at top position by default', () => {
    render(<Toast visible={true} type="success" message="Top toast" />);
    expect(screen.getByRole('alert')).toHaveClass('top-4');
  });

  it('renders at bottom position when specified', () => {
    render(<Toast visible={true} type="success" message="Bottom toast" position="bottom" />);
    expect(screen.getByRole('alert')).toHaveClass('bottom-4');
  });

  it('renders with custom icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
    render(<Toast visible={true} type="success" message="Message" icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('auto-dismisses after duration', async () => {
    const handleDismiss = jest.fn();
    render(
      <Toast
        visible={true}
        type="success"
        message="Auto dismiss"
        duration={1000}
        onDismiss={handleDismiss}
      />
    );

    expect(screen.getByText('Auto dismiss')).toBeInTheDocument();

    // Fast-forward time by 1000ms
    jest.advanceTimersByTime(1000);

    // Wait for the animation to complete (300ms)
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(handleDismiss).toHaveBeenCalled();
    });
  });

  it('has accessible ARIA attributes', () => {
    render(<Toast visible={true} type="success" message="Accessible toast" />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});
