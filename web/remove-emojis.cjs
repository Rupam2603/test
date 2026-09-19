const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}]/gu;

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.md')) {
            results.push(file);
        }
    });
    return results;
}

const files = walkDir('src');
let changedFiles = 0;

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const newContent = content.replace(emojiRegex, '');
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log('Removed emojis from: ' + file);
        changedFiles++;
    }
});

console.log('Total files changed: ' + changedFiles);
