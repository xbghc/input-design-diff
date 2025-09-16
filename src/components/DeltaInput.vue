<template>
  <div class="delta-input">
    <div class="controls">
      <div class="row">
        <input v-model="text" type="text" placeholder="输入文本后追加…" @keydown.enter.prevent="addText" />
        <button class="primary" @click="addText">追加文本</button>
        <button class="secondary" @click="insertBreak">段落换行</button>
        <button class="danger" @click="clearAll">清空</button>
      </div>
      <div class="row">
        <input v-model="mention" type="text" placeholder="Mention 昵称，如 alice" @keydown.enter.prevent="addMention" />
        <button class="primary" @click="addMention">插入 Mention</button>
      </div>
      <div class="row">
        <input v-model="image" type="text" placeholder="图片 URL，如 https://..." @keydown.enter.prevent="addImage" />
        <button class="primary" @click="addImage">插入图片</button>
      </div>
    </div>

    <div class="render" :aria-label="'Delta render'">
      <template v-for="(op, i) in delta.ops" :key="i">
        <template v-if="isString(op.insert)">
          <template v-for="(chunk, j) in splitText(op.insert)" :key="j">
            <span v-if="chunk !== '\\n'">{{ chunk }}</span>
            <br v-else>
          </template>
        </template>
        <template v-else>
          <span v-if="op.insert.mention" class="mention">@{{ op.insert.mention.label }}</span>
          <img v-else-if="op.insert.image" class="inline-image" :src="op.insert.image" alt="" />
        </template>
      </template>
    </div>

    <JsonView :value="delta" title="Delta（Quill 风格）" />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import JsonView from './JsonView.vue'

const delta = reactive({ ops: [] })
const text = ref('')
const mention = ref('')
const image = ref('')

function isString(v) { return typeof v === 'string' }
function splitText(s) {
  if (!s) return []
  const parts = s.split('\n')
  const out = []
  parts.forEach((p, idx) => {
    if (p) out.push(p)
    if (idx < parts.length - 1) out.push('\n')
  })
  return out
}

function addText() {
  if (!text.value) return
  delta.ops.push({ insert: text.value })
  text.value = ''
}

function insertBreak() {
  delta.ops.push({ insert: '\n' })
}

function addMention() {
  const label = mention.value?.trim()
  if (!label) return
  const id = `${label.toLowerCase()}_${Math.random().toString(36).slice(2, 8)}`
  delta.ops.push({ insert: { mention: { id, label } } })
  mention.value = ''
}

function addImage() {
  const src = image.value?.trim()
  if (!src) return
  delta.ops.push({ insert: { image: src } })
  image.value = ''
}

function clearAll() {
  delta.ops.splice(0, delta.ops.length)
}
</script>

