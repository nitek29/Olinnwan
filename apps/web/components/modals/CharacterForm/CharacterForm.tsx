import './CharacterForm.scss';

import { Character } from '../../../types/character';
import { Breed } from '../../../types/breed';
import { Server } from '../../../types/server';

interface CharacterFormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  error: string | null;
  breeds?: Breed[];
  servers?: Server[];
  character?: Character; // Pour l'édition
}

export default function CharacterForm({
  handleSubmit,
  error,
  breeds = [],
  servers = [],
  character,
}: CharacterFormProps) {
  const isEditing = !!character;

  // Fonctions de transformation pour l'affichage
  const transformSexForDisplay = (sex: string) => {
    return sex === 'F' ? 'female' : 'male';
  };

  const transformAlignmentForDisplay = (alignment: string) => {
    switch (alignment) {
      case 'Bonta':
        return 'bontarien';
      case 'Brâkmar':
        return 'brakmarien';
      case 'Neutre':
        return 'neutral';
      default:
        return alignment.toLowerCase();
    }
  };

  return (
    <div className="character_modal">
      <h3 className="character_modal_title">
        {isEditing ? 'Modifier le personnage' : 'Créer un personnage'}
      </h3>
      <form onSubmit={handleSubmit} className="character_modal_form">
        <div className="form-row">
          <label htmlFor="name" className="character_modal_form_label">
            <span>Nom:</span>
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={character?.name || ''}
              placeholder="Nom du personnage"
              className="character_modal_form_label_input"
            />
          </label>

          <label htmlFor="sex" className="character_modal_form_label">
            <span>Sexe:</span>
            <select
              name="sex"
              id="sex"
              required
              defaultValue={
                character ? transformSexForDisplay(character.sex) : ''
              }
              className="character_modal_form_label_input"
            >
              <option value="">Sélectionner...</option>
              <option value="male">Masculin</option>
              <option value="female">Féminin</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label htmlFor="level" className="character_modal_form_label">
            <span>Niveau:</span>
            <input
              type="number"
              name="level"
              id="level"
              required
              min="1"
              max="200"
              defaultValue={character?.level || ''}
              placeholder="Niveau"
              className="character_modal_form_label_input"
            />
          </label>

          <label htmlFor="alignment" className="character_modal_form_label">
            <span>Alignement:</span>
            <select
              name="alignment"
              id="alignment"
              required
              defaultValue={
                character
                  ? transformAlignmentForDisplay(character.alignment)
                  : ''
              }
              className="character_modal_form_label_input"
            >
              <option value="">Sélectionner...</option>
              <option value="neutral">Neutre</option>
              <option value="bontarien">Bontarien</option>
              <option value="brakmarien">Brakmarien</option>
            </select>
          </label>
        </div>

        <label htmlFor="breed_id" className="character_modal_form_label">
          <span>Classe:</span>
          <select
            name="breed_id"
            id="breed_id"
            required
            defaultValue={character?.breed_id || ''}
            className="character_modal_form_label_input"
          >
            <option value="">Sélectionner une classe...</option>
            {breeds.map((breed) => (
              <option key={breed.id} value={breed.id}>
                {breed.name}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="server_id" className="character_modal_form_label">
          <span>Serveur:</span>
          <select
            name="server_id"
            id="server_id"
            required
            defaultValue={character?.server_id || ''}
            className="character_modal_form_label_input"
          >
            <option value="">Sélectionner un serveur...</option>
            {servers.map((server) => (
              <option key={server.id} value={server.id}>
                {server.name} {server.mono_account && '(Mono-compte)'}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="stuff" className="character_modal_form_label">
          <span>Équipement:</span>
          <textarea
            name="stuff"
            id="stuff"
            placeholder="Description de l'équipement"
            defaultValue={character?.stuff || ''}
            className="character_modal_form_label_input"
            rows={3}
          />
        </label>

        <label
          htmlFor="default_character"
          className="character_modal_form_label checkbox"
        >
          <input
            type="checkbox"
            name="default_character"
            id="default_character"
            defaultChecked={character?.default_character || false}
            className="character_modal_form_label_checkbox"
          />
          <span>Personnage principal</span>
        </label>

        {error && <p className="character_modal_form_error">{error}</p>}

        <button type="submit" className="character_modal_form_submit">
          {isEditing ? 'Modifier' : 'Créer'}
        </button>
      </form>
    </div>
  );
}
