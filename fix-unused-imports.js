const fs = require('fs');
const path = require('path');

// Common unused imports to remove
const commonUnusedImports = [
  'fireEvent',
  'cookies',
  'Database',
  'toast',
  'Trophy',
  'Users',
  'Shield',
  'Target',
  'Medal',
  'Crown',
  'Button',
  'ScrollArea',
  'ScrollBar',
  'Skeleton',
  'createClient',
  'Link',
  'Image',
  'Input',
  'Label',
  'Badge',
  'Card',
  'CardContent',
  'CardHeader',
  'CardTitle',
  'CardDescription',
  'Tabs',
  'TabsContent',
  'TabsList',
  'TabsTrigger',
  'Dialog',
  'DialogContent',
  'DialogHeader',
  'DialogTitle',
  'DialogClose',
  'DialogTrigger',
  'Select',
  'SelectContent',
  'SelectItem',
  'SelectTrigger',
  'SelectValue',
  'Separator',
  'Progress',
  'Table',
  'TableBody',
  'TableCell',
  'TableHead',
  'TableHeader',
  'TableRow'
];

function removeUnusedImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Remove entire import lines that are unused
    const lines = content.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is an import line
      if (line.trim().startsWith('import ') && line.includes(' from ')) {
        // Check if any of the common unused imports are in this line
        let shouldRemove = false;
        
        for (const unusedImport of commonUnusedImports) {
          // Check if the import contains only the unused import
          const importRegex = new RegExp(`import\\s*{\\s*${unusedImport}\\s*}\\s*from`);
          if (importRegex.test(line)) {
            shouldRemove = true;
            break;
          }
        }
        
        if (!shouldRemove) {
          newLines.push(line);
        } else {
          modified = true;
          console.log(`Removed: ${line.trim()}`);
        }
      } else {
        newLines.push(line);
      }
    }
    
    if (modified) {
      const newContent = newLines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Modified: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findTypeScriptFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTypeScriptFiles(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Find all TypeScript files
const projectRoot = process.cwd();
const tsFiles = findTypeScriptFiles(projectRoot);

console.log(`Found ${tsFiles.length} TypeScript files`);

let modifiedCount = 0;
for (const file of tsFiles) {
  if (removeUnusedImports(file)) {
    modifiedCount++;
  }
}

console.log(`Modified ${modifiedCount} files`);
