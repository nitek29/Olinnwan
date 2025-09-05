import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import LoginForm from '../LoginForm/LoginForm';

describe('LoginForm', () => {
  it('Display all form fields and button', () => {
    render(<LoginForm handleSubmit={vi.fn()} error={null} />);
    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mot de passe:$/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('Display message if error is define', () => {
    render(<LoginForm handleSubmit={vi.fn()} error="Error !" />);
    expect(screen.getByText('Error !')).toBeInTheDocument();
  });

  it('Call handleSubmit on form submit', () => {
    const handleSubmit = vi.fn();
    render(<LoginForm handleSubmit={handleSubmit} error={null} />);
    const form = screen.getByRole('button').closest('form')!;
    fireEvent.submit(form);
    expect(handleSubmit).toHaveBeenCalled();
  });
});
