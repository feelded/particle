class Particle {
  constructor(x, y) {
    this.pos = new Vector(x, y);
    this.prevPos = new Vector(x, y);
    this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5);
    this.acc = new Vector(0, 0);
  }

  move(acc, delta) {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
    if (acc) {
      acc.multTo(delta * 0.07);
      if (pointerPos.x !== undefined && pointerPos.y !== undefined) {
        const diff = pointerPos.sub(this.pos);
        const dist = diff.getLength();
        if (dist < w * 0.05) {
          acc.addTo(diff.rotate(Math.PI));
        }
      }
      this.acc.addTo(acc);
    }
    this.vel.addTo(this.acc);
    this.pos.addTo(this.vel);
    if (this.vel.getLength() > config.particleSpeed) {
      this.vel.setLength(config.particleSpeed);
    }

    this.acc.x = 0;
    this.acc.y = 0;
  }

  drawLine() {
    ctx.beginPath();
    ctx.moveTo(this.prevPos.x, this.prevPos.y);
    ctx.lineTo(this.pos.x, this.pos.y);
    ctx.stroke();
  }

  wrap() {
    if (this.pos.x > w) {
      this.prevPos.x = this.pos.x = 0;
    } else if (this.pos.x < 0) {
      this.prevPos.x = this.pos.x = w - 1;
    }
    if (this.pos.y > h) {
      this.prevPos.y = this.pos.y = 0;
    } else if (this.pos.y < 0) {
      this.prevPos.y = this.pos.y = h - 1;
    }
  }}


let canvas;
let ctx;
let field;
let w, h;
let size;
let rows;
let columns;
let then;
let hue;
let particles;
let config;
let pointerPos;


function setup() {
  pointerPos = new Vector(undefined, undefined);
  then = performance.now();
  size = 3;
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  window.addEventListener("resize", reset);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerleave", pointerLeave);
  reset();

  config = {
    zoom: w * 0.08,
    noiseSpeed: 0.0007,
    particleSpeed: 1.5 };

}

function pointerMove(event) {
  pointerPos.x = event.clientX;
  pointerPos.y = event.clientY;
}

function pointerLeave(event) {
  pointerPos.x = undefined;
  pointerPos.y = undefined;
}

function reset() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  columns = Math.floor(w / size) + 1;
  rows = Math.floor(h / size) + 1;
  initParticles();
  initField();
  drawText();
  drawBackground(1);
}

function initParticles() {
  particles = [];
  let numberOfParticles = w * h / 200;
  for (let i = 0; i < numberOfParticles; i++) {
    let particle = new Particle(Math.random() * w, Math.random() * h);
    particles.push(particle);
  }
}

function draw(now) {
  requestAnimationFrame(draw);
  drawBackground(0.06);
  calculateField();
  const delta = now - then;
  drawParticles(delta);
  then = now;
}

function initField() {
  field = new Array(columns);
  for (let x = 0; x < columns; x++) {
    field[x] = new Array(columns);
    for (let y = 0; y < rows; y++) {
      field[x][y] = new Vector(0, 0);
    }
  }
}

function calculateField() {
  let x1;
  let y1;
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      let color = buffer32[y * size * w + x * size];
      if (color) {
        x1 = (Math.random() - 0.5) * 2;
        y1 = (Math.random() - 0.5) * 2;
      } else {
        x1 = 0;
        y1 = 0.1;
      }
      field[x][y].x = x1;
      field[x][y].y = y1;
    }
  }
}

function drawBackground(alpha) {
  ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  ctx.fillRect(0, 0, w, h);
}

function drawText() {
  ctx.save();
  ctx.fillStyle = "white";
  ctx.fillRect(0, h * 0.25, w, h * 0.1);
  ctx.fillRect(0, h * 0.65, w, h * 0.1);
  ctx.restore();
  let image = ctx.getImageData(0, 0, w, h);
  buffer32 = new Uint32Array(image.data.buffer);
}

function drawParticles(delta) {
  ctx.strokeStyle = "white";
  let x;
  let y;
  particles.forEach(p => {
    x = p.pos.x / size;
    y = p.pos.y / size;
    let v;
    if (x >= 0 && x < columns && y >= 0 && y < rows) {
      v = field[Math.floor(x)][Math.floor(y)];
    }
    p.move(v, delta);
    p.wrap();
    p.drawLine();
  });
}

setup();
draw(performance.now());
