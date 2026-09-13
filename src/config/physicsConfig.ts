export interface PhysicsConfig {
  // Horizontal movement
  moveSpeed: number;
  acceleration: number;
  drag: number;

  // Jump mechanics
  jumpVelocity: number;
  variableJumpCut: number;
  coyoteTimeMs: number;
  jumpBufferMs: number;
  gravity: number;

  // Wall mechanics
  wallSlideSpeed: number;
  wallJumpVelocityX: number;
  wallJumpVelocityY: number;
  wallJumpInputLockMs: number;

  // Dash mechanics
  dashSpeed: number;
  dashDurationMs: number;
  dashCooldownMs: number;

  // Pogo mechanics
  pogoVelocityY: number;

  // Combat mechanics
  attackCooldownMs: number;
}

export const PHYSICS_CONFIG: PhysicsConfig = {
  // Horizontal movement
  moveSpeed: 175,
  acceleration: 1000,
  drag: 900,

  // Jump
  jumpVelocity: -370,
  variableJumpCut: 0.45,
  coyoteTimeMs: 110,
  jumpBufferMs: 130,
  gravity: 950,

  // Wall mechanics
  wallSlideSpeed: 55,
  wallJumpVelocityX: 210,
  wallJumpVelocityY: -330,
  wallJumpInputLockMs: 120,

  // Dash
  dashSpeed: 420,
  dashDurationMs: 150,
  dashCooldownMs: 450,

  // Pogo
  pogoVelocityY: -180,

  // Combat
  attackCooldownMs: 340,
};

