<template>
  <div class="toggle-switch" :class="{ checked: checked }" @click="toggleTheme">
    <div class="toggle-switch-inner"></div>
    <div class="toggle-switch-switch">
      <div class="toggle-switch-icon" v-if="checked">
        <SunIcon :width="18" :height="18" />
      </div>
      <div class="toggle-switch-icon" v-else>
        <MoonIcon :width="18" :height="18" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { SunIcon, MoonIcon } from "@/components/icons";

export default defineComponent({
  name: "ThemeSwitcher",
  data() {
    return {
      isDark: false,
      checked: false,
    };
  },
  components: {
    MoonIcon,
    SunIcon,
  },
  created() {
    this.setTheme;
  },
  computed: {
    setTheme() {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const storedIsDark = sessionStorage.getItem("isDark");
      this.isDark =
        storedIsDark !== null ? storedIsDark === "true" : prefersDark;
      document.body.classList.toggle("dark", this.isDark);
      sessionStorage.setItem("isDark", this.isDark.toString());

      if (this.isDark) {
        this.checked = true;
      } else {
        this.checked = false;
      }
    },
  },
  methods: {
    toggleTheme() {
      this.isDark = !this.isDark;
      this.checked = !this.checked;
      if (this.isDark) {
        document.body.classList.add("dark");
        sessionStorage.setItem("isDark", "true");
      } else {
        document.body.classList.remove("dark");
        sessionStorage.setItem("isDark", "false");
      }
    },
  },
});
</script>

<style lang="scss">
@import "../../assets/stylesheets/partials/base/themes";

// Light theme
:root {
  @each $name, $value in $light-theme {
    --#{ $name }: #{$value};
  }

  @each $name, $value in $default-theme {
    --#{ $name }: #{$value};
  }

  .btn {
    &:hover {
      svg {
        fill: var(--text-color);
      }
    }

    svg {
      fill: #ffffff;
    }

    &--normal {
      color: var(--primary-color);
    }
  }
}

.toggle-switch-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  align-content: center;
  height: 100%;

  svg {
    stroke: var(--svg-color);
  }
}

// Dark theme
.dark {
  @each $name, $value in $dark-theme {
    --#{ $name }: #{$value};
  }

  .toggle-switch-icon {
    svg {
      stroke: var(--border-color);
    }
  }

  .btn {
    &:hover {
      svg {
        fill: #ffffff;
      }
    }

    svg {
      fill: var(--border-color);
    }

    &--normal {
      color: var(--text-color);
    }
  }
}
</style>
