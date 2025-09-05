import './EventDetail.scss';

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';

import { useAuth } from '../../contexts/authContext';
import { useModal } from '../../contexts/modalContext';
import { Event } from '../../types/event';
import { Config } from '../../config/config';
import { ApiClient } from '../../services/client';
import { EventService } from '../../services/api/eventService';

const config = Config.getInstance();
const axios = new ApiClient(config.baseUrl);
const eventService = new EventService(axios);

export default function EventDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useModal();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'ID de l'événement depuis l'état de navigation
  const eventId = location.state?.eventId;

  const fetchEvent = async () => {
    if (!eventId) {
      setError('Aucun événement spécifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Utiliser l'endpoint enriched pour avoir toutes les données
      const response = await axios.instance.get<Event>(
        `/event/${eventId}/enriched`
      );
      setEvent(response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        setError(`Erreur lors du chargement de l'événement: ${error.message}`);
      } else if (error instanceof Error) {
        setError(`Erreur: ${error.message}`);
      } else {
        setError('Une erreur inconnue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const isOwner = user && event?.user?.id === user.id;

  const handleEdit = () => {
    if (event) {
      openModal('editEvent', event, fetchEvent);
    }
  };

  const handleDelete = async () => {
    if (!event || !user) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await axios.instance.delete(`/event/${event.id}`);
      // Rediriger vers la page des événements après suppression
      navigate('/events');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError("Erreur lors de la suppression de l'événement");
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Retour à la page précédente
  };

  if (loading) {
    return (
      <main className="event-detail">
        <div className="event-detail__loading">
          <p>Chargement de l'événement...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="event-detail">
        <div className="event-detail__error">
          <p>{error || 'Événement non trouvé'}</p>
          <button onClick={handleGoBack} className="button secondary">
            Retour
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="event-detail">
      <div className="event-detail__header">
        <button onClick={handleGoBack} className="button secondary">
          ← Retour
        </button>

        {isOwner && (
          <div className="event-detail__actions">
            <button onClick={handleEdit} className="button primary">
              Modifier
            </button>
            <button onClick={handleDelete} className="button danger">
              Supprimer
            </button>
          </div>
        )}
      </div>

      <div className="event-detail__content">
        <header className="event-detail__title-section">
          <h1 className="event-detail__title">{event.title}</h1>
          {event.tag && (
            <span
              className="event-detail__tag"
              style={{ backgroundColor: event.tag.color }}
            >
              {event.tag.name}
            </span>
          )}
        </header>

        <div className="event-detail__info-grid">
          <div className="event-detail__info-item">
            <h3>Date et heure</h3>
            <p>
              {new Date(event.date).toLocaleString('fr-FR', {
                timeZone: 'UTC',
              })}
            </p>
          </div>

          <div className="event-detail__info-item">
            <h3>Durée</h3>
            <p>{event.duration} minutes</p>
          </div>

          <div className="event-detail__info-item">
            <h3>Joueurs</h3>
            <p>
              {event.characters?.length || 0} / {event.max_players}
            </p>
          </div>

          <div className="event-detail__info-item">
            <h3>Statut</h3>
            <p className={`status status--${event.status}`}>
              {event.status === 'public' ? 'Public' : 'Privé'}
            </p>
          </div>

          {event.server && (
            <div className="event-detail__info-item">
              <h3>Serveur</h3>
              <p>
                {event.server.name}{' '}
                {event.server.mono_account ? '(Mono-compte)' : ''}
              </p>
            </div>
          )}

          <div className="event-detail__info-item">
            <h3>Zone</h3>
            <p>{event.area}</p>
          </div>

          <div className="event-detail__info-item">
            <h3>Sous-zone</h3>
            <p>{event.sub_area}</p>
          </div>

          {event.donjon_name && (
            <div className="event-detail__info-item">
              <h3>Donjon</h3>
              <p>{event.donjon_name}</p>
            </div>
          )}

          {event.user && (
            <div className="event-detail__info-item">
              <h3>Organisateur</h3>
              <p>{event.user.username}</p>
            </div>
          )}
        </div>

        {event.description && (
          <div className="event-detail__description">
            <h3>Description</h3>
            <p>{event.description}</p>
          </div>
        )}

        {event.characters && event.characters.length > 0 && (
          <div className="event-detail__participants">
            <h3>Participants</h3>
            <div className="event-detail__characters">
              {event.characters.map((character) => (
                <div key={character.id} className="event-detail__character">
                  <p className="character-name">{character.name}</p>
                  <p className="character-info">
                    Niveau {character.level} - {character.breed?.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
