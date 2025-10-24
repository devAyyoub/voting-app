# Base image avec Python 3.9 sur Alpine
FROM python:3.9-alpine3.18

# Définir le répertoire de travail
WORKDIR /app

# Copier le fichier des dépendances
COPY requirements.txt /app/requirements.txt

# Installer les dépendances
RUN pip install -r requirements.txt

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port 5000 pour Flask
EXPOSE 5000

# Définir les variables d'environnement pour le mode développement
ENV FLASK_ENV=development
ENV FLASK_DEBUG=1

# Commande de démarrage pour Flask en mode développement
CMD ["flask", "run", "--host=0.0.0.0"]
