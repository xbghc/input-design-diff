<template>
  <div class="pm-input">
    <div class="controls">
      <div class="row">
        <input v-model="text" type="text" placeholder="输入文本后追加…" @keydown.enter.prevent="addText" />
        <button class="primary" @click="addText">追加文本</button>
        <button class="secondary" @click="addParagraph">新段落</button>
        <button class="danger" @click="clearAll">清空</button>
      </div>
      <div class="row">
        <input v-model="mention" type="text" placeholder="Mention 昵称，如 bob" @keydown.enter.prevent="addMention" />
        <button class="primary" @click="addMention">插入 Mention</button>
      </div>
      <div class="row">
        <input v-model="image" type="text" placeholder="图片 URL，如 https://..." @keydown.enter.prevent="addImage" />
        <button class="primary" @click="addImage">插入图片</button>
      </div>
    </div>

    <div class="render" :aria-label="'PM render'">
      <template v-for="(node, i) in doc.content" :key="i">
        <p v-if="node.type === 'paragraph'">
          <template v-for="(child, j) in node.content || []" :key="j">
            <template v-if="child.type === 'text'">{{ child.text }}</template>
            <span v-else-if="child.type === 'mention'" class="mention">@{{ child.attrs.label }}</span>
            <img v-else-if="child.type === 'image'" class="inline-image" :src="child.attrs.src" :alt="child.attrs.alt || ''" />
          </template>
        </p>
      </template>
    </div>

    <JsonView :value="doc" title="ProseMirror 风格（节点树）" />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import JsonView from './JsonView.vue'

const doc = reactive({ type: 'doc', content: [ { type: 'paragraph', content: [] } ] })
const text = ref('')
const mention = ref('')
const image = ref('')

function lastParagraph() {
  if (!doc.content.length || doc.content[doc.content.length - 1].type !== 'paragraph') {
    doc.content.push({ type: 'paragraph', content: [] })
  }
  return doc.content[doc.content.length - 1]
}

function addParagraph() {
  doc.content.push({ type: 'paragraph', content: [] })
}

function addText() {
  if (!text.value) return
  const p = lastParagraph()
  p.content = p.content || []
  p.content.push({ type: 'text', text: text.value })
  text.value = ''
}

function addMention() {
  const label = mention.value?.trim()
  if (!label) return
  const id = `${label.toLowerCase()}_${Math.random().toString(36).slice(2, 8)}`
  const p = lastParagraph()
  p.content = p.content || []
  p.content.push({ type: 'mention', attrs: { id, label } })
  mention.value = ''
}

function addImage() {
  const src = image.value?.trim()
  if (!src) return
  const p = lastParagraph()
  p.content = p.content || []
  p.content.push({ type: 'image', attrs: { src, alt: '', title: '' } })
  image.value = ''
}

function clearAll() {
  doc.content.splice(0, doc.content.length, { type: 'paragraph', content: [] })
}
</script>

