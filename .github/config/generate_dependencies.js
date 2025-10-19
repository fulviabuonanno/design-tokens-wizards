import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package.json'), 'utf8'));
const dependencies = packageJson.dependencies;

// Read package-lock.json to get more details
const packageLock = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'package-lock.json'), 'utf8'));

// Create the dependencies table
const generateDependenciesTable = () => {
  let table = `## 📦 Dependencies Table ✨\n\n`;
  table += `Below is a comprehensive list of all dependencies used in this project:\n\n`;
  table += `| Dependency | Version | Description | Repository |\n`;
  table += `|------------|---------|-------------|------------|\n`;

  // Add each dependency to the table
  for (const [name, version] of Object.entries(dependencies)) {
    const description = getDependencyDescription(name);
    const repository = getDependencyRepository(name);
    table += `| **${name}** | ${version} | ${description} | ${repository} |\n`;
  }

  return table;
};

// Get description for each dependency
const getDependencyDescription = (name) => {
  const descriptions = {
    'chalk': 'Terminal string styling done right',
    'cli-table3': 'Pretty unicode tables for the command line',
    'inquirer': 'A collection of common interactive command line user interfaces',
    'markdown-pdf': 'Markdown to PDF converter',
    'path': 'Node.js path module',
    'tinycolor2': 'Fast, small color manipulation and conversion'
  };
  return descriptions[name] || 'No description available';
};

// Get repository URL for each dependency
const getDependencyRepository = (name) => {
  const repositories = {
    'chalk': '[chalk/chalk](https://github.com/chalk/chalk)',
    'cli-table3': '[cli-table3](https://github.com/cli-table/cli-table3)',
    'inquirer': '[SBoudrias/Inquirer.js](https://github.com/SBoudrias/Inquirer.js)',
    'markdown-pdf': '[alanshaw/markdown-pdf](https://github.com/alanshaw/markdown-pdf)',
    'path': '[nodejs/node](https://github.com/nodejs/node)',
    'tinycolor2': '[bgrins/TinyColor](https://github.com/bgrins/TinyColor)'
  };
  return repositories[name] || 'No repository available';
};

// Read README.md
const readmePath = path.join(__dirname, '..', '..', 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Generate new dependencies table
const newDependenciesTable = generateDependenciesTable();

// Replace the existing dependencies table in README.md
const updatedContent = readmeContent.replace(
  /## 📦 Dependencies Table ✨[\s\S]*?(?=## 📝 License ✨)/,
  newDependenciesTable
);

// Write updated README.md
fs.writeFileSync(readmePath, updatedContent);

console.log('✅ Dependencies table has been updated successfully!'); 