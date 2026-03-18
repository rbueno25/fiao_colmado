# Dockerfile para el Frontend React/Vite
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Exponemos el puerto de Vite por defecto
EXPOSE 5173

# Usamos --host para que Vite sea accesible fuera del contenedor por Docker
CMD ["npm", "run", "dev", "--", "--host"]
