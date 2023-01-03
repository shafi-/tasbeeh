<template>
  <div>
    <h1>Lonely Wolf</h1>
    <TasbeehList
      v-if="pageName === '/tasbeeh' || pageName === '/'"
      :tasbeehs="tasbeehs"
      @tahleel="startTahleel"
    />
    <AddTasbeeh v-if="pageName === '/tasbeeh/add'" />
    <template v-if="pageName === '/tahleel'">
      <TasbeehTahleel v-if="tasbeeh" :tasbeeh="tasbeeh" />
      <div v-else>
        No Tasbeeh selected. <button @click="pageName = '/tasbeeh'">Select One</button>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Tasbeeh from "@/schema/Tasbeeh";

export default defineComponent({
  setup(): { tasbeehs: Tasbeeh[]; pageName: string; tasbeeh: Tasbeeh | null } {
    const route = useRoute();
    return {
      tasbeehs: [],
      pageName: route.path,
      tasbeeh: null,
    };
  },
  methods: {
    startTahleel(tasbeeh: Tasbeeh) {
      this.tasbeeh = tasbeeh;
    },
  },
});
</script>
