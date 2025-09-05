import './Profile.scss';

import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';

import CharacterCard from '../../components/CharacterCard/CharacterCard';
import { useAuth } from '../../contexts/authContext';
import { useModal } from '../../contexts/modalContext';

import { Character } from '../../types/character';
import { Event } from '../../types/event';
import { Config } from '../../config/config';
import { ApiClient } from '../../services/client';
import { CharacterService } from '../../services/api/characterService';
import { EventService } from '../../services/api/eventService';
import EventCard from '../../components/EventCard/EventCard';

const config = Config.getInstance();
const axios = new ApiClient(config.baseUrl);
const characterService = new CharacterService(axios);
const eventService = new EventService(axios);

export default function Profile() {
  const { user } = useAuth();
  const { openModal } = useModal();
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [events, setEvents] = useState<Event[] | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const charactersData = await characterService.getUserCharacters();
      setCharacters(charactersData);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Axios error:', error.message);
      } else if (error instanceof Error) {
        console.error('General error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const eventsData = await eventService.getEvents();
      setEvents(eventsData.events);
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Axios error:', error.message);
      } else if (error instanceof Error) {
        console.error('General error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
    fetchEvents();
  }, [user]);

  const handleEditCharacter = (character: Character) => {
    console.log('Edit character:', character);
    openModal('editCharacter', character, fetchCharacters);
  };

  const handleDeleteCharacter = async (characterId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce personnage ?')) {
      return;
    }

    try {
      await characterService.deleteCharacter(characterId);
      setCharacters((prev) =>
        prev ? prev.filter((char) => char.id !== characterId) : null
      );
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (!user) {
    return (
      <main className="profile">
        <div className="profile_error">
          <p>Vous devez être connecté pour accéder à votre profil.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile">
      <div className="profile_header">
        <div className="profile_user_info">
          <h1 className="profile_title">Mon Profil</h1>
          <div className="profile_user_details">
            <p className="profile_username">
              <strong>Nom d'utilisateur:</strong> {user.username}
            </p>
          </div>
        </div>

        <div className="profile_actions">
          <button
            onClick={() => openModal('updateUser')}
            className="profile_action_button primary"
          >
            Modifier mes informations
          </button>
        </div>
      </div>

      <div className="profile_section">
        <div className="profile_section_header">
          <h2 className="profile_section_title">Mes Personnages</h2>
          <button
            onClick={() =>
              openModal('createCharacter', undefined, fetchCharacters)
            }
            className="profile_action_button secondary"
          >
            Ajouter un personnage
          </button>
        </div>

        <div className="profile_characters">
          {loading ? (
            <p className="profile_loading">Chargement des personnages...</p>
          ) : characters && characters.length > 0 ? (
            <div className="profile_characters_grid">
              {characters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onEdit={handleEditCharacter}
                  onDelete={handleDeleteCharacter}
                />
              ))}
            </div>
          ) : (
            <div className="profile_empty">
              <p>Vous n'avez pas encore de personnages.</p>
              <button
                onClick={() =>
                  openModal('createCharacter', undefined, fetchCharacters)
                }
                className="profile_action_button primary"
              >
                Créer mon premier personnage
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile_section">
        <div className="profile_section_header">
          <h2 className="profile_section_title">Mes évennements</h2>
          <button
            onClick={() => openModal('createEvent', undefined, fetchEvents)}
            className="profile_action_button secondary"
          >
            Ajouter un évennement
          </button>
        </div>

        <div className="profile_events">
          {loading ? (
            <p className="profile_loading">Chargement des évennements...</p>
          ) : events && events.length > 0 ? (
            <div className="profile_events_grid">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="profile_empty">
              <p>Vous n'avez pas encore d'évennement.</p>
              <button
                onClick={() => openModal('createEvent')}
                className="profile_action_button primary"
              >
                Créer mon premier évennement
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
