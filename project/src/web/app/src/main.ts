import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";

import App from "./App.vue";
import router from "./router";
import axios from "axios";
import { io } from 'socket.io-client'

import "./assets/stylesheets/main.scss";

const socket = io(`${import.meta.env.VITE_APP_API_HOST}:${import.meta.env.VITE_APP_API_PORT}`);

const app = createApp(App).provide("socket", socket);
const pinia = createPinia();

// Set the base URL for Axios requests
axios.defaults.baseURL = "/api";

pinia.use(piniaPersist);
app.use(pinia);
app.use(router);
app.mount("#app");
