#!/bin/bash

# Script de deploy completo para Netlify
echo "🚀 Iniciando deploy en Netlify..."

# 1. Verificar que tenemos todas las dependencias
echo "📦 Instalando dependencias..."
npm install

# 2. Verificar configuración
echo "🔧 Verificando configuración..."
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró archivo .env"
    echo "Crea un archivo .env con las variables necesarias"
    exit 1
fi

# 3. Build del proyecto
echo "🏗️  Construyendo proyecto..."
npm run build

# 4. Deploy en Netlify
echo "🚀 Desplegando en Netlify..."
if command -v netlify &> /dev/null; then
    netlify deploy --prod --dir=dist
else
    echo "⚠️  Netlify CLI no instalado. Instalando..."
    npm install -g netlify-cli
    netlify login
    netlify deploy --prod --dir=dist
fi

echo "✅ Deploy completado!"
echo "📝 No olvides:"
echo "   1. Configurar variables de entorno en Netlify"
echo "   2. Configurar dominios en Clerk"
echo "   3. Probar la autenticación"
echo "   4. Verificar las APIs"
