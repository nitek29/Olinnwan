import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalProvider from '../../../contexts/modalContext';

vi.mock('../../../config/config.ts', () => ({
  Config: {
    getInstance: () => ({
      baseUrl: 'http://localhost',
    }),
  },
}));

// Mock context before component import
let mockUseModal: () => any = () => ({
  isOpen: true,
  modalType: 'register',
  error: null,
  handleSubmit: vi.fn(),
  closeModal: vi.fn(),
  openModal: vi.fn(),
});

let mockUseAuth: () => any = () => ({
  user: null,
  isAuthenticated: false,
  logout: vi.fn(),
  isLoading: false,
});

vi.mock('../../../contexts/modalContext', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
  useModal: () => mockUseModal(),
}));

vi.mock('../../../contexts/authContext', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockUseAuth(),
}));

import ModalsManager from '../ModalsManager';

function renderModalsManager() {
  return render(
    <ModalProvider>
      <ModalsManager />
    </ModalProvider>
  );
}

describe('ModalsManager', () => {
  let closeModal: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Default mock setup
    closeModal = vi.fn();
    mockUseModal = () => ({
      isOpen: true,
      modalType: 'register',
      error: null,
      handleSubmit: vi.fn(),
      closeModal,
      openModal: vi.fn(),
    });
    mockUseAuth = () => ({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
      isLoading: false,
    });
  });

  it("Display RegisterForm When modalType is 'register'", () => {
    renderModalsManager();
    const form = screen
      .getByRole('button', { name: 'Register' })
      .closest('form')!;
    expect(form).toBeInTheDocument();
    expect(screen.getByText(/Inscription/i)).toBeInTheDocument();
  });

  it('Display close button', () => {
    renderModalsManager();
    expect(screen.getByLabelText(/Close modal/i)).toBeInTheDocument();
  });

  it('Close modal when you click on the background', () => {
    renderModalsManager();
    const modal = document.querySelector('.modal')!;
    fireEvent.click(modal);
    expect(closeModal).toHaveBeenCalled();
  });

  it('Display nothing if isOpen is false', () => {
    // overload mock for this specific test
    mockUseModal = () => ({
      isOpen: false,
      modalType: 'register',
      error: null,
      handleSubmit: vi.fn(),
      closeModal: vi.fn(),
      openModal: vi.fn(),
    });
    mockUseAuth = () => ({
      user: null,
      isAuthenticated: false,
      logout: vi.fn(),
      isLoading: false,
    });

    const { container } = renderModalsManager();
    expect(container.firstChild).toBeNull();
  });
});
