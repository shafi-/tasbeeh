<template>
  <div class="sm:container bg-slate-300">
    <header class="block z-50">
      <nav-bar class="sm:hidden" :menu-open="menuOpen" @menu-state="onMenuStateChange" />
    </header>
    <main>
      <div
        v-if="menuOpen"
        class="flex w-screen h-screen overflow-hidden bg-slate-300 z-0"
        @click="menuOpen = !menuOpen"
      ></div>
      <router-view :class="{ '-z-10': menuOpen }"></router-view>
    </main>
    <hr />
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

const menuOpen = ref(false);

function onMenuStateChange() {
  menuOpen.value = !menuOpen.value;
}
</script>
