export const renderDie = (ctx: CanvasRenderingContext2D, value: number, progress: number) => {
  const size = 100;
  ctx.clearRect(0, 0, size, size);
  
  ctx.save();
  ctx.translate(size / 2, size / 2);
  
  // Rolling effect: scale and rotate
  if (progress > 0) {
    const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
    ctx.scale(scale, scale);
    ctx.rotate(progress * Math.PI * 4); // spin twice
  }

  const faceSize = 64;
  const half = faceSize / 2;
  const radius = 12;

  // Draw Top Face (3D effect)
  ctx.fillStyle = '#fef9ee'; // parchment-100
  ctx.beginPath();
  ctx.moveTo(-half, -half);
  ctx.lineTo(half, -half);
  ctx.lineTo(half + 8, -half - 8);
  ctx.lineTo(-half + 8, -half - 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Draw Right Face
  ctx.fillStyle = '#d4b483'; // slightly darker
  ctx.beginPath();
  ctx.moveTo(half, -half);
  ctx.lineTo(half + 8, -half - 8);
  ctx.lineTo(half + 8, half - 8);
  ctx.lineTo(half, half);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main Face
  const grad = ctx.createLinearGradient(-half, -half, half, half);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(1, '#fdf0cd');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#d97706'; // gold border
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.roundRect(-half, -half, faceSize, faceSize, radius);
  ctx.fill();
  ctx.stroke();

  // Draw Pips
  ctx.fillStyle = '#1e1b2e'; // obsidian-800
  ctx.shadowColor = 'rgba(255,255,255,0.5)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  const pipOffset = 18;
  const pipRadius = 6;

  const drawPip = (x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, pipRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPips = (val: number) => {
    if (val % 2 === 1) drawPip(0, 0); // Center pip for 1, 3, 5
    if (val > 1) {
      drawPip(-pipOffset, -pipOffset); // Top left
      drawPip(pipOffset, pipOffset);   // Bottom right
    }
    if (val > 3) {
      drawPip(pipOffset, -pipOffset);  // Top right
      drawPip(-pipOffset, pipOffset);  // Bottom left
    }
    if (val === 6) {
      drawPip(-pipOffset, 0);          // Middle left
      drawPip(pipOffset, 0);           // Middle right
    }
  };

  // If rolling, show random pips
  const displayVal = progress > 0 ? Math.floor(Math.random() * 6) + 1 : value;
  drawPips(displayVal);

  ctx.restore();
};
