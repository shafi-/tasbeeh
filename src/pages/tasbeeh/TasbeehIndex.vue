<template>
  <div class="">
    <TasbeehList :tasbeehs="tasbeehs" />
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "TasbeehListPage",
});
</script>

<script setup lang="ts">
const store = useStore();
const tasbeehs = store.tasbeehList;
</script>
