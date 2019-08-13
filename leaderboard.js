const Jimp = require('jimp');
 
const writeScores = (scores) => {
  return new Promise((resolve, reject) => {
    Jimp.read('leaderboard.png', (err, image) => {
      if (err) { 
        return reject(err);
      }

      Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(font => { 
        const textOffset = 50;    
        const tasks = scores.map((score, i) => {
          return image.print(font, 0, 25 * (i + 1) + textOffset, { text: `${score.place}. ${score.user} ${score.score}`, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 600);
        });
        
        Promise.all(tasks).then(() => {
          image.write('render.png', resolve);
        })
      });
    });
  });
};

module.exports = writeScores;