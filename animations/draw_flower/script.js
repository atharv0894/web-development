const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// glow effect
ctx.shadowColor = "white";
ctx.shadowBlur = 5;

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;

    this.size = 0;
    this.maxSize = 25 + Math.random()*25;

    this.petals = 6 + Math.floor(Math.random()*4);
    this.color = `hsl(${Math.random()*360}, 80%, 60%)`;
    this.rotation = Math.random()*Math.PI;

    // stem animation
    this.stemHeight = 0;
    this.maxStem = canvas.height - y;
  }

  drawStem() {
    ctx.strokeStyle = "limegreen";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x, canvas.height);
    ctx.lineTo(this.x, canvas.height - this.stemHeight);
    ctx.stroke();
  }

  drawPetal(angle) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(angle + this.rotation);

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(
      15, 0,
      this.size,
      this.size/2,
      0,
      0,
      Math.PI*2
    );
    ctx.fill();

    ctx.restore();
  }

  drawCenter() {
    ctx.fillStyle = "yellow";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size*0.6, 0, Math.PI*2);
    ctx.fill();
  }

  update() {

    // MUCH FASTER STEM
    if (this.stemHeight < this.maxStem) {
      let speed = Math.max(10, this.maxStem / 30);  // was /80
      this.stemHeight += speed;
    }

    // BLOOM MUCH EARLIER + FASTER
    if (this.size < this.maxSize && this.stemHeight >= this.maxStem * 0.3) {
      this.size += 0.9;   // was 0.35
    }

    this.drawStem();

    let step = (Math.PI*2) / this.petals;
    for(let i = 0; i < this.petals; i++){
      this.drawPetal(i * step);
    }

    this.drawCenter();
  }
}

let flowers = [];

function addFlower(x,y){
  flowers.push(new Flower(x,y));
}

canvas.addEventListener("click", e => {
  addFlower(e.clientX, e.clientY);
});

canvas.addEventListener("touchstart", e => {
  const t = e.touches[0];
  addFlower(t.clientX, t.clientY);
});

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  flowers.forEach(f => f.update());
  requestAnimationFrame(animate);
}

animate();
