<h1 align="center" style="text-align: center">
    <img alt="42Lausanne" title="42Lausanne" src="https://github.com/MarJC5/42/blob/main/42_logo.svg" width="140"> </br>
    Project - ft_transcendence
    <h4 align="center" style="width: 50%; margin: 2rem auto; font-weight: normal; text-align: center"> 
     This project is about creating a website for the mighty Pong contest
    </h4>
</h1>

## Table of Contents

- [Introduction](#Introduction)
- [Documentation](#Documentation)
- [Ressources](#Ressources)

## How to use

### Prerequisites
- Docker and Docker Compose
- A 42 API
- A 42 OAuth application

### Installation

```bash
# Clone the repository
git clone https://github.com/4-04-squad/ft_transcendence.git
cd ft_transcendence/project

# Run the setup script
make setup
# Build the docker images
make build

# Open the website
open http://localhost     # You should see the website
open http://localhost/api # You should see the backend API
```

## Introduction

This project is about creating a website for the mighty Pong contest. The website will be used by the players to
register for the contest, and by the admins to manage the contest. The website will be a single page application, using
the Vue.js framework.
A chat will be available for the players to communicate with each other. The chat will be implemented using websockets.

## Documentation

- [Project subject](res/subject/en.subject.pdf)
- [Back-end documentation](doc/backend.md)
- [Front-end documentation](doc/frontend.md)
- [Database documentation](doc/database.md)
- [Deployment documentation](doc/deployment.md)

## Ressources

What is used in this project:

| Category       | Description                                                     | lien                                                                                   |
|----------------|-----------------------------------------------------------------|----------------------------------------------------------------------------------------|
| __Front-end__  | __Part of the website that the user can see and interact with__ | -                                                                                      |
| ->             | Framework                                                       | [Vue.js](https://vuejs.org/)                                                           |
| ->             | CLI                                                             | [Vue.js CLI](https://cli.vuejs.org/)                                                   |
| ->             | Websocket                                                       | [Socket.io](https://socket.io/)                                                        |
| ->             | State management                                                | [Pinia](https://pinia.esm.dev/)                                                        |
| ->             | Routing                                                         | [Vue Router](https://router.vuejs.org/)                                                |
| ->             | Build tool                                                      | [Vite](https://vitejs.dev/)                                                            |
| ->             | HTTP client                                                     | [Axios](https://axios-http.com/)                                                       |
| ->             | Styling                                                         | [SCSS](https://sass-lang.com/), [Tailwind CSS](https://tailwindcss.com/)               |
| ->             | Game                                                            | [HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)            |
| __Back-end__   | __Manage the data and the logic of the website__                | -                                                                                      |
| ->             | Framework                                                       | [NestJS](https://nestjs.com/)                                                          |
| ->             | ORM                                                             | [Prisma](https://www.prisma.io/)                                                       |
| __Database__   | __Store the data__                                              | -                                                                                      |
| ->             | Database                                                        | [PostgresSQL](https://www.postgresql.org/)                                             |
| __Security__   | __User login managment__                                        | -                                                                                      |
| ->             | API                                                             | [42 API](https://api.intra.42.fr/apidoc/guides/getting_started)                        |
| ->             | Authentification                                                | [Two-factor authentication](https://en.wikipedia.org/wiki/Multi-factor_authentication) |
| __Deployment__ | __Deploy the website on a server__                              | -                                                                                      |
| ->             | Containerization                                                | [Docker](https://www.docker.com/),                                                     |
| ->             | Orchestration                                                   | [Docker Compose](https://docs.docker.com/compose/)                                     |
| __Convention__ | __Organizing the code__                                         | -                                                                                      |
| ->             | Language                                                        | [TypeScript](https://www.typescriptlang.org/)                                          |
| ->             | Linter                                                          | [ESLint](https://eslint.org/)                                                          |
| ->             | Code formatter                                                  | [Prettier](https://prettier.io/)                                                       |

