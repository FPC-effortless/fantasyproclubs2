const fs = require('fs');
const path = require('path');

const projectDir = process.cwd();

// Common imports that need to be added
const commonImports = {
  'toast': 'import { toast } from "@/components/ui/use-toast"',
  'createClient': 'import { createClient } from "@/lib/supabase/client"',
  'Card': 'import { Card } from "@/components/ui/card"',
  'Button': 'import { Button } from "@/components/ui/button"', 
  'Badge': 'import { Badge } from "@/components/ui/badge"',
  'Database': 'import type { Database } from "@/types/database"',
  'Input': 'import { Input } from "@/components/ui/input"',
  'Label': 'import { Label } from "@/components/ui/label"',
  'Skeleton': 'import { Skeleton } from "@/components/ui/skeleton"',
  'Trophy': 'import { Trophy } from "lucide-react"'
};

// Functions to check if import already exists
function hasImport(content, importName) {
  const patterns = [
    new RegExp(`import\\s*{[^}]*\\b${importName}\\b[^}]*}`, 'g'),
    new RegExp(`import\\s+${importName}\\s+from`, 'g'),
    new RegExp(`import\\s*{[^}]*}\\s*from\\s*["'][^"']*${importName}`, 'g')
  ];
  return patterns.some(pattern => pattern.test(content));
}

function isUsedInFile(content, name) {
  // More comprehensive usage check
  const usagePatterns = [
    new RegExp(`\\b${name}\\s*\\(`, 'g'), // Function call
    new RegExp(`<${name}\\b`, 'g'), // JSX component
    new RegExp(`\\b${name}\\.`, 'g'), // Property access
    new RegExp(`\\b${name}\\s*=`, 'g'), // Assignment
    new RegExp(`\\b${name}\\s*:`, 'g'), // Type annotation
    new RegExp(`\\b${name}\\['`, 'g'), // Bracket notation
  ];
  
  return usagePatterns.some(pattern => pattern.test(content));
}

function addMissingImports(filePath, content) {
  let modifiedContent = content;
  const addedImports = [];

  // Check each common import
  Object.entries(commonImports).forEach(([name, importStatement]) => {
    if (isUsedInFile(content, name) && !hasImport(content, name)) {
      addedImports.push(importStatement);
    }
  });

  // Add imports at the top of the file after existing imports
  if (addedImports.length > 0) {
    const lines = modifiedContent.split('\n');
    let lastImportIndex = -1;
    
    // Find the last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('export ')) {
        lastImportIndex = i;
      }
    }
    
    // Insert new imports after the last import
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, ...addedImports);
    } else {
      // If no imports found, add at the beginning
      lines.splice(0, 0, ...addedImports);
    }
    
    modifiedContent = lines.join('\n');
  }

  return { modifiedContent, addedImports };
}

function removeUnusedImports(content) {
  const lines = content.split('\n');
  const modifiedLines = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('import ')) {
      // Extract imported names
      const match = line.match(/import\s*{([^}]*)}\s*from/);
      if (match) {
        const imports = match[1].split(',').map(imp => imp.trim());
        const usedImports = imports.filter(imp => {
          const cleanName = imp.replace(/\s+as\s+\w+$/, '').trim();
          return isUsedInFile(content, cleanName);
        });
        
        if (usedImports.length > 0) {
          const newLine = line.replace(/import\s*{[^}]*}/, `import { ${usedImports.join(', ')} }`);
          modifiedLines.push(newLine);
        }
        // Skip line if no imports are used
      } else {
        // Keep non-destructured imports
        modifiedLines.push(line);
      }
    } else {
      modifiedLines.push(line);
    }
  }
  
  return modifiedLines.join('\n');
}

function markUnusedVariables(content) {
  // Mark unused function parameters with underscore
  let modifiedContent = content;
  
  // Pattern for function parameters that are declared but not used
  const patterns = [
    /(\w+): (\w+),?\s*\) => {/g,
    /(\(\s*)(\w+)(\s*,|\s*\))/g,
  ];
  
  // This is a simplified approach - in practice you'd need more sophisticated parsing
  return modifiedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Add missing imports
    const { modifiedContent: contentWithImports, addedImports } = addMissingImports(filePath, content);
    
    // Remove unused imports
    const finalContent = removeUnusedImports(contentWithImports);
    
    // Only write if content changed
    if (finalContent !== content) {
      fs.writeFileSync(filePath, finalContent, 'utf-8');
      
      if (addedImports.length > 0) {
        console.log(`✅ ${filePath}: Added ${addedImports.length} missing imports`);
      } else {
        console.log(`🧹 ${filePath}: Cleaned up unused imports`);
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findRelevantFiles() {
  const extensions = ['.tsx', '.ts'];
  const excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git'];
  const files = [];

  function scanDirectory(dir) {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !excludeDirs.includes(entry.name)) {
          scanDirectory(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }

  scanDirectory(projectDir);
  return files;
}

console.log('🚀 Starting comprehensive TypeScript error cleanup...');

const files = findRelevantFiles();
console.log(`📁 Found ${files.length} TypeScript/React files to process`);

let processedCount = 0;
let modifiedCount = 0;

for (const file of files) {
  processedCount++;
  
  if (processFile(file)) {
    modifiedCount++;
  }
  
  // Log progress every 50 files
  if (processedCount % 50 === 0) {
    console.log(`📊 Progress: ${processedCount}/${files.length} files processed`);
  }
}

console.log('✨ Cleanup completed!');
console.log(`📊 Summary: ${modifiedCount} files modified out of ${processedCount} processed`);
console.log('🔍 Run TypeScript check again to see remaining issues');
