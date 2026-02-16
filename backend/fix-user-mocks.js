const fs = require('fs');
const path = require('path');

// Find all .spec.ts files
function findSpecFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('dist')) {
      findSpecFiles(filePath, fileList);
    } else if (file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fix User mock objects
function fixUserMocks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Pattern to match User mock objects that are missing the new fields
  const userMockPattern = /const (mock\w*): User = \{([^}]+)\}/gs;
  
  content = content.replace(userMockPattern, (match, varName, props) => {
    // Check if already has the new fields
    if (props.includes('isEmailVerified') || props.includes('emailVerificationToken')) {
      return match;
    }
    
    // Check if it has createdAt (to ensure it's a complete mock)
    if (!props.includes('createdAt')) {
      return match;
    }
    
    modified = true;
    
    // Add the new fields before createdAt
    const updatedProps = props.replace(
      /(\s+createdAt:)/,
      `\n      isEmailVerified: true,\n      emailVerificationToken: null,\n      emailVerificationExpires: null,$1`
    );
    
    return `const ${varName}: User = {${updatedProps}}`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const specFiles = findSpecFiles(srcDir);

console.log(`Found ${specFiles.length} spec files`);

let fixedCount = 0;
specFiles.forEach(file => {
  if (fixUserMocks(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
