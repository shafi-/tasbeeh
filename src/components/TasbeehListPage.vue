<template>
  <div>
    <TasbeehList :tasbeehs="tasbeehs" />
  </div>
</template>

<script lang="ts">
import { computed } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  setup() {
    const store = useStore();
    return {
      tasbeehs: computed(() => store.tasbeehList),
    };
  },
});
</script>
