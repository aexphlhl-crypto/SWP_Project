
const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('./src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Revert useClientPagination() back to useClientPagination(data_var)
  // But wait! We don't know what data_var was. We have to look at the previous line or git diff!
});

