# Base image avec Go
FROM golang:1.16-alpine

# Définir le répertoire de travail
WORKDIR /go/src/github.com/votingapp/worker

# Copier les fichiers du projet
COPY . .

# Construire l'application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker .

# Commande de démarrage
CMD ["./worker"]
