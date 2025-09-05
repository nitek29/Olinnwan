import React, { createContext, useContext, useState } from 'react';

import { Config } from '../config/config';
import { ApiClient } from '../services/client';
import { AuthService } from '../services/api/authService';
import { EventService } from '../services/api/eventService';
import { CharacterService } from '../services/api/characterService';
import { UserService } from '../services/api/userService';
import formDataToObject from './utils/formDataToObject';
import {
  RegisterForm,
  LoginForm,
  EventForm,
  CharacterForm,
  UpdateUserForm,
} from '../types/form';
import { useAuth } from './authContext';

const config = Config.getInstance();
const axios = new ApiClient(config.baseUrl);
const authService = new AuthService(axios);
const eventService = new EventService(axios);
const characterService = new CharacterService(axios);
const userService = new UserService(axios);

interface ModalContextType {
  isOpen: boolean;
  modalType: string | null; // ex: "register", "login", "newEvent", etc.
  formData: FormData;
  resetForm: React.Dispatch<React.SetStateAction<FormData>>;
  error: string | null;
  setError: (message: string | null) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  openModal: (type: string, data?: any, successCallback?: () => void) => void;
  closeModal: () => void;
  modalData?: any; // Pour stocker les données de l'élément à éditer
  onSuccess?: () => void; // Callback pour rafraîchir les données après succès
}

interface ModalProviderProps {
  children: React.ReactNode;
}

const ModalContext = createContext<ModalContextType | null>(null);

