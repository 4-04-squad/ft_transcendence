<template>
    <MainLayout>
      <div id="page-not-found" class="main-page-content">
        <div class="head">
          <h1 class="title">
            <span>404: Page non trouvée</span>
          </h1>
        </div>
        <div class="grid content-wrapper">
          <div class="not-found-content">
            <p>
              La page que vous avez demandée n'existe pas.
            </p>
            <RouterLink to="/">
              <button class="btn btn--primary">Retour à l'accueil</button>
            </RouterLink>
          </div>
        </div>
      </div>
    </MainLayout>
  </template>
  
  <script lang="ts">
  import MainLayout from "@/components/layout/layout/MainLayout.vue";
  import { defineComponent } from "vue";
import { RouterLink } from "vue-router";
  
  export default defineComponent({
    name: "NotFoundView",
    components: {
      MainLayout,
      RouterLink,
    },
  });
  </script>

<style lang="scss">
#page-not-found {
    .not-found-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        text-align: center;
    }
}
</style>

  