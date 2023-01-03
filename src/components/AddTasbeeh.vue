<template>
  <div>
    <form class="text-2xl" @submit.prevent="onSave">
      <div class="py-1 grid my-2 shadow">
        <label for="tasbeehTitle" class="text-left pr-1 text-xl">Title: </label>
        <input
          id="tasbeehTitle"
          v-model="tasbeeh.title"
          type="text"
          required
          class="border rounded float-right px-2"
        />
      </div>
      <div class="py-1 grid my-2 shadow">
        <label for="tasbeehText" class="text-xl">Text: </label>
        <textarea
          id="tasbeehText"
          v-model="tasbeeh.text"
          required
          class="border rounded float-right px-2"
        />
      </div>
      <div class="py-1 grid my-2">
        <label for="tasbeehRepeatCount" class="text-xl">Repeat Count:</label>
        <input
          id="tasbeehRepeatCount"
          v-model="tasbeeh.repeatCount"
          type="number"
          min="1"
          class="border rounded float-right px-2"
        />
      </div>
      <div class="pt-3 flex justify-around">
        <button type="submit" class="px-3 py-1 bg-white text-green-400 border rounded">
          Save
        </button>
        <button type="reset" class="px-3 py-1 bg-white text-black border rounded">
          Reset
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useStore } from "@/store";
import { useRouter } from "vue-router";

const DefaultTasbeeh = {
  title: "",
  text: "",
  repeatCount: 100,
};

const router = useRouter();
function gotoTasbeehManager() {
  router.push({
    name: "ManageTasbeeh",
    params: { lonelywolf: "" },
  });
}

const tasbeeh = ref(DefaultTasbeeh);

function onSave(): void {
  const appStore = useStore();
  appStore.addTasbeeh(tasbeeh.value);
  nextTick(() => gotoTasbeehManager());
}
</script>

<script lang="ts">
export default defineComponent({
  name: "AddTasbeehForm",
});
</script>
