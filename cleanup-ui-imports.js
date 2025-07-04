const fs = require('fs');
const path = require('path');

// Common missing imports and their sources
const missingImports = {
  // UI Components
  'Button': '@/components/ui/button',
  'Badge': '@/components/ui/badge', 
  'Card': '@/components/ui/card',
  'Input': '@/components/ui/input',
  'Label': '@/components/ui/label',
  'Progress': '@/components/ui/progress',
  'Skeleton': '@/components/ui/skeleton',
  'Separator': '@/components/ui/separator',
  'ScrollArea': '@/components/ui/scroll-area',
  
  // Functions
  'createClient': '@/lib/supabase/client',
  'toast': '@/components/ui/use-toast',
  'cookies': 'next/headers'
};

// Components that need specific UI component imports
const uiComponentsMap = {
  'Card': ['Card', 'CardContent', 'CardHeader', 'CardTitle'],
  'ScrollArea': ['ScrollArea', 'ScrollBar']
};

function findMissingImports(content) {
  const missing = [];
  
  // Check for usage of missing imports
  for (const [component, source] of Object.entries(missingImports)) {
    // Look for JSX usage like <Button or toast(
    const jsxPattern = new RegExp(`<${component}[\\s>]`, 'g');
    const funcPattern = new RegExp(`\\b${component}\\(`, 'g');
    
    if (jsxPattern.test(content) || funcPattern.test(content)) {
      // Check if already imported
      const importPattern = new RegExp(`import.*${component}.*from`, 'g');
      if (!importPattern.test(content)) {
        missing.push(component);
      }
    }
  }
  
  return missing;
}

function addMissingImports(content, missingComponents) {
  let updatedContent = content;
  
  // Group imports by source
  const importGroups = {};
  
  missingComponents.forEach(component => {
    const source = missingImports[component];
    if (!importGroups[source]) {
      importGroups[source] = [];
    }
    
    // Add related components for UI components
    if (uiComponentsMap[component]) {
      importGroups[source].push(...uiComponentsMap[component]);
    } else {
      importGroups[source].push(component);
    }
  });
  
  // Remove duplicates
  Object.keys(importGroups).forEach(source => {
    importGroups[source] = [...new Set(importGroups[source])];
  });
  
  // Add import statements after existing imports
  const importRegex = /^import\s+.*from\s+['"][^'"]+['"]/gm;
  const imports = updatedContent.match(importRegex) || [];
  
  let newImports = [];
  
  Object.entries(importGroups).forEach(([source, components]) => {
    // Check if we already have an import from this source
    const existingImport = imports.find(imp => imp.includes(source));
    
    if (existingImport) {
      // Update existing import
      const importMatch = existingImport.match(/import\s+({[^}]*}|\*\s+as\s+\w+|\w+)\s+from/);
      if (importMatch && importMatch[1].startsWith('{')) {
        // Extract existing imports
        const existingComponents = importMatch[1]
          .replace(/[{}]/g, '')
          .split(',')
          .map(c => c.trim())
          .filter(c => c);
        
        // Merge with new components
        const allComponents = [...new Set([...existingComponents, ...components])];
        const newImportLine = `import { ${allComponents.join(', ')} } from "${source}"`;
        
        updatedContent = updatedContent.replace(existingImport, newImportLine);
      }
    } else {
      // Add new import
      if (components.length === 1 && components[0] === 'createClient') {
        newImports.push(`import { createClient } from "${source}"`);
      } else if (components.length === 1 && components[0] === 'toast') {
        newImports.push(`import { toast } from "${source}"`);
      } else if (components.length === 1 && components[0] === 'cookies') {
        newImports.push(`import { cookies } from "${source}"`);
      } else {
        newImports.push(`import { ${components.join(', ')} } from "${source}"`);
      }
    }
  });
  
  // Insert new imports after existing imports
  if (newImports.length > 0 && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = updatedContent.lastIndexOf(lastImport);
    const insertIndex = lastImportIndex + lastImport.length;
    
    updatedContent = 
      updatedContent.slice(0, insertIndex) + 
      '\n' + newImports.join('\n') + 
      updatedContent.slice(insertIndex);
  } else if (newImports.length > 0) {
    // No existing imports, add at the top
    updatedContent = newImports.join('\n') + '\n\n' + updatedContent;
  }
  
  return updatedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const missing = findMissingImports(content);
    
    if (missing.length > 0) {
      console.log(`${filePath}: Adding imports for ${missing.join(', ')}`);
      const updatedContent = addMissingImports(content, missing);
      fs.writeFileSync(filePath, updatedContent);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  let filesProcessed = 0;
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and .next directories
        if (!['node_modules', '.next', '.git'].includes(item)) {
          walkDir(fullPath);
        }
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        if (processFile(fullPath)) {
          filesProcessed++;
        }
      }
    }
  }
  
  walkDir(dirPath);
  console.log(`\nProcessed ${filesProcessed} files with missing imports.`);
}

// Run the script
const projectPath = process.cwd();
console.log('Adding missing UI component and function imports...');
processDirectory(projectPath);
