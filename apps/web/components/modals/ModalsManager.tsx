import './ModalsManager.scss';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';

import { useModal } from '../../contexts/modalContext';
import RegisterForm from './RegisterForm/RegisterForm';
import LoginForm from './LoginForm/LoginForm';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import EventForm from './EventForm/EventForm';
import CharacterForm from './CharacterForm/CharacterForm';
import UpdateUserForm from './UpdateUserForm/UpdateUserForm';
import { Tag } from '../../types/tag';
import { Server } from '../../types/server';
import { Breed } from '../../types/breed';
import { Character } from '../../types/character';
import { User } from '../../types/user';
import { Config } from '../../config/config';
import { ApiClient } from '../../services/client';
import { useAuth } from '../../contexts/authContext';

export default function ModalsManager() {
  const { isOpen, modalType, error, handleSubmit, closeModal, modalData } =
    useModal();
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);

  const config = Config.getInstance();
  const axios = new ApiClient(config.baseUrl);

  useEffect(() => {
    const fetchData = async () => {
      if (modalType === 'createEvent' || modalType === 'editEvent') {
        console.log(' fetchData EditEvent') ? modalType === 'editEvent' : null;
        try {
          // Récupérer les tags et serveurs
          const [tagsResponse, serversResponse, charactersResponse] =
            await Promise.all([
              axios.instance.get<Tag[]>('/tags'),
              axios.instance.get<Server[]>('/servers'),
              axios.instance.get<Character[]>('/characters'),
            ]);
          setTags(tagsResponse.data);
          setServers(serversResponse.data);
          setCharacters(charactersResponse.data);
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      } else if (modalType === 'createCharacter') {
        try {
          // Récupérer les breeds et serveurs
          const [breedsResponse, serversResponse] = await Promise.all([
            axios.instance.get<Breed[]>('/breeds'),
            axios.instance.get<Server[]>('/servers'),
          ]);
          setBreeds(breedsResponse.data);
          setServers(serversResponse.data);
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      } else if (modalType === 'editCharacter') {
        try {
          // Récupérer les breeds et serveurs pour l'édition
          const [breedsResponse, serversResponse] = await Promise.all([
            axios.instance.get<Breed[]>('/breeds'),
            axios.instance.get<Server[]>('/servers'),
          ]);
          setBreeds(breedsResponse.data);
          setServers(serversResponse.data);
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        }
      }
    };

    fetchData();
  }, [modalType]);

  if (!isOpen) return null;

  return (
    <div className="modal" onClick={closeModal}>
      <div
        className={`modal_content ${modalType === 'createEvent' || modalType === 'editEvent' || modalType === 'createCharacter' || modalType === 'editCharacter' ? 'large' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close modal"
          className="modal_content_close link"
          onClick={closeModal}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        <div className="modal_content_form">
          {modalType === 'register' && (
            <RegisterForm
              handleSubmit={(event) => handleSubmit(event)}
              error={error}
            />
          )}
          {modalType === 'login' && (
            <LoginForm
              handleSubmit={(event) => handleSubmit(event)}
              error={error}
            />
          )}
          {modalType === 'createEvent' && (
            <EventForm
              handleSubmit={(event) => handleSubmit(event)}
              error={error}
              tags={tags}
              servers={servers}
              characters={characters}
            />
          )}
          {modalType === 'editEvent' && (
            <EventForm
              handleSubmit={(event) => handleSubmit(event)}
              error={error}
              tags={tags}
              servers={servers}
              characters={characters}
              eventToEdit={modalData?.eventToEdit || modalData}
              isEditing={true}
            />
          )}
          {modalType === 'createCharacter' && (
            <CharacterForm
              handleSubmit={(event) => handleSubmit(event)}
              error={error}
              breeds={breeds}
              servers={servers}
            />
          )}
          {modalType === 'editCharacter' && (
            <CharacterForm
              handleSubmit={(event) => handleSubmit(event)}
              error={error}
              breeds={breeds}
              servers={servers}
              character={modalData}
            />
          )}
          {modalType === 'updateUser' && (
            <UpdateUserForm
              handleSubmit={(event) => handleSubmit(event)}
              error={error}
              user={user || undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}
