const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'backend/src/modules/resource/resource.service.spec.ts',
  'backend/src/modules/auth/auth.service.spec.ts',
  'backend/src/modules/user/user.service.spec.ts',
  'backend/src/modules/post/post.service.spec.ts',
  'backend/src/modules/follow/follow.service.spec.ts',
  'backend/src/modules/upload/upload.service.spec.ts',
  'backend/src/modules/admin/admin.service.spec.ts',
  'backend/src/modules/moderator/moderator.service.spec.ts',
  'backend/src/modules/college/college.service.spec.ts',
  'backend/src/modules/post/post-moderation.service.spec.ts'
];

let totalFixed = 0;

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  // Pattern to match User mock objects that have profilePictureUrl but not coverPhotoUrl
  // This regex looks for profilePictureUrl followed by any content until the closing brace,
  // but only if coverPhotoUrl is not already present
  const regex = /(profilePictureUrl:\s*(?:null|'[^']*'|"[^"]*"),?\s*\n)(\s*)((?!coverPhotoUrl)[^\}]*?\n\s*\})/g;

  let matches = 0;
  content = content.replace(regex, (match, profilePictureLine, indent, rest) => {
    matches++;
    return `${profilePictureLine}${indent}coverPhotoUrl: null,\n${indent}${rest}`;
  });

  if (matches > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${matches} User mocks in ${filePath}`);
    totalFixed += matches;
  } else {
    console.log(`ℹ️  No fixes needed in ${filePath}`);
  }
});

console.log(`\n✅ Total fixed: ${totalFixed} User mocks`);