export default function ModalProvider({ children }: ModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [error, setError] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [onSuccess, setOnSuccess] = useState<(() => void) | undefined>(
    undefined
  );
  const { setUser } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    try {
      if (modalType === 'register') {
        const keys: (keyof RegisterForm)[] = [
          'username',
          'mail',
          'password',
          'confirmPassword',
        ];
        const data = formDataToObject<RegisterForm>(formData, keys);
        console.log(data);
        const response = await authService.register(data);
        console.log(response);
        // Mettre à jour l'état d'authentification
        const { password: _password, ...userWithoutPassword } = response;
        setUser(userWithoutPassword);
      } else if (modalType === 'login') {
        const keys: (keyof LoginForm)[] = ['username', 'password'];
        const data = formDataToObject<LoginForm>(formData, keys);
        console.log(data);
        const response = await authService.login(data);
        console.log(response);
        // Mettre à jour l'état d'authentification
        const { password: _password, ...userWithoutPassword } = response;
        setUser(userWithoutPassword);
      } else if (modalType === 'createEvent') {
        // Récupération manuelle des données du formulaire pour les événements
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;
        const duration = parseInt(formData.get('duration') as string);
        const max_players = parseInt(formData.get('max_players') as string);
        const area = formData.get('area') as string;
        const sub_area = formData.get('sub_area') as string;
        const donjon_name = formData.get('donjon_name') as string;
        const tag_id = formData.get('tag_id') as string;
        const server_id = formData.get('server_id') as string;
        const description = formData.get('description') as string;
        const character_id = formData.get('character_id') as string;
        const status = formData.get('status') as string;

        const eventData = {
          title,
          date: new Date(date),
          duration,
          max_players,
          area,
          sub_area,
          donjon_name: donjon_name || undefined,
          tag_id,
          server_id,
          description: description || undefined,
          characters_id: character_id ? [character_id] : [],
          status,
        };

        console.log('Creating event:', eventData);
        const response = await eventService.createEvent(eventData);
        console.log('Event created:', response);
      } else if (modalType === 'editEvent') {
        console.log(' EditEvent modal');
        // Récupération manuelle des données du formulaire pour la modification d'événements
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;
        const duration = parseInt(formData.get('duration') as string);
        const max_players = parseInt(formData.get('max_players') as string);
        const area = formData.get('area') as string;
        const sub_area = formData.get('sub_area') as string;
        const donjon_name = formData.get('donjon_name') as string;
        const tag_id = formData.get('tag_id') as string;
        const server_id = formData.get('server_id') as string;
        const description = formData.get('description') as string;
        const character_id = formData.get('character_id') as string;
        const status = formData.get('status') as string;

        const eventData = {
          title,
          date: new Date(date),
          duration,
          max_players,
          area,
          sub_area,
          donjon_name: donjon_name || undefined,
          tag_id,
          server_id,
          description: description || undefined,
          characters_id: character_id ? [character_id] : [],
          status,
        };

        console.log('Updating event:', eventData);

        // Vérifier si c'est un admin modifiant l'événement d'un autre utilisateur
        if (modalData?.isAdminEdit && modalData?.eventToEdit) {
          const currentUser = modalData.eventToEdit.user; // L'utilisateur propriétaire de l'événement
          if (currentUser?.id) {
            const response = await eventService.adminUpdateEvent(
              currentUser.id,
              modalData.eventToEdit.id,
              eventData
            );
            console.log('Event updated by admin:', response);
          } else {
            throw new Error(
              "Impossible de modifier l'événement : utilisateur propriétaire introuvable"
            );
          }
        } else {
          const eventId = modalData?.eventToEdit?.id || modalData?.id;
          if (!eventId) {
            throw new Error(
              "Impossible de modifier l'événement : ID introuvable"
            );
          }
          const response = await eventService.updateEvent(eventId, eventData);
          console.log('Event updated:', response);
        }
      } else if (modalType === 'createCharacter') {
        const keys: (keyof CharacterForm)[] = [
          'name',
          'sex',
          'level',
          'alignment',
          'stuff',
          'default_character',
          'breed_id',
          'server_id',
        ];

        const characterFormData = formDataToObject(
          formData,
          keys
        ) as unknown as CharacterForm;

        // Transformation des valeurs frontend vers backend
        const transformSex = (sex: string) => {
          return sex === 'female' ? 'F' : 'M';
        };

        const transformAlignment = (alignment: string) => {
          switch (alignment) {
            case 'bontarien':
              return 'Bonta';
            case 'brakmarien':
              return 'Brâkmar';
            case 'neutral':
              return 'Neutre';
            default:
              return alignment;
          }
        };

        const characterData = {
          name: characterFormData.name,
          sex: transformSex(characterFormData.sex),
          level: parseInt(characterFormData.level.toString()),
          alignment: transformAlignment(characterFormData.alignment),
          ...(characterFormData.stuff &&
            characterFormData.stuff.trim() !== '' && {
              stuff: characterFormData.stuff,
            }),
          default_character: !!characterFormData.default_character,
          breed_id: characterFormData.breed_id,
          server_id: characterFormData.server_id,
        };

        console.log('Creating character:', characterData);
        const response = await characterService.createCharacter(characterData);
        console.log('Character created:', response);
      } else if (modalType === 'editCharacter') {
        const keys: (keyof CharacterForm)[] = [
          'name',
          'sex',
          'level',
          'alignment',
          'stuff',
          'default_character',
          'breed_id',
          'server_id',
        ];

        const characterFormData = formDataToObject(
          formData,
          keys
        ) as unknown as CharacterForm;

        // Transformation des valeurs frontend vers backend
        const transformSex = (sex: string) => {
          return sex === 'female' ? 'F' : 'M';
        };

        const transformAlignment = (alignment: string) => {
          switch (alignment) {
            case 'bontarien':
              return 'Bonta';
            case 'brakmarien':
              return 'Brâkmar';
            case 'neutral':
              return 'Neutre';
            default:
              return alignment;
          }
        };

        const characterData = {
          name: characterFormData.name,
          sex: transformSex(characterFormData.sex),
          level: parseInt(characterFormData.level.toString()),
          alignment: transformAlignment(characterFormData.alignment),
          ...(characterFormData.stuff &&
            characterFormData.stuff.trim() !== '' && {
              stuff: characterFormData.stuff,
            }),
          default_character: !!characterFormData.default_character,
          breed_id: characterFormData.breed_id,
          server_id: characterFormData.server_id,
        };

        console.log('Updating character:', characterData);
        const response = await characterService.updateCharacter(
          modalData.id,
          characterData
        );
        console.log('Character updated:', response);
      } else if (modalType === 'updateUser') {
        const keys: (keyof UpdateUserForm)[] = [
          'username',
          'mail',
          'password',
          'confirmPassword',
        ];

        const userFormData = formDataToObject(
          formData,
          keys
        ) as unknown as UpdateUserForm;

        // Validation des mots de passe
        if (
          userFormData.password &&
          userFormData.password !== userFormData.confirmPassword
        ) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }

        const userData = {
          username: userFormData.username,
          mail: userFormData.mail,
          ...(userFormData.password && { password: userFormData.password }),
        };

        console.log('Updating user:', userData);
        const response = await userService.updateUser(userData);
        console.log('User updated:', response);

        // Mettre à jour l'utilisateur dans le contexte auth
        setUser(response);
      }

      setError(null);

      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess();
      }

      closeModal();
    } catch (error) {
      console.error('Modal submission error:', error);

      if (error instanceof Error) {
        console.error('Error message:', error.message);

        // Si c'est une erreur Axios, extraire les détails de validation
        if ('response' in error && (error as any).response?.data) {
          const responseData = (error as any).response.data;
          console.error('Response data:', responseData);

          if (responseData.details && Array.isArray(responseData.details)) {
            const validationMessages = responseData.details
              .map((detail: any) => detail.message)
              .join(', ');
            setError(`Erreur de validation: ${validationMessages}`);
          } else if (responseData.message) {
            setError(`Erreur: ${responseData.message}`);
          } else {
            setError(error.message);
          }
        } else {
          setError(error.message);
        }
      } else {
        setError('Une erreur est survenue');
      }
    }
  }

  const resetForm = () => setFormData(new FormData());

  const openModal = (
    type: string,
    data?: any,
    successCallback?: () => void
  ) => {
    setModalType(type);
    setModalData(data);
    setOnSuccess(() => successCallback);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
    setModalData(null);
    setOnSuccess(undefined);
    setError(null);
    setFormData(new FormData());
  };

  const contextValues: ModalContextType = {
    isOpen,
    modalType,
    formData,
    resetForm,
    error,
    setError,
    handleSubmit,
    openModal,
    closeModal,
    modalData,
    onSuccess,
  };

  return (
    <ModalContext.Provider value={contextValues}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error('useModal must be used in modalProvider');
  }

  return context;
}
