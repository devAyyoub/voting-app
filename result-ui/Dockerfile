# Utiliser l'image Node.js
FROM node:18.12.1-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier tous les fichiers dans l'image
COPY . .

# Définir les variables d'environnement pour le mode développement
ENV NODE_ENV=development
ENV NG_CLI_ANALYTICS=ci

# Installer les dépendances
RUN npm ci

# Exposer le port utilisé par l'application
EXPOSE 3000

# Commande de démarrage pour le mode développement
CMD ["npm", "run", "dev"]
