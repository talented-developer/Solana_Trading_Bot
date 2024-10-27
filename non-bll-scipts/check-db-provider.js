const fs = require('fs');
const path = require('path');

const prismaSchemaPath = path.resolve(__dirname, '../prisma/schema.prisma');

try {
  const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
  const lines = schemaContent.split('\n');
  let providerFound = false;
  for (const line of lines) {
    const trimmedLine = line.split('//')[0].trim();
    if (trimmedLine.startsWith('provider =')) {
      const providerMatch = trimmedLine.match(/provider\s*=\s*"(\w+)"/);
      if (providerMatch) {
        const provider = providerMatch[1].toLowerCase();
        if (provider === 'sqlite') {
          process.exit(1);
        } else if (provider === 'postgresql') {
          providerFound = true;
        } else {
          process.exit(1);
        }
      }
    }
  }
  if (!providerFound) {
    console.error('Error: No active database provider found in schema.prisma.');
    process.exit(1);
  }
} catch (error) {
  console.error('Error reading schema file:', error);
  process.exit(1);
}