import { GameState, Character, Platform, Particle } from '../types/game';
import { CANVAS, LAVA_ZONE } from '../utils/constants';
import { getCharacterColor, getCharacterOpacity, getSwordColor } from '../utils/animations';
import { getSwordHitbox } from './CollisionDetection';

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
  }

  renderBackground(): void {
    // Sky gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS.HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);

    // Simple clouds (decorative)
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.drawCloud(200, 80);
    this.drawCloud(600, 120);
    this.drawCloud(1000, 90);
  }

  private drawCloud(x: number, y: number): void {
    this.ctx.beginPath();
    this.ctx.arc(x, y, 30, 0, Math.PI * 2);
    this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
    this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderPlatforms(platforms: Platform[]): void {
    for (const platform of platforms) {
      if (platform.type === 'main') {
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
      } else {
        this.ctx.fillStyle = '#A0826D';
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        this.ctx.strokeStyle = '#8B7355';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
      }
    }
  }

  renderLava(): void {
    // Animated lava gradient
    const offset = (Date.now() % 2000) / 2000;
    const gradient = this.ctx.createLinearGradient(0, LAVA_ZONE.Y, 0, CANVAS.HEIGHT);
    gradient.addColorStop(0, '#FF4500');
    gradient.addColorStop(offset, '#FFA500');
    gradient.addColorStop(1, '#FF6347');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, LAVA_ZONE.Y, CANVAS.WIDTH, LAVA_ZONE.HEIGHT);
  }

  renderCharacter(character: Character): void {
    this.ctx.save();

    // Set opacity for invulnerability or death
    this.ctx.globalAlpha = getCharacterOpacity(character);

    // Draw character body
    const color = getCharacterColor(character);
    this.ctx.fillStyle = color;
    this.ctx.fillRect(
      character.position.x,
      character.position.y,
      character.width,
      character.height
    );

    // Draw character outline
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      character.position.x,
      character.position.y,
      character.width,
      character.height
    );

    // Draw face indicator (simple circle for facing direction)
    this.ctx.fillStyle = '#000000';
    const eyeX = character.facing === 'right'
      ? character.position.x + character.width * 0.7
      : character.position.x + character.width * 0.3;
    const eyeY = character.position.y + character.height * 0.3;
    this.ctx.beginPath();
    this.ctx.arc(eyeX, eyeY, 3, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw sword if attacking
    if (character.isAttacking) {
      this.renderSword(character);
    }

    // Draw shield effect if active
    const shieldEffect = character.activeEffects.find(e => e.type === 'shield');
    if (shieldEffect) {
      this.ctx.strokeStyle = '#00FFFF';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(
        character.position.x + character.width / 2,
        character.position.y + character.height / 2,
        character.width * 0.7,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private renderSword(character: Character): void {
    const hitbox = getSwordHitbox(character);
    const color = getSwordColor(character.equippedSword.sprite);

    this.ctx.fillStyle = color;
    this.ctx.fillRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
  }

  renderHealthBar(character: Character, x: number, y: number, width: number = 100): void {
    const height = 10;
    const healthRatio = character.health / character.maxHealth;

    // Background
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, y, width, height);

    // Health
    const healthWidth = width * healthRatio;
    const healthColor = healthRatio > 0.5 ? '#00FF00' : healthRatio > 0.25 ? '#FFFF00' : '#FF0000';
    this.ctx.fillStyle = healthColor;
    this.ctx.fillRect(x, y, healthWidth, height);

    // Border
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    // Health text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      `${Math.max(0, Math.floor(character.health))}/${character.maxHealth}`,
      x + width / 2,
      y + height + 15
    );
  }

  renderParticles(particles: Particle[]): void {
    for (const particle of particles) {
      const alpha = 1 - particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = alpha;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }

  renderHUD(state: GameState): void {
    // Player health bar (top-left)
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('PLAYER', 20, 20);
    this.renderHealthBar(state.player, 20, 25, 150);

    // Enemy health bar (top-right)
    this.ctx.textAlign = 'right';
    this.ctx.fillText('ENEMY', CANVAS.WIDTH - 20, 20);
    this.renderHealthBar(state.enemy, CANVAS.WIDTH - 170, 25, 150);

    // Coins and timer (center-top)
    this.ctx.textAlign = 'center';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`Coins: ${state.coins}`, CANVAS.WIDTH / 2, 30);

    // Game time
    const minutes = Math.floor(state.gameTime / 60);
    const seconds = Math.floor(state.gameTime % 60);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(
      `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`,
      CANVAS.WIDTH / 2,
      55
    );

    // Difficulty indicator
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`Difficulty: ${state.difficulty.toUpperCase()}`, CANVAS.WIDTH / 2, 75);
  }

  renderDebug(fps: number, playerState: string, enemyState: string, aiStrategy: string): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 100, 200, 120);

    this.ctx.fillStyle = '#00FF00';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`FPS: ${fps.toFixed(1)}`, 20, 120);
    this.ctx.fillText(`Player: ${playerState}`, 20, 140);
    this.ctx.fillText(`Enemy: ${enemyState}`, 20, 160);
    this.ctx.fillText(`AI: ${aiStrategy}`, 20, 180);
  }
}
