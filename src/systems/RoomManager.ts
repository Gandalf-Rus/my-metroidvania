import Phaser from 'phaser';
import { Player } from '../entities/Player.ts';
import { ROOMS, type RoomConfig, type DoorwayConfig } from '../config/rooms.ts';

export class RoomManager {
  private scene: Phaser.Scene;
  private player: Player;
  private currentRoom: RoomConfig;
  private isTransitioning: boolean = false;
  private transitionCooldownTimer: number = 0;
  private doorwaySensors!: Phaser.Physics.Arcade.StaticGroup;

  constructor(scene: Phaser.Scene, player: Player, initialRoomId: string = 'room_1_cavern') {
    this.scene = scene;
    this.player = player;
    this.currentRoom = ROOMS[initialRoomId] || ROOMS.room_1_cavern;
  }

  public init(): void {
    const cam = this.scene.cameras.main;

    // Set initial camera bounds strictly to current room
    cam.setBounds(
      this.currentRoom.bounds.x,
      this.currentRoom.bounds.y,
      this.currentRoom.bounds.width,
      this.currentRoom.bounds.height
    );

    // Keep player in the central third of the 480x270 screen rectangle
    cam.setDeadzone(160, 90);
    cam.startFollow(this.player, true, 0.08, 0.08);

    // Build doorway sensor triggers
    this.doorwaySensors = this.scene.physics.add.staticGroup();

    Object.values(ROOMS).forEach((room) => {
      room.doorways.forEach((door) => {
        const sensor = this.scene.add.rectangle(
          door.triggerRect.x + door.triggerRect.width / 2,
          door.triggerRect.y + door.triggerRect.height / 2,
          door.triggerRect.width,
          door.triggerRect.height
        );
        this.scene.physics.add.existing(sensor, true);
        sensor.setData('doorway', door);
        this.doorwaySensors.add(sensor);
      });
    });

    // Overlap trigger with Player
    this.scene.physics.add.overlap(
      this.player,
      this.doorwaySensors,
      (_playerObj, sensorObj) => {
        const gameObject = sensorObj as unknown as Phaser.GameObjects.GameObject;
        const door = gameObject.getData('doorway') as DoorwayConfig | undefined;
        if (!door) return;

        if (
          door.sourceRoomId === this.currentRoom.id &&
          !this.isTransitioning &&
          this.transitionCooldownTimer <= 0
        ) {
          this.executeTransition(door);
        }
      }
    );
  }

  public update(_time: number, delta: number): void {
    if (this.transitionCooldownTimer > 0) {
      this.transitionCooldownTimer = Math.max(0, this.transitionCooldownTimer - delta);
    }
  }

  public getCurrentRoom(): RoomConfig {
    return this.currentRoom;
  }

  public getIsTransitioning(): boolean {
    return this.isTransitioning;
  }

  /**
   * Authentic Hollow Knight / Silksong room transition:
   * Quick black fade out (160ms) -> room swap & bounds re-clamp -> fade in (160ms).
   */
  public executeTransition(door: DoorwayConfig): void {
    const targetRoom = ROOMS[door.targetRoomId];
    if (!targetRoom || this.isTransitioning) return;

    this.isTransitioning = true;
    this.player.setControlLocked(true);

    const cam = this.scene.cameras.main;

    this.scene.events.emit('room-transition-start', {
      from: this.currentRoom,
      to: targetRoom,
      direction: door.direction,
    });

    // 1. Quick Fade Out to Black
    cam.fadeOut(160, 0, 0, 0, (_camera: Phaser.Cameras.Scene2D.Camera, progress: number) => {
      if (progress === 1) {
        // 2. Room Swap during total darkness
        this.currentRoom = targetRoom;
        this.player.setPosition(door.targetPlayerPos.x, door.targetPlayerPos.y);
        this.player.body.setVelocity(0, 0);

        // 3. Re-clamp camera bounds strictly to target room and center on player
        cam.setBounds(
          targetRoom.bounds.x,
          targetRoom.bounds.y,
          targetRoom.bounds.width,
          targetRoom.bounds.height
        );
        cam.centerOn(door.targetPlayerPos.x, door.targetPlayerPos.y);

        // 4. Quick Fade In
        cam.fadeIn(160, 0, 0, 0, (_c2: Phaser.Cameras.Scene2D.Camera, progress2: number) => {
          if (progress2 === 1) {
            this.player.setControlLocked(false);
            this.isTransitioning = false;
            this.transitionCooldownTimer = 400; // Grace period to prevent immediate doorway bounce

            this.scene.events.emit('room-changed', targetRoom);
          }
        });
      }
    });
  }
}
