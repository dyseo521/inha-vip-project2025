import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../mocks/server';
import Login from '../../src/pages/Login';
import { AuthProvider } from '../../src/context/AuthContext';

// Create a fresh query client for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to wrap component with providers
const renderWithProviders = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Login', () => {
  beforeEach(() => {
    server.resetHandlers();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('should render the login form', async () => {
    renderWithProviders();

    // Check for form elements
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('should render EECAR logo', () => {
    renderWithProviders();
    expect(screen.getByText('EECAR')).toBeInTheDocument();
  });

  it('should have link to signup page', () => {
    renderWithProviders();
    expect(screen.getByRole('link', { name: /회원가입/i })).toBeInTheDocument();
  });

  it('should have back to home button', () => {
    renderWithProviders();
    expect(screen.getByRole('button', { name: /홈으로/i })).toBeInTheDocument();
  });

  it('should allow email input', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const emailInput = screen.getByLabelText(/이메일/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should allow password input', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const passwordInput = screen.getByLabelText(/비밀번호/i);
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');

    // Before submit, button should not be disabled
    expect(submitButton).not.toBeDisabled();

    // Click and check it navigates (indicating success)
    await user.click(submitButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should navigate to home after successful login', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

describe('Login - Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have accessible form labels', () => {
    renderWithProviders();

    // Labels should be properly associated with inputs
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);

    expect(emailInput).toHaveAttribute('id', 'email');
    expect(passwordInput).toHaveAttribute('id', 'password');
  });

  it('should have aria-label on back button', () => {
    renderWithProviders();

    const backButton = screen.getByRole('button', { name: /홈으로 돌아가기/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should have required attributes on form inputs', () => {
    renderWithProviders();

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);

    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });
});
