let files = [
  "yf.png",
  "yx.jpg",
  "eugene.png",
  "joel.png",
  "jeremy.png",
  "hy.jpg",
];
let images = new Array(6);
let people_names = ["Yu Fei", "Yu Xuan", "Eugene", "Joel", "Jeremy", "Hao Yi"];
let people = new Array(6);
let index = 0;
let hit = false;
let t = 0;

let whip;

let gravity;
let start = false;
let end = false;
let button;

let ordx = 0;
let ordy = 0;
let dirx = 10;
let diry = 10;
setup = () => {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  imageMode(CENTER);

  for (let i = 0; i < files.length; i++) {
    people[i] = new Person(loadImage("images/" + files[i]), people_names[i]);
  }
  gravity = createVector(0, 700);
  whip = new Whip();
  button = new Button();
};

draw = () => {
  background(20);

  if (start && !end) {
    people[index].render();

    whip.update();
    whip.render();
    let end = whip.segments[whip.segments.length - 1].pos;
    if (
      end.x > people[index].x - people[index].dx / 2 &&
      end.x < people[index].x + people[index].dx / 2 &&
      end.y > people[index].y - people[index].dx / 2 &&
      end.y < people[index].y + people[index].dx / 2
    ) {
      hit = true;
    }
  } else if (!start && !end) {
    // noFill();
    textSize(40);
    textAlign(CENTER, CENTER);
    stroke(100, 0, 100);
    fill(100, 0, 100);
    text("SCVU WHIP SIMULATOR", width / 2, 100);
    button.render();
  } else {
    fill(100, 0, 100);
    strokeWeight(0);
    text("CONGRATULATIONS", width / 2, 100);
    ordx += dirx;
    ordy += diry;
    if (ordx > width || ordx < 0) {
      dirx *= -1;
    }
    if (ordy > height || ordy < 0) {
      diry *= -1;
    }
    textSize(80);
    fill(200);
    text("ORD LO", ordx, ordy);
  }
};

onclick = () => {
  if (button.hover()) {
    start = true;
  }
  //   hit = true;
};

class Button {
  constructor() {
    this.x = width / 2;
    this.y = 500;
    this.w = 300;
    this.h = 200;
  }
  render() {
    rectMode(CENTER);
    stroke(100, 100, 255);
    if (this.hover()) {
      fill(200, 0, 200);
    } else {
      fill(100, 0, 100);
    }
    rect(this.x, this.y, this.w, this.h);
    fill(100, 100, 255);

    text("START", this.x, this.y);
  }
  hover() {
    if (
      mouseX > this.x - this.w / 2 &&
      mouseX < this.x + this.w / 2 &&
      mouseY > this.y - this.h / 2 &&
      mouseY < this.y + this.h / 2
    ) {
      return true;
    }
    return false;
  }
}
class Person {
  constructor(image, name) {
    this.img = image;
    this.name = name;
    this.dx = 300;
    this.x = width / 2 + this.dx;
    this.y = height / 2;
  }
  render() {
    push();

    translate(this.x, this.y);
    if (hit) {
      t += 30;
      rotate(8 * sin(t));
      if (t > 1200) {
        t = 0;
        hit = false;
        if (index < 5) {
          index += 1;
        } else {
          start = false;
          end = true;
          return;
        }
      }
    }
    image(this.img, 0, 0, this.dx, this.dx);
    strokeWeight(0);
    fill(255);
    text(this.name, 0, 200);
    translate(-this.x, -this.y);
    pop();
  }
}

class Whip {
  constructor() {
    this.num_segments = 30;
    this.segments = new Array(this.num_segments);
    this.segments[0] = new Segment(mouseX, mouseY, 200);
    for (let i = 1; i < this.num_segments; i++) {
      this.segments[i] = new Segment(
        0,
        0,
        this.segments[i - 1].m,
        this.segments[i - 1]
      );
    }
  }
  update() {
    for (let seg of Object.values(this.segments)) {
      seg.solve();
    }
  }

  render() {
    for (let seg of Object.values(this.segments)) {
      seg.render();
    }
  }
}

class Segment {
  constructor(x, y, mass, parent = null) {
    this.parent = parent;
    this.length = 20;
    this.k = 140;
    this.friction = 200;
    this.air = 80;
    this.pos = createVector(x, y);
    this.a = createVector(0, 0);
    this.v = createVector(0, 0);
    this.m = 500;
  }

  push(force) {
    let f = force.copy().mult(1 / this.m);
    this.a.add(f);
    // this.a = force.copy();
    this.v.add(this.a);
    // if (this.v.mag() > 50) {
    //   this.v.mult(50 / this.v.mag());
    // }
    this.pos.add(this.v);
    this.a.mult(0);
  }
  solve() {
    if (this.parent) {
      let vector = this.pos.copy().sub(this.parent.pos);
      let r = vector.mag();
      let force = createVector(0, 0);
      if (r != 0) {
        force.add(vector.copy().mult(-((r - this.length) * this.k) / r));
        // console.log(this.v.sub(this.parent.v).mult(this.friction));
      }
      force.sub(this.v.copy().sub(this.parent.v).mult(this.friction));
      force.add(gravity);
      force.add(this.v.copy().mult(-this.air));
      this.push(force);
      this.parent.push(createVector(0, 0).sub(force));
    } else {
      //   console.log(mouseX, mouseY);
      this.v = createVector(0, 0);

      this.pos.x = mouseX;
      this.pos.y = mouseY;
    }
  }

  render() {
    translate(0, 0);
    strokeWeight(9);
    stroke(200);
    if (this.parent) {
      line(this.parent.pos.x, this.parent.pos.y, this.pos.x, this.pos.y);
    }
    noFill();
    stroke(150);
    strokeWeight(10);
    ellipse(this.pos.x, this.pos.y, 4);
  }
}
