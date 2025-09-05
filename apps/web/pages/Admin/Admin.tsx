import React, { useState, useEffect } from 'react';
import { Config } from '../../config/config';
import { ApiClient } from '../../services/client';
import { EventService } from '../../services/api/eventService';
import { EventEnriched } from '../../types/event';
import { useAuth } from '../../contexts/authContext';
import { useModal } from '../../contexts/modalContext';
import './Admin.scss';

const config = Config.getInstance();
const axios = new ApiClient(config.baseUrl);
const eventService = new EventService(axios);

const Admin: React.FC = () => {
  const [events, setEvents] = useState<EventEnriched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { user } = useAuth();
  const { openModal } = useModal();

  useEffect(() => {
    if (user?.role !== 'admin') {
      setError('Accès non autorisé - Admin requis');
      setLoading(false);
      return;
    }

    fetchAllEvents();
  }, [user]);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getAllEnriched();
      setEvents(response);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des événements');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: EventEnriched) => {
    console.log('handleEditEvent');
    openModal(
      'editEvent',
      {
        eventToEdit: event,
        isAdminEdit: true,
      },
      fetchAllEvents
    ); // Passer fetchAllEvents comme callback
  };

  const handleDeleteEvent = async (event: EventEnriched) => {
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'événement "${event.title}" ?`
      )
    ) {
      return;
    }

    try {
      if (event.user?.id) {
        // Utiliser l'endpoint admin pour supprimer
        await eventService.adminDeleteEvent(event.user.id, event.id);
      } else {
        // Fallback vers l'endpoint normal
        await eventService.deleteEvent(event.id);
      }

      // Rafraîchir la liste
      fetchAllEvents();
    } catch (err) {
      setError("Erreur lors de la suppression de l'événement");
      console.error('Error deleting event:', err);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false ||
      event.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false;
    return matchesFilter && matchesSearch;
  });

  if (user?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="error-message">
          <h2>Accès refusé</h2>
          <p>Vous devez être administrateur pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading">Chargement des événements...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Administration - Gestion des événements</h1>
        <p>Gérez tous les événements de la plateforme</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchAllEvents}>Réessayer</button>
        </div>
      )}

      <div className="admin-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Rechercher par titre, description ou créateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-bar">
          <label>Filtrer par statut:</label>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as 'all' | 'public' | 'private')
            }
            className="filter-select"
          >
            <option value="all">Tous</option>
            <option value="public">Public</option>
            <option value="private">Privé</option>
          </select>
        </div>

        <div className="stats">
          <span className="stat">Total: {events.length} événements</span>
          <span className="stat">Affichés: {filteredEvents.length}</span>
        </div>
      </div>

      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Créateur</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((event) => (
              <tr key={event.id}>
                <td>
                  <div className="event-title">
                    <strong>{event.title}</strong>
                    {event.donjon_name && (
                      <div className="donjon-name">{event.donjon_name}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="creator-info">
                    <span className="username">
                      {event.user?.username || 'Inconnu'}
                    </span>
                    <span className="user-role">
                      {event.user?.role || 'user'}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="event-date">
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                    <div className="event-time">
                      {new Date(event.date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`status-badge status-${event.status}`}>
                    {event.status === 'public' ? 'Public' : 'Privé'}
                  </span>
                </td>
                <td>
                  <span className="participants-count">
                    {event.characters?.length || 0} / {event.max_players}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="btn btn-edit"
                      title="Modifier l'événement"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="btn btn-delete"
                      title="Supprimer l'événement"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEvents.length === 0 && !loading && (
          <div className="no-events">
            <p>Aucun événement trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
