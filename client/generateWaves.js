const fs = require('fs');

let paths = '';
// Generate random vertical wavy lines to completely fill a 1440x1000 area
for (let i = -400; i < 2000; i += (15 + Math.random() * 30)) {
  // Use multiple control points for more organic, random waves
  let d = `M${i},-100 `;
  let currentX = i;
  let currentY = -100;
  
  for(let j = 0; j <= 5; j++) {
      const nextY = currentY + 240;
      const nextX = currentX + (Math.random() * 120 - 60); // Drift left/right randomly
      
      const c1x = currentX + (Math.random() * 60 - 30);
      const c1y = currentY + 100;
      
      const c2x = nextX + (Math.random() * 60 - 30);
      const c2y = nextY - 100;
      
      d += `C${c1x},${c1y} ${c2x},${c2y} ${nextX},${nextY} `;
      
      currentX = nextX;
      currentY = nextY;
  }
  
  const opacity = (0.01 + Math.random() * 0.05).toFixed(3);
  const strokeWidth = (0.8 + Math.random() * 1.5).toFixed(2);
  paths += `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${strokeWidth}" opacity="${opacity}" />\n`;
}

const svg = `<svg width="100%" height="100%" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
  ${paths}
</svg>`;

fs.writeFileSync('public/waves-random.svg', svg);
console.log('Successfully generated waves-random.svg');
