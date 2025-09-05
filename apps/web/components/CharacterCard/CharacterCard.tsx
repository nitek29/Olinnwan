import './CharacterCard.scss';

import { Character } from '../../types/character';

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
}

export default function CharacterCard({
  character,
  onEdit,
  onDelete,
}: CharacterCardProps) {
  return (
    <div className="character_card">
      <div className="character_card_header">
        <h4 className="character_card_name">
          {character.name}
          {character.default_character && (
            <span className="character_card_default">★</span>
          )}
        </h4>
        <div className="character_card_actions">
          <button
            onClick={() => onEdit(character)}
            className="character_card_action edit"
            aria-label="Modifier le personnage"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(character.id)}
            className="character_card_action delete"
            aria-label="Supprimer le personnage"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="character_card_details">
        <div className="character_card_info">
          <span className="character_card_label">Niveau:</span>
          <span className="character_card_value">{character.level}</span>
        </div>

        <div className="character_card_info">
          <span className="character_card_label">Sexe:</span>
          <span className="character_card_value">
            {character.sex === 'male' ? 'Masculin' : 'Féminin'}
          </span>
        </div>

        <div className="character_card_info">
          <span className="character_card_label">Alignement:</span>
          <span className="character_card_value">
            {character.alignment === 'neutral'
              ? 'Neutre'
              : character.alignment === 'bontarien'
                ? 'Bontarien'
                : 'Brakmarien'}
          </span>
        </div>

        {character.stuff && (
          <div className="character_card_stuff">
            <span className="character_card_label">Équipement (URL):</span>
            <p className="character_card_stuff_text">{character.stuff}</p>
          </div>
        )}
      </div>
    </div>
  );
}
