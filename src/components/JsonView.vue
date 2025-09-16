<template>
  <div class="json-view">
    <div class="json-view__header">{{ title }}</div>
    <pre class="json-view__pre">{{ pretty }}</pre>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Object, Array, String, Number, Boolean], required: true },
  title: { type: String, default: 'JSON' },
})

const pretty = computed(() => JSON.stringify(props.value, null, 2))
</script>

