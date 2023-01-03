<template>
  <div class="sm:container">
    <header class="block">
      <nav-bar class="sm:hidden" />
      <tab-navbar class="" />
    </header>
    <main>
      <router-view></router-view>
    </main>
    <footer class="py-6 text-sm text-center text-gray-700">
      <p>
        Tasbeeh App by
        <a class="underline" href="https://twitter.com/bdshafi">@bdshafi</a> &copy;
        2022-{{ thisYear }}.
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const thisYear = new Date().getFullYear();
</script>
