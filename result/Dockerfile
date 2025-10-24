# Utiliser l'image Node.js
FROM node:18.12.1-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers du projet
COPY . .

# Exposer le port utilisé par l'application
EXPOSE 5000

# Définir les variables d'environnement pour le mode développement
ENV NODE_ENV=development

# Installer les dépendances
RUN npm ci

# Commande de démarrage pour le mode développement
CMD ["npm", "run", "dev"]
