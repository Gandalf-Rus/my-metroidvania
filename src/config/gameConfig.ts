import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene.ts';
import { GameScene } from '../scenes/GameScene.ts';
import { UIScene } from '../scenes/UIScene.ts';
import { PHYSICS_CONFIG } from './physicsConfig.ts';

export const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 480,
  height: 270,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: PHYSICS_CONFIG.gravity },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, UIScene],
  backgroundColor: '#0d0e15',
};

