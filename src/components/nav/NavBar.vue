<template>
  <!-- Create a container element for the navbar -->
  <nav class="bg-gray-800">
    <!-- Create a toggle button for the navbar menu on small screens -->
    <button
      class="md:hidden border border-white flex items-center px-3 py-2 rounded text-white"
      @click="showMenu = !showMenu"
    >
      <svg
        class="fill-current h-3 w-3"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Menu</title>
        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
      </svg>
    </button>
    <!-- Create the navbar menu -->
    <div
      :class="[
        'w-full block flex-grow md:flex md:items-center md:w-auto',
        { hidden: !showMenu },
      ]"
    >
      <!-- Create the navbar links -->
      <div class="text-sm md:flex-grow">
        <router-link :to="{ path: '/' }">
          <a
            href="#"
            class="block mt-4 md:inline-block md:mt-0 mr-6 text-white hover:text-gray-300"
            >Home</a
          >
        </router-link>
        <router-link :to="{ path: '/' }">
          <a
            href="#"
            class="block mt-4 md:inline-block md:mt-0 mr-6 text-white hover:text-gray-300"
            >About</a
          >
        </router-link>
        <router-link :to="{ path: '/tahleel' }">
          <a
            href="#"
            class="block mt-4 md:inline-block md:mt-0 mr-6 text-white hover:text-gray-300"
            >About</a
          >
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
export default defineComponent({
  data() {
    return {
      showMenu: false,
    };
  },
});
</script>
