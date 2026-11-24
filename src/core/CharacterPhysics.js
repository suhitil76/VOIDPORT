import * as THREE from 'three';

/**
 * CharacterPhysics
 * Kinematic character controller with ground raycasting, step climbing (curbs/ramps),
 * wall sliding, and gravity.
 */
export class CharacterPhysics {
  constructor() {
    this.position = new THREE.Vector3(0, 1.65, 32); // Start on plaza facing the Landmark Spire
    this.velocity = new THREE.Vector3();
    this.isGrounded = false;

    // Physical dimensions
    this.height = 1.8;
    this.eyeHeight = 1.65;
    this.radius = 0.45;
    this.stepHeight = 0.35; // Maximum curb/step height player can step up automatically

    // Constants
    this.gravity = 22.0;
    this.walkSpeed = 5.5;
    this.sprintSpeed = 9.2;
    this.jumpForce = 7.5;
    this.damping = 10.0;

    // Collision volumes (registered by buildings, barriers, props)
    this.colliders = [];

    // Raycaster for ground detection
    this.downRay = new THREE.Raycaster();
    this.downRay.far = 4.0;
  }

  addCollider(box3) {
    if (box3 instanceof THREE.Box3) {
      this.colliders.push(box3);
    } else if (box3.isMesh) {
      box3.geometry.computeBoundingBox();
      const worldBox = box3.geometry.boundingBox.clone().applyMatrix4(box3.matrixWorld);
      this.colliders.push(worldBox);
    }
  }

  update(delta, inputVector, isSprinting, shouldJump, cameraYaw) {
    // 1. Calculate horizontal intent relative to camera yaw
    const targetSpeed = isSprinting ? this.sprintSpeed : this.walkSpeed;
    const moveDirection = new THREE.Vector3();

    if (inputVector.lengthSq() > 0.001) {
      // Forward/backward (Z) and Strafe (X)
      moveDirection.x = inputVector.x;
      moveDirection.z = inputVector.z;
      moveDirection.normalize();
      moveDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);
    }

    // Smooth horizontal acceleration
    const accel = this.isGrounded ? 45.0 : 15.0;
    this.velocity.x += (moveDirection.x * targetSpeed - this.velocity.x) * Math.min(1.0, accel * delta);
    this.velocity.z += (moveDirection.z * targetSpeed - this.velocity.z) * Math.min(1.0, accel * delta);

    // 2. Gravity and Jump
    if (this.isGrounded) {
      this.velocity.y = 0;
      if (shouldJump) {
        this.velocity.y = this.jumpForce;
        this.isGrounded = false;
      }
    } else {
      this.velocity.y -= this.gravity * delta;
    }

    // 3. Horizontal Collision Resolution (X and Z separate to enable wall sliding)
    const nextX = this.position.x + this.velocity.x * delta;
    if (!this.checkHorizontalCollision(nextX, this.position.y, this.position.z)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = 0;
    }

    const nextZ = this.position.z + this.velocity.z * delta;
    if (!this.checkHorizontalCollision(this.position.x, this.position.y, nextZ)) {
      this.position.z = nextZ;
    } else {
      this.velocity.z = 0;
    }

    // 4. Vertical Movement & Step Climbing
    this.position.y += this.velocity.y * delta;

    // Check ground level
    const groundY = this.findGroundY(this.position.x, this.position.y, this.position.z);
    const targetFeetY = groundY;
    const currentFeetY = this.position.y - this.eyeHeight;

    if (currentFeetY <= targetFeetY + 0.05 && this.velocity.y <= 0) {
      // Snap to ground or curb
      this.position.y = targetFeetY + this.eyeHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Prevent falling below world base
    if (this.position.y < this.eyeHeight) {
      this.position.y = this.eyeHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    }
  }

  findGroundY(x, y, z) {
    let highestGround = 0.0; // Default road height

    const playerBox = new THREE.Box3(
      new THREE.Vector3(x - this.radius, 0, z - this.radius),
      new THREE.Vector3(x + this.radius, y, z + this.radius)
    );

    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      // Check if horizontal overlap exists and collider is below player step range
      if (
        playerBox.min.x < box.max.x && playerBox.max.x > box.min.x &&
        playerBox.min.z < box.max.z && playerBox.max.z > box.min.z
      ) {
        if (box.max.y <= y + this.stepHeight && box.max.y > highestGround) {
          highestGround = box.max.y;
        }
      }
    }
    return highestGround;
  }

  checkHorizontalCollision(x, y, z) {
    const feetY = y - this.eyeHeight;
    const headY = y + 0.15;

    // Check against registered colliders
    for (let i = 0; i < this.colliders.length; i++) {
      const box = this.colliders[i];
      // If the obstacle is higher than our step height, it's a solid blocking wall
      if (box.max.y > feetY + this.stepHeight && box.min.y < headY) {
        if (
          x + this.radius > box.min.x && x - this.radius < box.max.x &&
          z + this.radius > box.min.z && z - this.radius < box.max.z
        ) {
          return true; // Collision detected
        }
      }
    }
    return false;
  }
}
