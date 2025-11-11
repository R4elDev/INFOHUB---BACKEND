#!/bin/bash

# Azure deployment script
echo "Iniciando deployment no Azure..."

# Install dependencies
echo "Instalando dependências..."
npm install

# Generate Prisma client
echo "Gerando cliente Prisma..."
npx prisma generate

echo "Deployment concluído!"