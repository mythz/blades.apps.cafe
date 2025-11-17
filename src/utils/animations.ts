import { Character } from '../types/game';

// Get character color based on state
export function getCharacterColor(character: Character): string {
  if (character.state === 'dead') return '#666666';
  if (character.state === 'hurt') return '#FF0000';
  if (character.state === 'attacking') return '#FFFF00';
  return character.id === 'player' ? '#0066FF' : '#FF3333';
}

// Get character opacity (for invulnerability flashing)
export function getCharacterOpacity(character: Character): number {
  if (character.state === 'dead') return 0.3;
  if (character.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
    return 0.5;
  }
  return 1.0;
}

// Get sword color based on sprite type
export function getSwordColor(sprite: string): string {
  const colors: Record<string, string> = {
    basic: '#C0C0C0',
    iron: '#808080',
    steel: '#A8A8A8',
    katana: '#FFD700',
    legendary: '#FF00FF',
  };
  return colors[sprite] || '#FFFFFF';
}

// Get sword rotation during attack animation
export function getSwordRotation(attackProgress: number): number {
  // attackProgress: 0 to 1
  // Rotate from 0 to 90 degrees
  return attackProgress * (Math.PI / 2);
}
