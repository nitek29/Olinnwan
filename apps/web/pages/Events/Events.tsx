import './events.scss';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';

import EventCard from '../../components/EventCard/EventCard';
import Pagination from '../../components/Pagination/Pagination';
import { useAuth } from '../../contexts/authContext';

import { Event } from '../../types/event';
import { Config } from '../../config/config';
import { ApiClient } from '../../services/client';
import { EventService } from '../../services/api/eventService';
import { useModal } from '../../contexts/modalContext';

const config = Config.getInstance();
const axios = new ApiClient(config.baseUrl);
const eventService = new EventService(axios);

export default function Events() {
  const { isAuthenticated } = useAuth();
  const { openModal } = useModal();
  const [events, setEvents] = useState<Event[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEvents = async () => {
    try {
      const eventsData = await eventService.getEvents(10, currentPage);
      setEvents(eventsData.events);
      setTotalPages(eventsData.totalPages);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Axios error:', error.message);
      } else if (error instanceof Error) {
        console.error('General error:', error.message);
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage]);

  const handleCreateEvent = () => {
    // TODO: Implémenter la navigation vers la page de création d'événement
    // ou ouvrir un modal de création
    console.log('Créer un nouvel événement');
  };

  return (
    <main className="events">
      <div className="events_top">
        <h1>Événements</h1>
        {isAuthenticated && (
          <button
            className="events_create_btn"
            onClick={() => openModal('createEvent', undefined, fetchEvents)}
            type="button"
          >
            Créer un événement
          </button>
        )}
      </div>

      <header className="events_header">
        <p className="events_header_title">Titre</p>
        <p className="events_header_tag">Tag</p>
        <p className="events_header_server">Serveur</p>
        <p className="events_header_date">Date</p>
        <p className="events_header_duration">Durée</p>
        <p className="events_header_players">Joueurs</p>
        <p className="events_header_details"></p>
      </header>

      {events && events.length ? (
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      ) : (
        <p>Chargement en cours</p>
      )}

      {totalPages ? (
        <div className="events_pagination">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage}
            maxVisiblePages={10}
          />
        </div>
      ) : (
        ''
      )}
    </main>
  );
}
