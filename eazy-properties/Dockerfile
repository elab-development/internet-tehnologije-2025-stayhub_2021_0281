# Koristimo mali Node.js image.
FROM node:22-alpine

# Postavljamo radni folder u containeru.
WORKDIR /app

# Kopiramo package fajlove zbog bržeg Docker cache-a.
COPY package*.json ./

# Instaliramo dependencies.
RUN npm install

# Kopiramo ceo projekat u container.
COPY . .

# Next.js koristi port 3000.
EXPOSE 3000

# Pokrećemo Next.js aplikaciju.
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]