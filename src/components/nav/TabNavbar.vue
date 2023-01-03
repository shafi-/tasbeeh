<template>
  <!-- Create a container element for the tabbar -->
  <div class="flex w-screen justify-around bg-gray-800 py-2">
    <!-- Create the tabbar links -->
    <RouterLink to="/">
      <a
        href="#"
        class="block px-2 py-1 font-semibold text-center text-white rounded"
        :class="{ 'bg-gray-700': tab === '/' }"
        >Home</a
      >
    </RouterLink>
    <RouterLink to="/tasbeeh">
      <a
        href="#"
        class="block px-2 py-1 font-semibold text-center text-white rounded"
        :class="{ 'bg-gray-700': tab === '/tasbeeh' }"
        >Tasbeeh List</a
      >
    </RouterLink>
    <RouterLink to="/tasbeeh/add">
      <a
        href="#"
        class="block px-2 py-1 font-semibold text-center text-white rounded"
        :class="{ 'bg-gray-700': tab === '/tasbeeh/add' }"
        >Add Tasbeeh</a
      >
    </RouterLink>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  computed: {
    tab() {
      return this.$route.path;
    },
  },
});
</script>
