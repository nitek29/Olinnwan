import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EventUtils } from '../eventUtils.js';
import CharacterEntity from '../../../../database/models/Character.js';
import EventEntity from '../../../../database/models/Event.js';

describe('EventUtils', () => {
  let eventUtils: EventUtils;
  let mockEvent: Partial<EventEntity>;
  let mockCharacters: Partial<CharacterEntity>[];

  beforeEach(() => {
    eventUtils = new EventUtils();
    vi.clearAllMocks();

    // Mock d'un événement
    mockEvent = {
      id: 'event-1',
      server_id: 'server-jiva',
      max_players: 8,
      characters: [],
    } as unknown as EventEntity;

    // Mock de personnages
    mockCharacters = [
      {
        id: 'char-1',
        name: 'CharacterJiva1',
        server_id: 'server-jiva',
      },
      {
        id: 'char-2',
        name: 'CharacterJiva2',
        server_id: 'server-jiva',
      },
      {
        id: 'char-3',
        name: 'CharacterIlyzaelle',
        server_id: 'server-ilyzaelle',
      },
    ] as unknown as CharacterEntity[];
  });

  describe('checkCharactersServer', () => {
    it('should return valid character IDs when all characters are from the same server as the event', () => {
      const validCharacters = mockCharacters.slice(0, 2) as CharacterEntity[]; // Only Jiva characters

      const result = eventUtils.checkCharactersServer(
        mockEvent as EventEntity,
        validCharacters,
      );

      expect(result).toEqual(['char-1', 'char-2']);
    });

    it('should throw an error when some characters are from different servers', () => {
      expect(() => {
        eventUtils.checkCharactersServer(
          mockEvent as EventEntity,
          mockCharacters as CharacterEntity[],
        );
      }).toThrow(
        "Following characters aren't from the same server: CharacterIlyzaelle",
      );
    });

    it('should throw an error listing all invalid characters when multiple characters are from different servers', () => {
      const mixedCharacters = [
        ...mockCharacters,
        {
          id: 'char-4',
          name: 'CharacterEcho',
          server_id: 'server-echo',
        },
      ] as unknown as CharacterEntity[];

      expect(() => {
        eventUtils.checkCharactersServer(
          mockEvent as EventEntity,
          mixedCharacters,
        );
      }).toThrow(
        "Following characters aren't from the same server: CharacterIlyzaelle, CharacterEcho",
      );
    });

    it('should return empty array when no characters are provided', () => {
      const result = eventUtils.checkCharactersServer(
        mockEvent as EventEntity,
        [],
      );

      expect(result).toEqual([]);
    });

    it('should handle undefined server_id gracefully', () => {
      const eventWithNoServer = {
        ...mockEvent,
        server_id: undefined,
      } as unknown as EventEntity;

      expect(() => {
        eventUtils.checkCharactersServer(
          eventWithNoServer,
          mockCharacters.slice(0, 1) as CharacterEntity[],
        );
      }).toThrow(
        "Following characters aren't from the same server: CharacterJiva1",
      );
    });
  });

  describe('checkTeamMaxLength', () => {
    it('should not throw when adding characters within max_players limit', () => {
      const eventWithCharacters = {
        ...mockEvent,
        characters: [{ id: 'existing-1' }],
      } as unknown as EventEntity;

      expect(() => {
        eventUtils.checkTeamMaxLength(eventWithCharacters, [
          'char-1',
          'char-2',
        ]);
      }).not.toThrow();
    });

    it('should throw error when adding characters exceeds max_players', () => {
      const eventWithManyCharacters = {
        ...mockEvent,
        characters: [
          { id: 'existing-1' },
          { id: 'existing-2' },
          { id: 'existing-3' },
          { id: 'existing-4' },
          { id: 'existing-5' },
          { id: 'existing-6' },
        ],
      } as unknown as EventEntity;

      expect(() => {
        eventUtils.checkTeamMaxLength(eventWithManyCharacters, [
          'char-1',
          'char-2',
          'char-3',
        ]);
      }).toThrow("Can't be more than 8 players in team");
    });
  });

  describe('checkTeamMinLength', () => {
    it('should not throw when removing characters still leaves at least 1', () => {
      const eventWithCharacters = {
        ...mockEvent,
        characters: [{ id: 'char-1' }, { id: 'char-2' }, { id: 'char-3' }],
      } as unknown as EventEntity;

      expect(() => {
        eventUtils.checkTeamMinLength(eventWithCharacters, ['char-1']);
      }).not.toThrow();
    });

    it('should throw error when removing all characters', () => {
      const eventWithOneCharacter = {
        ...mockEvent,
        characters: [{ id: 'char-1' }],
      } as unknown as EventEntity;

      expect(() => {
        eventUtils.checkTeamMinLength(eventWithOneCharacter, ['char-1']);
      }).toThrow("Event can't have any characters");
    });
  });

  describe('exceptCharactersAlreadyInTeam', () => {
    it('should filter out characters already in the team', () => {
      const eventWithCharacters = {
        ...mockEvent,
        characters: [{ id: 'char-1' }],
      } as unknown as EventEntity;

      const result = eventUtils.exceptCharactersAlreadyInTeam(
        eventWithCharacters,
        mockCharacters as CharacterEntity[],
      );

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(['char-2', 'char-3']);
    });

    it('should return all characters if none are in the team', () => {
      const eventWithNoCharacters = {
        ...mockEvent,
        characters: [],
      } as unknown as EventEntity;

      const result = eventUtils.exceptCharactersAlreadyInTeam(
        eventWithNoCharacters,
        mockCharacters as CharacterEntity[],
      );

      expect(result).toEqual(mockCharacters);
    });
  });

  describe('exceptCharactersNotInTeam', () => {
    it('should return only characters that are in the team', () => {
      const eventWithCharacters = {
        ...mockEvent,
        characters: [{ id: 'char-1' }, { id: 'char-2' }],
      } as unknown as EventEntity;

      const result = eventUtils.exceptCharactersNotInTeam(
        eventWithCharacters,
        mockCharacters as CharacterEntity[],
      );

      expect(result).toEqual(['char-1', 'char-2']);
    });

    it('should return empty array if no characters are in the team', () => {
      const eventWithNoCharacters = {
        ...mockEvent,
        characters: [],
      } as unknown as EventEntity;

      const result = eventUtils.exceptCharactersNotInTeam(
        eventWithNoCharacters,
        mockCharacters as CharacterEntity[],
      );

      expect(result).toEqual([]);
    });
  });
});
