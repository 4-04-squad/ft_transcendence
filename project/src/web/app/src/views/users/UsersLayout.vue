<template>
  <MainLayout>
    <div class="users-layout main-page-content">
      <div class="users-layout__container">
        <div class="users-layout__content">
          <router-view />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script lang="ts">
import MainLayout from "@/components/layout/layout/MainLayout.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "UsersLayout",
  components: {
    MainLayout,
  },
});
</script>

<style lang="scss">
.page-user {
  .head {
    .user-card {
      position: absolute;
      bottom: -75px;
      left: 50px;

      @media screen and (max-width: 768px) {
        left: 20px;
      }

      &__avatar {
        img {
          border: 4px solid var(--secondary-color);

          @media screen and (max-width: 768px) {
            height: 80px;
            width: 80px;
          }
        }
      }

      &__status {
        @media screen and (max-width: 768px) {
          right: 20px;
          bottom: 20px;
        }
      }

      &__details {
        position: absolute;
        left: 100px;
        @media screen and (max-width: 768px) {
          left: 80px;
        }
      }
    }

    .action-friend {
      position: absolute;
      top: 20px;
      right: 20px;

      .btn--friend {
        .status {
          display: block;
        }
      }
    }

    .shortcut {
      position: absolute;
      top: 20px;
      right: 20px;

      .btn {
        font-size: smaller;
      }
    }
  }
}
</style>
