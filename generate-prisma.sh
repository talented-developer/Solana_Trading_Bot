#!/bin/bash

# Use Git Bash or WSL to handle paths correctly
export PATH="/c/Program Files/nodejs:$PATH"

# Check if schema.prisma has changed
if git diff --name-only HEAD~1 | grep -q "prisma/schema.prisma"; then
  echo "Prisma schema changed. Generating Prisma client..."
  yarn prisma generate
else
  echo "Prisma schema unchanged. Skipping Prisma client generation."
fi