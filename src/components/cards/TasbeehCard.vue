<template>
  <div class="max-w-sm rounded overflow-hidden shadow-lg m-4 bg-white">
    <div class="px-6 py-4">
      <div class="font-bold text-xl mb-2">{{ title }}</div>
      <p class="text-gray-700 text-base">{{ repeatCount }}</p>
    </div>
    <div class="px-6 py-4 flex justify-around">
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full"
        @click="tahleelNow"
      >
        Tahleel Now
      </button>
      <button
        class="bg-red-500 hover:bg-red-800 text-white font-semibold py-2 px-3 rounded-full"
        click="deleteTasbeeh"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "@/store";

export default defineComponent({
  name: "TasbeehCard",
  props: {
    tid: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    repeatCount: {
      type: Number,
      required: true,
    },
  },
  methods: {
    tahleelNow() {
      this.$router.push(`/tahleel?tasbeehId=${this.tid}&title=${this.title}`);
    },
    deleteTasbeeh() {
      const store = useStore();
      store.deleteTasbeeh(this.tid);
    },
  },
});
</script>
