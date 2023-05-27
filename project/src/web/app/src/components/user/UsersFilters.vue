<template>
    <ul class="users-filters">
        <li>
            <RouterLink :to="{ name: 'users-all' }" :class="{ 'btn': true, 'btn--normal': true, 'btn-user-filter': true, 'only-waiting': true, 'active': isRouteActive('users-all') }">
                Tous les utilisateurs
            </RouterLink>
        </li>
        <li>
            <RouterLink :to="{ name: 'friends-all' }" :class="{ 'btn': true, 'btn--normal': true, 'btn-user-filter': true, 'only-waiting': true, 'active': isRouteActive('friends-all') }">
                Mes amis
            </RouterLink>
        </li>
        <li>
            <RouterLink :to="{ name: 'friends-sent' }" :class="{ 'btn': true, 'btn--normal': true, 'btn-user-filter': true, 'only-waiting': true, 'active': isRouteActive('friends-sent') }">
                Demandes envoyées
            </RouterLink>
        </li>
        <li>
            <RouterLink :to="{ name: 'friends-requests' }" :class="{ 'btn': true, 'btn--normal': true, 'btn-user-filter': true, 'only-waiting': true, 'active': isRouteActive('friends-requests') }">
                Demandes reçues
            </RouterLink>
        </li>
    </ul>
</template>

  
<script lang="ts">
import { defineComponent } from "vue";
import { RouterLink, type RouteRecordName } from "vue-router";
import { useRoute } from 'vue-router';

export default defineComponent({
    name: "UsersFilters",
    components: {
        RouterLink
    },
    setup() {
    const route = useRoute();

    const isRouteActive = (routeName: RouteRecordName | null | undefined) => {
        return route.name === routeName;
    };

    return {
        isRouteActive,
    };
},
});
</script>
  
  
<style lang="scss">
.users-filters {
    display: flex;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 1.5rem auto;
    font-size: 0.5rem;
    overflow-x: auto;
    width: 100%;
    justify-content: center;

    -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: none; /* for Firefox */
    &::-webkit-scrollbar{
      display: none;
    } 


    @media screen and (max-width: 768px) {
        justify-content: flex-start;
        padding-right: 1rem !important;
    }

    li {
        margin-left: 1rem;
        font-weight: bold;

        .btn {
            white-space: nowrap;
            &.active {
                background-color: var(--primary-color);
                color: #ffffff;
            }
        }
    }
}
</style>
  