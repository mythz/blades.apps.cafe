import { Character, Platform } from '../types/game';
import { PHYSICS } from '../utils/constants';
import { clamp } from '../utils/helpers';
import { checkPlatformCollision, resolveCollision } from './CollisionDetection';

export function applyGravity(character: Character, deltaTime: number): void {
  character.velocity.y += PHYSICS.GRAVITY * deltaTime * 60;
  character.velocity.y = clamp(character.velocity.y, -PHYSICS.MAX_FALL_SPEED, PHYSICS.MAX_FALL_SPEED);
}

export function moveCharacter(character: Character, direction: -1 | 0 | 1): void {
  const speed = PHYSICS.MOVE_SPEED;

  // Check for speed boost effect
  const speedBoost = character.activeEffects.find(e => e.type === 'speed_boost');
  const multiplier = speedBoost ? speedBoost.value : 1;

  character.velocity.x = direction * speed * multiplier;

  if (direction !== 0) {
    character.facing = direction > 0 ? 'right' : 'left';
    character.state = character.isGrounded ? 'running' : 'jumping';
  } else if (character.isGrounded && character.state !== 'attacking' && character.state !== 'hurt') {
    character.state = 'idle';
  }
}

export function jump(character: Character): boolean {
  const hasDoubleJump = character.abilities.some(a => a.id === 'double_jump');
  const maxJumps = hasDoubleJump ? 2 : 1;

  if (character.jumpCount < maxJumps) {
    character.velocity.y = PHYSICS.JUMP_FORCE;
    character.jumpCount++;
    character.isGrounded = false;
    character.state = 'jumping';
    return true;
  }

  return false;
}

export function applyKnockback(character: Character, direction: 'left' | 'right', force: number): void {
  const knockbackX = direction === 'right' ? force : -force;
  character.velocity.x = knockbackX;
  character.velocity.y = -force * 0.5; // Also knock up a bit
}

export function updatePhysics(character: Character, platforms: Platform[], deltaTime: number): void {
  // Apply gravity
  applyGravity(character, deltaTime);

  // Apply air resistance or ground friction
  if (character.isGrounded) {
    character.velocity.x *= PHYSICS.GROUND_FRICTION;
  } else {
    character.velocity.x *= PHYSICS.AIR_RESISTANCE;
  }

  // Update position
  character.position.x += character.velocity.x * deltaTime * 60;
  character.position.y += character.velocity.y * deltaTime * 60;

  // Assume not grounded, will be set to true if colliding with platform from top
  const wasGrounded = character.isGrounded;
  character.isGrounded = false;

  // Check platform collisions
  for (const platform of platforms) {
    const collision = checkPlatformCollision(character, platform);
    if (collision.colliding) {
      resolveCollision(character, platform, collision);

      if (collision.side === 'top') {
        character.isGrounded = true;
        character.jumpCount = 0; // Reset jump count when grounded

        // Landing particle effect (handled elsewhere)
        if (!wasGrounded) {
          character.state = 'idle';
        }
      }
    }
  }

  // Clamp character position to canvas bounds
  character.position.x = clamp(character.position.x, 0, 1200 - character.width);

  // Update invulnerability
  if (character.invulnerable) {
    character.invulnerableTime -= deltaTime * 1000;
    if (character.invulnerableTime <= 0) {
      character.invulnerable = false;
      character.invulnerableTime = 0;
    }
  }

  // Update attack cooldown
  if (character.attackCooldown > 0) {
    character.attackCooldown -= deltaTime * 1000;
    if (character.attackCooldown <= 0) {
      character.attackCooldown = 0;
      character.isAttacking = false;
    }
  }

  // Update active effects
  const currentTime = Date.now();
  character.activeEffects = character.activeEffects.filter(effect => {
    const elapsed = currentTime - effect.startTime;
    return elapsed < effect.duration;
  });
}

export function checkLavaCollision(character: Character): boolean {
  return character.position.y + character.height >= PHYSICS.LAVA_Y;
}
