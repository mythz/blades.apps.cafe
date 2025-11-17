import { useEffect, useState } from 'react';
import { InputState } from '../types/entities';
import { InputHandler } from '../engine/InputHandler';

const inputHandler = new InputHandler();

export function useKeyboard(isActive: boolean): InputState {
  const [inputState, setInputState] = useState<InputState>({
    left: false,
    right: false,
    jump: false,
    attack: false,
    ability1: false,
    ability2: false,
    ability3: false,
    pause: false,
  });

  useEffect(() => {
    if (!isActive) {
      inputHandler.reset();
      return;
    }

    inputHandler.init();

    // Poll input state every frame
    let animationFrameId: number;
    const updateInput = () => {
      setInputState(inputHandler.getInputState());
      animationFrameId = requestAnimationFrame(updateInput);
    };
    animationFrameId = requestAnimationFrame(updateInput);

    return () => {
      cancelAnimationFrame(animationFrameId);
      inputHandler.cleanup();
    };
  }, [isActive]);

  return inputState;
}
