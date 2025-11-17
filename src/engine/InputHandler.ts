import { CONTROLS } from '../utils/constants';
import { InputState } from '../types/entities';

export class InputHandler {
  private keys: Set<string> = new Set();
  private justPressed: Set<string> = new Set();

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
  }

  init(): void {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  cleanup(): void {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.keys.has(event.key)) {
      this.justPressed.add(event.key);
    }
    this.keys.add(event.key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.keys.delete(event.key);
    this.justPressed.delete(event.key);
  }

  getInputState(): InputState {
    return {
      left: this.isKeyDown(CONTROLS.MOVE_LEFT),
      right: this.isKeyDown(CONTROLS.MOVE_RIGHT),
      jump: this.isKeyJustPressed(CONTROLS.JUMP),
      attack: this.isKeyJustPressed(CONTROLS.ATTACK),
      ability1: this.isKeyJustPressed(CONTROLS.ABILITY_1),
      ability2: this.isKeyJustPressed(CONTROLS.ABILITY_2),
      ability3: this.isKeyJustPressed(CONTROLS.ABILITY_3),
      pause: this.isKeyJustPressed(CONTROLS.PAUSE),
    };
  }

  private isKeyDown(keys: readonly string[]): boolean {
    return keys.some(key => this.keys.has(key));
  }

  private isKeyJustPressed(keys: readonly string[]): boolean {
    const pressed = keys.some(key => this.justPressed.has(key));
    if (pressed) {
      // Clear just pressed for these keys
      keys.forEach(key => this.justPressed.delete(key));
    }
    return pressed;
  }

  reset(): void {
    this.keys.clear();
    this.justPressed.clear();
  }
}
