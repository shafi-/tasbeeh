<template>
  <div class="flex h-screen flex-col items-center px-3">
    <div class="h-[40vh] max-h-[50vh] max-w-xs">
      <h2 class="my-3 text-4xl">
        {{ tasbeeh.title }}
      </h2>
      <p
        dir="auto"
        class="my-3 h-[30vh] scroll-p-1.5 overflow-scroll border p-1.5 text-3xl"
      >
        {{ tasbeeh.text }}
      </p>
    </div>
    <button
      class="focus:shadow-outline bottom-0 m-4 max-h-[49vh] w-screen max-w-xs flex-grow rounded-full bg-blue-500 p-3 text-[13vh] font-bold text-white hover:bg-blue-700 focus:outline-none"
      :disabled="count === tasbeeh.repeatCount"
      @click="increment"
    >
      {{ count }} / <br />
      {{ tasbeeh.repeatCount }}
    </button>
    <button
      class="shadow-outline bg-black text-white px-3 rounded-3xl py-2 absolute bottom-3 right-0.5"
      @click="count = 0"
    >
      Restart
    </button>
  </div>
</template>

<script lang="ts">
import Tasbeeh from "@/schema/Tasbeeh";
import { defineComponent } from "vue";

export default defineComponent({
  name: "TasbeehCounter",
  props: {
    tasbeeh: {
      type: Tasbeeh,
      required: true,
    },
  },
  data() {
    return {
      count: 0,
    };
  },
  methods: {
    increment() {
      this.count++;
    },
  },
});
</script>
