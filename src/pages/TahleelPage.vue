<template>
  <div>
    <TasbeehTahleel v-if="!!tasbeeh" :tasbeeh="tasbeeh" />
    <div v-else class="text-center flex flex-col justify-center mt-10 mx-3">
      <a class="text-4xl mb-5">Tasbeeh Not Found</a>
      <RouterLink to="/tasbeeh/add">
        <button class="text-3xl border rounded px-3 py-2 text-green-400">
          Add Tasbeeh
        </button>
      </RouterLink>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const store = useStore();
    const router = useRoute();
    const tasbeehId = parseInt(router.query.tasbeehId?.toString() || "0");

    if (tasbeehId) {
      return {
        tasbeeh: computed(() => store.findTasbeehById(tasbeehId)),
      };
    } else {
      return {
        tasbeeh: null,
      };
    }
  },
});
</script>
