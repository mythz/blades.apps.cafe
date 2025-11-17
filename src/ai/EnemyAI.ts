import { Character, DifficultySettings, AIAction, AIStrategy } from '../types/game';

export class EnemyAI {
  private enemy: Character;
  private player: Character;
  private settings: DifficultySettings;
  private lastDecision: number = 0;
  private currentStrategy: AIStrategy = 'approach';

  constructor(enemy: Character, player: Character, settings: DifficultySettings) {
    this.enemy = enemy;
    this.player = player;
    this.settings = settings;
  }

  updateReferences(enemy: Character, player: Character): void {
    this.enemy = enemy;
    this.player = player;
  }

  update(): AIAction {
    const now = Date.now();

    // Make decision based on reaction time
    if (now - this.lastDecision >= this.settings.aiReactionTime) {
      this.lastDecision = now;
      return this.makeDecision();
    }

    return this.continueCurrentAction();
  }

  private makeDecision(): AIAction {
    // Evaluate situation
    const distance = this.getDistanceToPlayer();
    const healthRatio = this.enemy.health / this.enemy.maxHealth;

    // Choose strategy
    if (healthRatio < 0.3 && Math.random() > this.settings.aiAggressiveness) {
      this.currentStrategy = 'retreat';
    } else if (distance < this.enemy.equippedSword.range + 80) {
      this.currentStrategy = 'attack';
    } else {
      this.currentStrategy = 'approach';
    }

    return this.executeStrategy();
  }

  private continueCurrentAction(): AIAction {
    return this.executeStrategy();
  }

  private executeStrategy(): AIAction {
    switch (this.currentStrategy) {
      case 'approach':
        return this.approachPlayer();
      case 'attack':
        return this.attackPlayer();
      case 'retreat':
        return this.retreatFromPlayer();
    }
  }

  private approachPlayer(): AIAction {
    const distance = this.player.position.x - this.enemy.position.x;
    const move = distance > 0 ? 1 : -1;

    // Jump if player is significantly higher
    const heightDiff = this.enemy.position.y - this.player.position.y;
    const shouldJump = heightDiff > 50 && this.enemy.isGrounded && Math.random() < 0.3;

    return {
      move: move as -1 | 1,
      jump: shouldJump,
      attack: false,
    };
  }

  private attackPlayer(): AIAction {
    const distance = Math.abs(this.player.position.x - this.enemy.position.x);
    const inRange = distance < this.enemy.equippedSword.range + 40;

    // Attack if in range and accuracy check passes
    const shouldAttack =
      inRange &&
      this.enemy.attackCooldown <= 0 &&
      Math.random() < this.settings.aiAccuracy &&
      !this.enemy.isAttacking;

    // Still try to position
    let move: -1 | 0 | 1 = 0;
    if (!inRange) {
      const distanceX = this.player.position.x - this.enemy.position.x;
      move = distanceX > 0 ? 1 : -1;
    }

    // Dodge if player is attacking
    const shouldDodge =
      this.player.isAttacking &&
      Math.random() < this.settings.aiDodgeChance &&
      this.enemy.isGrounded;

    if (shouldDodge) {
      // Jump away
      const awayDirection = this.player.position.x > this.enemy.position.x ? -1 : 1;
      return {
        move: awayDirection as -1 | 1,
        jump: true,
        attack: false,
      };
    }

    return {
      move,
      jump: false,
      attack: shouldAttack,
    };
  }

  private retreatFromPlayer(): AIAction {
    const distanceX = this.player.position.x - this.enemy.position.x;
    const move = distanceX > 0 ? -1 : 1;

    // Jump to higher platform if available
    const shouldJump = this.enemy.isGrounded && Math.random() < 0.4;

    return {
      move: move as -1 | 1,
      jump: shouldJump,
      attack: false,
    };
  }

  private getDistanceToPlayer(): number {
    const dx = this.player.position.x - this.enemy.position.x;
    const dy = this.player.position.y - this.enemy.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getStrategy(): AIStrategy {
    return this.currentStrategy;
  }
}
