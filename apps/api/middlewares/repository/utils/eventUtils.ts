import CharacterEntity from '../../../database/models/Character.js';
import EventEntity from '../../../database/models/Event.js';

export class EventUtils {
  public checkTeamMaxLength(
    eventEntity: EventEntity,
    charactersId: string[],
  ): void {
    const existingCount = eventEntity.characters?.length ?? 0;
    const incomingCount = charactersId.length;
    const totalCount = existingCount + incomingCount;

    if (totalCount > eventEntity.max_players) {
      throw new Error(
        `Can't be more than ${eventEntity.max_players} players in team`,
      );
    }
  }

  public checkTeamMinLength(
    eventEntity: EventEntity,
    charactersId: string[],
  ): void {
    const minLength = 1;
    const existingCount = eventEntity.characters?.length ?? 0;
    const incomingCount = charactersId.length;
    const totalCount = existingCount - incomingCount;

    if (totalCount < minLength) {
      throw new Error(`Event can't have any characters`);
    }
  }

  public checkCharactersServer(
    eventEntity: EventEntity,
    charactersEntity: CharacterEntity[],
  ): string[] {
    const validCharactersId = [];
    const invalidCharacters = [];

    for (const character of charactersEntity) {
      if (character.server_id !== eventEntity?.server_id) {
        invalidCharacters.push(character.name);
      } else validCharactersId.push(character.id);
    }

    if (invalidCharacters.length) {
      throw new Error(
        `Following characters aren't from the same server: ${invalidCharacters.join(', ')}`,
      );
    }

    return validCharactersId;
  }

  public exceptCharactersAlreadyInTeam(
    eventEntity: EventEntity,
    charactersEntity: CharacterEntity[],
  ): CharacterEntity[] {
    const existingCharacterIds = eventEntity.characters?.map((c) => c.id) ?? [];

    const newCharacters = charactersEntity.filter(
      (character) => !existingCharacterIds.includes(character.id),
    );

    return newCharacters;
  }

  public exceptCharactersNotInTeam(
    eventEntity: EventEntity,
    charactersEntity: CharacterEntity[],
  ): string[] {
    const existingCharactersIds =
      eventEntity.characters?.map((c) => c.id) ?? [];

    const availableCharactersToRemove = charactersEntity.filter((character) =>
      existingCharactersIds.includes(character.id),
    );

    const availableCharactersId =
      availableCharactersToRemove.map((c) => c.id) ?? [];

    return availableCharactersId;
  }
}
