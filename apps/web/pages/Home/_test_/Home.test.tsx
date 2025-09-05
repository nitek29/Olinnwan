import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import Home from '../Home';

vi.mock('../../../config/config.ts', () => ({
  Config: {
    getInstance: () => ({
      baseUrl: 'http://localhost',
    }),
  },
}));

vi.mock('../../../components/EventCard/EventCard', () => ({
  default: ({ event }: any) => (
    <div data-testid="event-card">
      <h2>{event.title}</h2>
      <p data-testid="event-tag">{event.tag.name}</p>
      <p data-testid="event-server">{event.server.name}</p>
      <p data-testid="event-date">
        {new Date(event.date).toLocaleString('fr-FR', { timeZone: 'UTC' })}
      </p>
      <p data-testid="event-duration">{event.duration} min</p>
      <p data-testid="event-players">
        {event.characters ? event.characters.length : 0}/{event.max_players}
      </p>
      <button>Détails</button>
    </div>
  ),
}));

vi.mock('../../../components/Pagination/Pagination', () => ({
  default: ({
    totalPages,
    currentPage,
    onPageChange,
    maxVisiblePages,
  }: any) => {
    // on peut simuler une liste simple de pages de 1 à totalPages (ou limitée par maxVisiblePages)
    const pages = Array.from(
      { length: Math.min(totalPages, maxVisiblePages) },
      (_, i) => i + 1
    );

    return (
      <ul data-testid="pagination">
        {pages.map((page) => (
          <button
            key={page}
            aria-label={`To page ${page}`}
            className={page === currentPage ? 'active' : ''}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </ul>
    );
  },
}));

let mockGetEvents: any;

vi.mock('../../../services/api/eventService', () => {
  return {
    EventService: vi.fn().mockImplementation(() => ({
      getEvents: (...args: any[]) => mockGetEvents(...args),
    })),
  };
});

const renderHome = () => {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
};

describe('Home component', () => {
  beforeEach(() => {
    mockGetEvents = vi
      .fn()
      .mockResolvedValueOnce({
        events: [
          {
            id: '1',
            title: 'Event 1',
            tag: { name: 'Raid', color: '#000' },
            server: { name: 'Server 1' },
            date: '2025-08-17T12:00:00Z',
            duration: 90,
            characters: [{ name: 'Char 1' }, { name: 'Char 2' }],
            max_players: 10,
          },
        ],
        totalPages: 3,
      })
      .mockResolvedValueOnce({
        events: [
          {
            id: '2',
            title: 'Event 2',
            tag: { name: 'Dungeon', color: '#111' },
            server: { name: 'Server 2' },
            date: '2025-08-18T14:00:00Z',
            duration: 60,
            characters: [{ name: 'Char 1' }, { name: 'Char 2' }],
            max_players: 4,
          },
        ],
        totalPages: 3,
      });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Display 'Chargement en cours' at initial renderer", () => {
    renderHome();
    expect(screen.getByText(/Chargement en cours/i)).toBeInTheDocument();
  });

  it('Display events list after API call', async () => {
    renderHome();

    await waitFor(() => {
      const card = screen.getByTestId('event-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByTestId('event-tag')).toHaveTextContent('Raid');
      expect(screen.getByTestId('event-server')).toHaveTextContent('Server 1');
      expect(screen.getByTestId('event-date')).toHaveTextContent(
        new Date('2025-08-17T12:00:00Z').toLocaleString('fr-FR', {
          timeZone: 'UTC',
        })
      );
      expect(screen.getByTestId('event-duration')).toHaveTextContent('90 min');
      expect(screen.getByTestId('event-players')).toHaveTextContent('2/10');
    });
  });

  it('Display pagination', async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'To page 1' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'To page 2' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'To page 3' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'To page 1' })).toHaveClass(
        'active'
      );
    });
  });

  it('Manage axios error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEvents = vi
      .fn()
      .mockRejectedValue(
        Object.assign(new Error('Erreur axios'), { isAxiosError: true })
      );

    renderHome();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Axios error:', 'Erreur axios');
    });

    consoleSpy.mockRestore();
  });

  it('manage general error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetEvents = vi.fn().mockRejectedValue(new Error('Erreur générale'));

    renderHome();

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'General error:',
        'Erreur générale'
      );
    });

    consoleSpy.mockRestore();
  });

  it('Change page on pagination click', async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Event 1')).toBeInTheDocument();
    });

    screen.getByRole('button', { name: 'To page 2' }).click();

    await waitFor(() => {
      const card = screen.getByTestId('event-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
      expect(screen.getByTestId('event-tag')).toHaveTextContent('Dungeon');
      expect(screen.getByTestId('event-server')).toHaveTextContent('Server 2');
      expect(screen.getByTestId('event-duration')).toHaveTextContent('60 min');
      expect(screen.getByTestId('event-players')).toHaveTextContent('2/4');
    });
  });
});
