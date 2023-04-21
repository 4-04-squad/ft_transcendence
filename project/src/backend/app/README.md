<h1 align="center" style="text-align: center">
    <img alt="42Lausanne" title="42Lausanne" src="https://github.com/MarJC5/42/blob/main/42_logo.svg" width="140"> </br>
    Project - ft_transcendence - backend
    <h4 align="center" style="width: 50%; margin: 2rem auto; font-weight: normal; text-align: center"> 
     This project is about creating a website for the mighty Pong contest
    </h4>
</h1>

## How to use
- Docker and Docker Compose
- A 42 API
- A 42 OAuth application

### Installation

```bash
# Setup .env file
cp .env.example .env # Then fill the data in it

# The DB need to be migrate for the first run of the project
npx prisma migrate dev --name init

# See Model database
yarn prisma studio
open http://localhost:5555/

# See api routes
http://localhost:3001/api
```