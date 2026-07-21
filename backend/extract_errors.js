const fs = require('fs');
const path = require('path');

const appExPattern = /AppException\.(badRequest|notFound|unauthorized|forbidden|internalServerError)\(\s*"(.*?)"\s*\)/g;
const apiResPattern = /ApiResponse\.error\(\s*".*?"\s*,\s*"(.*?)"\s*\)/g;

const strings = new Set();

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.java')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            let match;
            while ((match = appExPattern.exec(content)) !== null) {
                strings.add(match[2]);
            }
            while ((match = apiResPattern.exec(content)) !== null) {
                strings.add(match[1]);
            }
        }
    }
}

walkDir(path.join(__dirname, 'src'));
console.log(JSON.stringify(Array.from(strings), null, 2));
