const Jimp = require('jimp');
 
const writeScores = (scores, reward) => {
  return new Promise((resolve, reject) => {
    Jimp.read('leaderboard.png', (err, image) => {
      if (err) { 
        return reject(err);
      }

      Jimp.loadFont(Jimp.FONT_SANS_16_WHITE).then(font => { 
        const textOffset = 45;    
        const tasks = scores.map((score, i) => {
          return image.print(font, 0, 25 * (i + 1) + textOffset, { text: `${score.place}. ${score.user} ${score.score}`, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 600);
        });

        tasks.push(image.print(font, 0, 16, { text: `${reward} TIX reward`, alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT }, 585));
        
        Promise.all(tasks).then(() => {
          image.write('render.png', resolve);
        })
      });
    });
  });
};

module.exports = writeScores;