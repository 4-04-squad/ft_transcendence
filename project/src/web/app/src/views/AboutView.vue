<template>
  <MainLayout>
    <div id="page-about" class="main-page-content">
      <div class="head">
        <h1 class="title">
          <span>À propos</span>
        </h1>
      </div>
      <div class="grid content-wrapper">
        <div class="about-content">
          <h2>ft_transcendence</h2>
          <p>
            Ce projet fait partie du programme de l'école
            <a class="link" href="https://42lausanne.ch/">42Lausanne</a>.
          </p>
          <p>
            Le but de ce projet est de créer une application web qui permet aux
            utilisateurs de créer et de rejoindre des salons de discussion et de
            s'envoyer des messages.
          </p>
          <p>Les utilisateurs peuvent également jouer au pong ensemble.</p>
          <p>
            L'application est construite à l'aide de Vue 3 + Vite, TypeScript,
            NestJS, et est créée avec docker et docker-compose.
          </p>
        </div>
        <div class="about-authors">
          <h2>Auteures</h2>
          <div class="grid">
            <div v-for="author in authors">
              <a
                class="link link--author"
                :href="`https://github.com/${author}`"
              >
                <div class="grid">
                  <div class="avatar"></div>
                  <div>
                    <p>{{ author }}</p>
                    <a :href="`https://github.com/${author}`">
                      <GithubIcon />
                    </a>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts">
import MainLayout from "@/components/layout/layout/MainLayout.vue";
import { defineComponent } from "vue";
import { GithubIcon } from "@/components/icons";

export default defineComponent({
  name: "AboutView",
  components: {
    MainLayout,
    GithubIcon,
  },
  setup() {
    const authors = ["MarJC5", "Yace", "Tywael", "ldominiq", "BolleCola"];
    return { authors };
  },
});
</script>

<style lang="scss">
#page-about {
  .avatar {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background-color: var(--border-color);
  }

  .link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: bold;

    svg {
      fill: var(--text-color);
    }

    &--author {
      color: var(--text-color);

      .grid {
        grid-template-columns: 1fr 3fr;
      }
    }

    &:hover {
      opacity: 0.8;
    }
  }

  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: bold;
  }

  p {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .about-content {
    max-width: 400px;
  }
}
</style>
