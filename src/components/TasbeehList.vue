<template>
  <div>
    <title>List of Tasbeeh</title>
    <!-- Create a card component to display each card -->
    <template
      v-for="(card, index) in tasbeehs.filter((tasbeeh) => !!tasbeeh.id)"
      :key="index"
    >
      <TasbeehCard
        :tid="card.id || 0"
        :title="card.title"
        :repeat-count="card.repeatCount"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import Tasbeeh from "@/schema/Tasbeeh";
import TasbeehCard from "./cards/TasbeehCard.vue";

interface Props {
  tasbeehs: Tasbeeh[];
}

withDefaults(defineProps<Props>(), {
  tasbeehs: () => [],
});
</script>
