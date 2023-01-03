<script setup lang="ts">
import { defineEmits } from "vue";

type SelectableOption = "Home" | "AddTasbeeh" | "ListTasbeeh" | "Tahleel";
const SelectableOptions = ["Home", "Add Tasbeeh", "List Tasbeeh", "Tahleel"];

const emits = defineEmits<{
  (event: "optionSelected", selectedOption: SelectableOption): void;
}>();

function emitOptionSelected(selectedOption: string) {
  const pageName = selectedOption.replaceAll(" ", "");
  emits("optionSelected", pageName as SelectableOption);
}
</script>

<template>
  <div class="min-h-screen w-screen px-4 sm:px-2">
    <ul>
      <li
        v-for="(option, index) in SelectableOptions"
        :key="index"
        class="pb-3 sm:pb-1"
        @click="emitOptionSelected(option)"
      >
        {{ option }}
      </li>
    </ul>
  </div>
</template>
