<template>
  <!-- Create a container element for the navbar -->
  <nav class="p-3" :class="menuOpen ? 'bg-inherit' : 'bg-gray-800'">
    <!-- Create a toggle button for the navbar menu on small screens -->
    <div :class="{ hidden: menuOpen }" class="flex justify-between md:hidden">
      <button
        class="border border-white flex items-center px-3 py-2 rounded text-white"
        @click="toggleMenu"
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
      <button
        class="border-white flex items-center px-3 py-2 rounded text-white arrow-left"
        @click="goBack"
      >
        back
        <!-- <icon title="back" /> -->
      </button>
    </div>
    <!-- Create the navbar menu -->
    <transition :duration="0.4" mode="out-in">
      <div
        :class="[
          'w-[75vw] absolute bg-gray-800 left-0 h-full p-3 -mt-3 flex-grow md:flex md:items-center md:w-auto',
          { hidden: !menuOpen },
        ]"
      >
        <button
          class="md:hidden border border-white flex items-center px-3 py-2 rounded text-white"
          @click="toggleMenu"
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
        <!-- Create the navbar links -->
        <div class="text-sm md:flex-grow">
          <router-link :to="{ path: '/' }">
            <a
              href="#"
              class="block mt-4 md:inline-block md:mt-0 mr-6 text-white hover:text-gray-300"
              >Home</a
            >
          </router-link>
          <router-link :to="{ path: '/tasbeeh' }">
            <a
              href="#"
              class="block mt-4 md:inline-block md:mt-0 mr-6 text-white hover:text-gray-300"
              >Tasbeeh List</a
            >
          </router-link>
          <router-link :to="{ path: '/tasbeeh/add' }">
            <a
              href="#"
              class="block mt-4 md:inline-block md:mt-0 mr-6 text-white hover:text-gray-300"
              >Add Tasbeeh</a
            >
          </router-link>
          <router-link :to="{ path: '/about' }">
            <a
              href="#"
              class="block mt-4 md:inline-block md:mt-0 mr-6 text-white hover:text-gray-300"
              >About</a
            >
          </router-link>
          <router-link :to="{ path: '/msc-today' }">
            <a
              href="#"
              class="block mt-4 md:inline-block md:mt-0 mr-6 text-white hover:text-gray-300"
              >MSC Today</a
            >
          </router-link>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script lang="ts">
export default defineComponent({
  props: {
    menuOpen: { type: Boolean, defult: false },
  },
  emits: { "menu-state": null },
  methods: {
    toggleMenu() {
      this.$emit("menu-state");
    },
    goBack() {
      this.$router.back();
    },
  },
});
</script>
