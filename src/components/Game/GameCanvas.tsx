import { useRef, useEffect, useCallback } from 'react';
import { useGameContext } from '../../store/GameContext';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useKeyboard } from '../../hooks/useKeyboard';
import { Renderer } from '../../engine/Renderer';
import { updatePhysics, checkLavaCollision, moveCharacter, jump } from '../../engine/PhysicsEngine';
import { checkSwordHit, getSwordHitbox } from '../../engine/CollisionDetection';
import { EnemyAI } from '../../ai/EnemyAI';
import { DIFFICULTY_SETTINGS } from '../../ai/DifficultySettings';
import { CANVAS, GAME, PHYSICS } from '../../utils/constants';
import { createHitParticles, createHealParticles, createLavaBubble, updateParticles, createFloatingText, updateFloatingTexts, createSwordTrail } from '../../utils/helpers';
import { GameHUD } from '../UI/GameHUD';

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch, saveGame } = useGameContext();
  const inputState = useKeyboard(state.status === 'playing');
  const aiRef = useRef<EnemyAI | null>(null);
  const lastSaveRef = useRef(Date.now());
  const fpsRef = useRef(60);
  const lastFpsUpdate = useRef(Date.now());
  const lastComboHitRef = useRef(Date.now());

  // Initialize AI
  useEffect(() => {
    if (state.status === 'playing' && !aiRef.current) {
      const settings = DIFFICULTY_SETTINGS[state.difficulty];
      aiRef.current = new EnemyAI(state.enemy, state.player, settings);
    }
  }, [state.status, state.difficulty]);

  // Game update loop
  const update = useCallback((deltaTime: number) => {
    if (state.status !== 'playing') return;

    // Update FPS counter
    const now = Date.now();
    if (now - lastFpsUpdate.current > 100) {
      fpsRef.current = 1 / deltaTime;
      lastFpsUpdate.current = now;
    }

    // Create local copies for mutations
    let player = { ...state.player };
    let enemy = { ...state.enemy };

    // Handle player input
    if (inputState.pause) {
      dispatch({ type: 'PAUSE_GAME' });
      return;
    }

    // Player movement
    const moveDir = inputState.left ? -1 : inputState.right ? 1 : 0;
    moveCharacter(player, moveDir as -1 | 0 | 1);

    if (inputState.jump) {
      jump(player);
    }

    // Player attack
    if (inputState.attack && player.attackCooldown <= 0 && !player.isAttacking) {
      player.isAttacking = true;
      player.attackCooldown = player.equippedSword.attackSpeed;
      player.state = 'attacking';

      // Set attack to end after ATTACK_DURATION
      setTimeout(() => {
        if (state.player.id === player.id) {
          dispatch({ type: 'UPDATE_PLAYER', player: { isAttacking: false } });
        }
      }, GAME.ATTACK_DURATION);
    }

    // AI Update
    if (aiRef.current) {
      aiRef.current.updateReferences(enemy, player);
      const aiAction = aiRef.current.update();

      // Apply AI actions
      moveCharacter(enemy, aiAction.move);
      if (aiAction.jump) {
        jump(enemy);
      }
      if (aiAction.attack && enemy.attackCooldown <= 0 && !enemy.isAttacking) {
        enemy.isAttacking = true;
        enemy.attackCooldown = enemy.equippedSword.attackSpeed;
        enemy.state = 'attacking';

        setTimeout(() => {
          if (state.enemy.id === enemy.id) {
            dispatch({ type: 'UPDATE_ENEMY', enemy: { isAttacking: false } });
          }
        }, GAME.ATTACK_DURATION);
      }
    }

    // Update physics
    updatePhysics(player, state.platforms, deltaTime);
    updatePhysics(enemy, state.platforms, deltaTime);

    // Check sword hits
    if (player.isAttacking && checkSwordHit(player, enemy)) {
      let damage = player.equippedSword.damage;

      // Apply combo bonus
      const comboMultiplier = Math.min(1 + (state.combo * GAME.COMBO_DAMAGE_MULTIPLIER), GAME.MAX_COMBO_MULTIPLIER);
      damage *= comboMultiplier;

      // Apply damage boost if active
      const damageBoost = player.activeEffects.find(e => e.type === 'damage_boost');
      if (damageBoost) {
        damage *= damageBoost.value;
      }

      damage = Math.round(damage);

      lastComboHitRef.current = Date.now();
      dispatch({ type: 'INCREMENT_COMBO' });
      dispatch({ type: 'DAMAGE_ENEMY', amount: damage });
      dispatch({ type: 'TRACK_DAMAGE', amount: damage, target: 'enemy' });
      dispatch({ type: 'APPLY_KNOCKBACK', target: 'enemy', direction: player.facing, force: PHYSICS.KNOCKBACK_FORCE });
      dispatch({ type: 'ADD_PARTICLES', particles: createHitParticles(enemy.position.x + enemy.width / 2, enemy.position.y + enemy.height / 2) });
      dispatch({ type: 'ADD_FLOATING_TEXT', text: createFloatingText(enemy.position.x + enemy.width / 2, enemy.position.y, `-${damage}`, '#FF4500', 24) });
      dispatch({ type: 'TRIGGER_SCREEN_SHAKE' });

      // Add sword trail particles
      const swordBox = getSwordHitbox(player);
      dispatch({ type: 'ADD_PARTICLES', particles: createSwordTrail(swordBox.x, swordBox.y, swordBox.width, swordBox.height) });
    }

    // Check combo timeout
    if (state.combo > 0 && Date.now() - lastComboHitRef.current > GAME.COMBO_TIMEOUT) {
      dispatch({ type: 'RESET_COMBO' });
    }

    if (enemy.isAttacking && checkSwordHit(enemy, player)) {
      const damage = enemy.equippedSword.damage;
      dispatch({ type: 'DAMAGE_PLAYER', amount: damage });
      dispatch({ type: 'TRACK_DAMAGE', amount: damage, target: 'player' });
      dispatch({ type: 'RESET_COMBO' }); // Reset combo when hit
      dispatch({ type: 'APPLY_KNOCKBACK', target: 'player', direction: enemy.facing, force: PHYSICS.KNOCKBACK_FORCE });
      dispatch({ type: 'ADD_PARTICLES', particles: createHitParticles(player.position.x + player.width / 2, player.position.y + player.height / 2) });
    }

    // Check lava collisions
    if (checkLavaCollision(player)) {
      dispatch({ type: 'GAME_OVER', winner: 'enemy' });
      return;
    }
    if (checkLavaCollision(enemy)) {
      dispatch({ type: 'GAME_OVER', winner: 'player' });
      return;
    }

    // Check health for game over
    if (player.health <= 0) {
      dispatch({ type: 'GAME_OVER', winner: 'enemy' });
      return;
    }
    if (enemy.health <= 0) {
      dispatch({ type: 'GAME_OVER', winner: 'player' });
      return;
    }

    // Check heal timer
    const currentTime = Date.now();
    if (currentTime - player.lastHealTime >= GAME.HEAL_INTERVAL) {
      const healAmount = Math.min(GAME.HEAL_AMOUNT, player.maxHealth - player.health);
      if (healAmount > 0) {
        dispatch({ type: 'HEAL_CHARACTER', target: 'player', amount: healAmount });
        dispatch({ type: 'ADD_PARTICLES', particles: createHealParticles(player.position.x + player.width / 2, player.position.y) });
      }
      player.lastHealTime = currentTime;
    }
    if (currentTime - enemy.lastHealTime >= GAME.HEAL_INTERVAL) {
      const healAmount = Math.min(GAME.HEAL_AMOUNT, enemy.maxHealth - enemy.health);
      if (healAmount > 0) {
        dispatch({ type: 'HEAL_CHARACTER', target: 'enemy', amount: healAmount });
        dispatch({ type: 'ADD_PARTICLES', particles: createHealParticles(enemy.position.x + enemy.width / 2, enemy.position.y) });
      }
      enemy.lastHealTime = currentTime;
    }

    // Spawn lava bubbles
    if (Math.random() < 0.05) {
      dispatch({ type: 'ADD_PARTICLES', particles: [createLavaBubble(CANVAS.WIDTH / 2)] });
    }

    // Update particles
    const updatedParticles = updateParticles(state.particles, deltaTime);
    dispatch({ type: 'UPDATE_PARTICLES', particles: updatedParticles });

    // Update floating texts
    const updatedTexts = updateFloatingTexts(state.floatingTexts, deltaTime);
    dispatch({ type: 'UPDATE_FLOATING_TEXTS', texts: updatedTexts });

    // Update screen shake
    dispatch({ type: 'UPDATE_SCREEN_SHAKE', deltaTime });

    // Update characters in state
    dispatch({ type: 'SET_PLAYER', player });
    dispatch({ type: 'SET_ENEMY', enemy });

    // Update game time
    dispatch({ type: 'TICK', deltaTime });

    // Auto-save
    if (currentTime - lastSaveRef.current > GAME.AUTO_SAVE_INTERVAL) {
      saveGame();
      lastSaveRef.current = currentTime;
    }
  }, [state, inputState, dispatch, saveGame]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new Renderer(ctx);

    const render = () => {
      // Apply screen shake
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;
        ctx.save();
        ctx.translate(shakeX, shakeY);
      }

      renderer.clear();
      renderer.renderBackground();
      renderer.renderLava();
      renderer.renderPlatforms(state.platforms);
      renderer.renderCharacter(state.player);
      renderer.renderCharacter(state.enemy);
      renderer.renderParticles(state.particles);
      renderer.renderFloatingTexts(state.floatingTexts);
      renderer.renderComboIndicator(state.combo);
      renderer.renderWinStreak(state.winStreak);

      if (state.settings.showFPS && aiRef.current) {
        renderer.renderDebug(
          fpsRef.current,
          state.player.state,
          state.enemy.state,
          aiRef.current.getStrategy(),
          state.combo
        );
      }

      if (state.screenShake > 0) {
        ctx.restore();
      }

      requestAnimationFrame(render);
    };

    render();
  }, [state]);

  useGameLoop(update, state.status === 'playing');

  return (
    <div className="game-container">
      <GameHUD coins={state.coins} gameTime={state.gameTime} difficulty={state.difficulty} />
      <canvas
        ref={canvasRef}
        width={CANVAS.WIDTH}
        height={CANVAS.HEIGHT}
        className="game-canvas"
      />
    </div>
  );
}
