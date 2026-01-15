import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../mocks/server';
import Signup from '../../src/pages/Signup';
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
          <Signup />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('Signup', () => {
  beforeEach(() => {
    server.resetHandlers();
    mockNavigate.mockClear();
    localStorage.clear();
  });

  it('should render the signup form', async () => {
    renderWithProviders();

    // Check for form elements
    expect(screen.getByLabelText(/이름/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^비밀번호 \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호 확인/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /회원가입/i })).toBeInTheDocument();
  });

  it('should render EECAR logo', () => {
    renderWithProviders();
    expect(screen.getByText('EECAR')).toBeInTheDocument();
  });

  it('should have link to login page', () => {
    renderWithProviders();
    expect(screen.getByRole('link', { name: /로그인/i })).toBeInTheDocument();
  });

  it('should have back to home button', () => {
    renderWithProviders();
    expect(screen.getByRole('button', { name: /홈으로/i })).toBeInTheDocument();
  });

  it('should have seller checkbox', () => {
    renderWithProviders();
    expect(screen.getByLabelText(/판매자로도 활동하기/i)).toBeInTheDocument();
  });

  it('should show company name field when seller checkbox is checked', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    // Initially company name field should not be visible
    expect(screen.queryByLabelText(/회사명/i)).not.toBeInTheDocument();

    // Check the seller checkbox
    const sellerCheckbox = screen.getByLabelText(/판매자로도 활동하기/i);
    await user.click(sellerCheckbox);

    // Company name field should now be visible
    expect(screen.getByLabelText(/회사명/i)).toBeInTheDocument();
  });

  it('should allow form inputs', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const nameInput = screen.getByLabelText(/이름/i);
    const emailInput = screen.getByLabelText(/이메일/i);

    await user.type(nameInput, '홍길동');
    await user.type(emailInput, 'test@example.com');

    expect(nameInput).toHaveValue('홍길동');
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('should show error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const nameInput = screen.getByLabelText(/이름/i);
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/^비밀번호 \*/i);
    const confirmInput = screen.getByLabelText(/비밀번호 확인/i);
    const submitButton = screen.getByRole('button', { name: /회원가입/i });

    await user.type(nameInput, '홍길동');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmInput, 'differentpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/비밀번호가 일치하지 않습니다/i);
    });
  });

  it('should show error when password is too short', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const nameInput = screen.getByLabelText(/이름/i);
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/^비밀번호 \*/i);
    const confirmInput = screen.getByLabelText(/비밀번호 확인/i);
    const submitButton = screen.getByRole('button', { name: /회원가입/i });

    await user.type(nameInput, '홍길동');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '12345');
    await user.type(confirmInput, '12345');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/비밀번호는 최소 6자 이상/i);
    });
  });

  it('should navigate to home after successful signup', async () => {
    const user = userEvent.setup();
    renderWithProviders();

    const nameInput = screen.getByLabelText(/이름/i);
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/^비밀번호 \*/i);
    const confirmInput = screen.getByLabelText(/비밀번호 확인/i);
    const submitButton = screen.getByRole('button', { name: /회원가입/i });

    await user.type(nameInput, 'New User');
    await user.type(emailInput, 'new@test.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

describe('Signup - Accessibility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should have accessible form labels', () => {
    renderWithProviders();

    // Labels should be properly associated with inputs
    const nameInput = screen.getByLabelText(/이름/i);
    const emailInput = screen.getByLabelText(/이메일/i);

    expect(nameInput).toHaveAttribute('id', 'name');
    expect(emailInput).toHaveAttribute('id', 'email');
  });

  it('should have aria-label on back button', () => {
    renderWithProviders();

    const backButton = screen.getByRole('button', { name: /홈으로 돌아가기/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should have aria-describedby on seller checkbox', () => {
    renderWithProviders();

    const sellerCheckbox = screen.getByLabelText(/판매자로도 활동하기/i);
    expect(sellerCheckbox).toHaveAttribute('aria-describedby', 'seller-hint');
  });

  it('should have required attributes on mandatory form inputs', () => {
    renderWithProviders();

    const nameInput = screen.getByLabelText(/이름/i);
    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/^비밀번호 \*/i);
    const confirmInput = screen.getByLabelText(/비밀번호 확인/i);

    expect(nameInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    expect(confirmInput).toHaveAttribute('required');
  });
});
