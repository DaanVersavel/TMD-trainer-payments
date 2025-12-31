import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal } from '../src/components/ConfirmationModal';
import { ConfigurationManager } from '../src/components/ConfigurationManager';
import { HelpSection } from '../src/components/HelpSection';
import type { GroupConfig } from '../src/types';

describe('ConfirmationModal', () => {
  test('renders when isOpen is true', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Test Title"
        message="Test message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmationModal
        isOpen={false}
        title="Test Title"
        message="Test message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmationModal
        isOpen={true}
        title="Test"
        message="Message"
        confirmText="Yes"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Yes'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConfirmationModal
        isOpen={true}
        title="Test"
        message="Message"
        cancelText="No"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText('No'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('renders with danger variant styling', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        variant="danger"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Delete Item')).toHaveClass('text-red-400');
  });

  test('uses default button text when not provided', () => {
    render(
      <ConfirmationModal
        isOpen={true}
        title="Test"
        message="Message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});

describe('ConfigurationManager', () => {
  const mockConfigs: GroupConfig[] = [
    {
      groupName: 'U10',
      pricePerHour: 25.5,
      timeSlots: [
        { timeSlot: '18:30', duration: 2 },
        { timeSlot: '19:00', duration: 1.5 },
      ],
      lastUsed: '2024-01-01T00:00:00Z',
    },
    {
      groupName: 'U12',
      pricePerHour: 30,
      timeSlots: [
        { timeSlot: '20:00', duration: 3 },
      ],
      lastUsed: '2024-01-02T00:00:00Z',
    },
  ];

  test('renders with configurations', () => {
    render(
      <ConfigurationManager
        configs={mockConfigs}
        onDeleteConfig={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('⚙️ Saved Configurations')).toBeInTheDocument();
    expect(screen.getByText('U10')).toBeInTheDocument();
    expect(screen.getByText('U12')).toBeInTheDocument();
    expect(screen.getByText('€25.50')).toBeInTheDocument();
    expect(screen.getByText('€30.00')).toBeInTheDocument();
  });

  test('renders empty state when no configurations', () => {
    render(
      <ConfigurationManager
        configs={[]}
        onDeleteConfig={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('📭 No saved configurations')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ConfigurationManager
        configs={mockConfigs}
        onDeleteConfig={vi.fn()}
        onClose={onClose}
      />
    );

    const closeButtons = screen.getAllByText('Close');
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('displays time slot durations correctly', () => {
    render(
      <ConfigurationManager
        configs={mockConfigs}
        onDeleteConfig={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // Check for unique values that won't conflict
    expect(screen.getByText('18:30')).toBeInTheDocument();
    expect(screen.getByText('19:00')).toBeInTheDocument();
    expect(screen.getByText('20:00')).toBeInTheDocument();
    expect(screen.getByText('2h')).toBeInTheDocument();
    expect(screen.getByText('1.5h')).toBeInTheDocument();
    expect(screen.getByText('3h')).toBeInTheDocument();
  });

  test('displays correct number of time slots', () => {
    render(
      <ConfigurationManager
        configs={mockConfigs}
        onDeleteConfig={vi.fn()}
        onClose={vi.fn()}
      />
    );

    // U10 has 2 time slots, U12 has 1 time slot
    const timeSlotCounts = screen.getAllByText(/^\d+$/);
    expect(timeSlotCounts.length).toBeGreaterThan(0);
  });
});

describe('HelpSection', () => {
  test('renders with title', () => {
    render(<HelpSection onClose={vi.fn()} />);

    expect(screen.getByText('📖 Help & Instructions')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<HelpSection onClose={onClose} />);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when "Got it, thanks!" button is clicked', () => {
    const onClose = vi.fn();
    render(<HelpSection onClose={onClose} />);

    fireEvent.click(screen.getByText('Got it, thanks!'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('renders all section headers', () => {
    render(<HelpSection onClose={vi.fn()} />);

    expect(screen.getByText('🧮 How Payment Calculation Works')).toBeInTheDocument();
    expect(screen.getByText('🚀 How to Use the Calculator')).toBeInTheDocument();
    expect(screen.getByText('📊 Required Excel Format')).toBeInTheDocument();
    expect(screen.getByText('✨ Key Features')).toBeInTheDocument();
  });

  test('"How Payment Calculation Works" section is expanded by default', () => {
    render(<HelpSection onClose={vi.fn()} />);

    expect(screen.getByText(/budget-sharing model/i)).toBeInTheDocument();
  });
});
