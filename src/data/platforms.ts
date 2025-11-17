import { Platform } from '../types/game';

export const PLATFORMS: Platform[] = [
  // Main platform (center)
  {
    id: 'main',
    x: 300,
    y: 450,
    width: 600,
    height: 30,
    type: 'main',
  },
  // Left floating platforms
  {
    id: 'left_top',
    x: 50,
    y: 250,
    width: 150,
    height: 20,
    type: 'floating',
  },
  {
    id: 'left_mid',
    x: 100,
    y: 350,
    width: 120,
    height: 20,
    type: 'floating',
  },
  // Right floating platforms
  {
    id: 'right_top',
    x: 1000,
    y: 250,
    width: 150,
    height: 20,
    type: 'floating',
  },
  {
    id: 'right_mid',
    x: 980,
    y: 350,
    width: 120,
    height: 20,
    type: 'floating',
  },
  // Center high platform
  {
    id: 'center_top',
    x: 525,
    y: 200,
    width: 150,
    height: 20,
    type: 'floating',
  },
];
