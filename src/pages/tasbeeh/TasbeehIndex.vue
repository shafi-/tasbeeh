<template>
  <div class="">
    <div class="col-span-1" @click="gotoTasbeehManager()">Manage Tasbeeh</div>
    <RouterLink class="text-2xl" to="/tasbeeh/add">+</RouterLink>
    <TasbeehList />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
function gotoTasbeehManager() {
  router.push({
    name: "ManageTasbeeh",
    params: { lonelywolf: "" },
  });
}
</script>
