import { Character, Platform, Rectangle, CollisionResult } from '../types/game';

export function checkAABB(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export function checkPlatformCollision(character: Character, platform: Platform): CollisionResult {
  const charRect: Rectangle = {
    x: character.position.x,
    y: character.position.y,
    width: character.width,
    height: character.height,
  };

  const platRect: Rectangle = {
    x: platform.x,
    y: platform.y,
    width: platform.width,
    height: platform.height,
  };

  if (!checkAABB(charRect, platRect)) {
    return { colliding: false, side: null, overlap: 0 };
  }

  // Calculate overlap on each side
  const overlapLeft = charRect.x + charRect.width - platRect.x;
  const overlapRight = platRect.x + platRect.width - charRect.x;
  const overlapTop = charRect.y + charRect.height - platRect.y;
  const overlapBottom = platRect.y + platRect.height - charRect.y;

  // Find minimum overlap
  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  let side: 'top' | 'bottom' | 'left' | 'right' = 'top';

  if (minOverlap === overlapTop && character.velocity.y >= 0) {
    side = 'top';
  } else if (minOverlap === overlapBottom) {
    side = 'bottom';
  } else if (minOverlap === overlapLeft) {
    side = 'left';
  } else {
    side = 'right';
  }

  return { colliding: true, side, overlap: minOverlap };
}

export function resolveCollision(character: Character, platform: Platform, result: CollisionResult): void {
  if (!result.colliding || !result.side) return;

  switch (result.side) {
    case 'top':
      character.position.y = platform.y - character.height;
      character.velocity.y = 0;
      break;
    case 'bottom':
      character.position.y = platform.y + platform.height;
      character.velocity.y = 0;
      break;
    case 'left':
      character.position.x = platform.x - character.width;
      character.velocity.x = 0;
      break;
    case 'right':
      character.position.x = platform.x + platform.width;
      character.velocity.x = 0;
      break;
  }
}

export function getSwordHitbox(character: Character): Rectangle {
  const range = character.equippedSword.range;
  const height = character.height * 0.8;

  let x = character.position.x;
  if (character.facing === 'right') {
    x = character.position.x + character.width;
  } else {
    x = character.position.x - range;
  }

  const y = character.position.y + (character.height - height) / 2;

  return { x, y, width: range, height };
}

export function checkSwordHit(attacker: Character, target: Character): boolean {
  if (!attacker.isAttacking) return false;
  if (target.invulnerable) return false;
  if (target.state === 'dead') return false;

  const swordHitbox = getSwordHitbox(attacker);
  const targetRect: Rectangle = {
    x: target.position.x,
    y: target.position.y,
    width: target.width,
    height: target.height,
  };

  return checkAABB(swordHitbox, targetRect);
}
