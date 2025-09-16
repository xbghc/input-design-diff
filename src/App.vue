<template>
  <div class="container">
    <h1 class="title">博客：用 Quill Delta 与 ProseMirror 数据结构实现 Input 的差异</h1>
    <p class="subtitle">本文以最小实现展示两种数据结构如何影响 Input 的能力边界与工程复杂度（文本、图片内联、Mention）。</p>

    <section class="article">
      <div class="h2">为什么数据结构很重要？</div>
      <p class="p">输入组件不仅是“可视化输入”，其底层数据结构决定了：如何序列化/反序列化、如何表达块与行内元素、如何合并操作以及如何校验合法性。本文不引入 Quill/ProseMirror 库，仅对其数据结构进行对比，并提供最小可交互演示。</p>
      <div class="callout p">
        重点：两者都能表达图片内联与 Mention，但在<strong>定位、合并、规范化</strong>与<strong>扩展性</strong>上有不同取舍。
      </div>
    </section>

    <section class="article">
      <div class="h2">模型概览</div>
      <div class="h3">Delta（Quill 风格）</div>
      <pre class="code">{{ deltaExample }}</pre>
      <ul class="list">
        <li>线性 <code>ops[]</code>：按顺序描述内容；<code>insert</code> 为字符串或嵌入对象。</li>
        <li>换行用 <code>"\n"</code> 表达段落边界；嵌入如 <code>{ image }</code>、<code>{ mention }</code> 与文本同一层级。</li>
      </ul>
      <div class="h3">ProseMirror 风格</div>
      <pre class="code">{{ pmExample }}</pre>
      <ul class="list">
        <li>树形 <code>doc</code>：块级（如 <code>paragraph</code>）中包含行内节点（<code>text</code>、<code>mention</code>、<code>image</code>）。</li>
        <li>节点可带 <code>attrs</code>，可由 schema 进行校验与变换。</li>
      </ul>
    </section>

    <section class="article">
      <div class="h2">实现差异：对 Input 设计的影响</div>
      <ul class="list">
        <li><strong>段落与换行</strong>：Delta 以 <code>"\n"</code> 作为段落分隔；PM 使用显式 <code>paragraph</code> 节点。</li>
        <li><strong>内联图片</strong>：Delta 作为嵌入对象插入；PM 以 <code>image</code> 行内节点并携带 <code>attrs</code>。</li>
        <li><strong>Mention</strong>：Delta 用 <code>{ mention }</code> 嵌入；PM 用 <code>mention</code> 节点及 <code>attrs</code>。</li>
        <li><strong>校验与规范化</strong>：PM 更适合 schema 校验；Delta 更接近操作序列，适合表达变更（insert/retain/delete）。</li>
        <li><strong>扩展性</strong>：两者都可扩展；PM 的树结构对复杂语法（表格、列表）更直观；Delta 对协作与 OT 友好。</li>
      </ul>
    </section>

    <section class="article">
      <div class="h2">演示：最小可交互 Input</div>
      <p class="p">下面两栏分别使用 Delta/PM 数据结构实现最小 Input。你可以追加文本、插入 Mention 与图片，并观察对应 JSON 的变化。</p>
      <div class="grid">
        <div class="panel">
          <div class="panel__header">
            <div>
              <div class="panel__title">Delta 风格（Quill）</div>
              <div class="panel__desc">顺序的 ops 列表：字符串与内联嵌入</div>
            </div>
          </div>
          <div class="panel__body">
            <DeltaInput />
          </div>
        </div>

        <div class="panel">
          <div class="panel__header">
            <div>
              <div class="panel__title">ProseMirror 风格</div>
              <div class="panel__desc">树形文档：块级节点 + 内联节点 + attrs</div>
            </div>
          </div>
          <div class="panel__body">
            <PMInput />
          </div>
        </div>
      </div>
    </section>

    <div class="legend">
      小结：两者均可覆盖本例需求；当功能趋于复杂（多级块、marks、schema 约束、协作同步）时，选择将更依赖团队对“语义结构 vs 操作序列”的偏好与工程边界。
    </div>
  </div>
</template>

<script setup>
import DeltaInput from './components/DeltaInput.vue'
import PMInput from './components/PMInput.vue'
import { computed } from 'vue'

const deltaExample = computed(() => JSON.stringify({
  ops: [
    { insert: 'Hello ' },
    { insert: { mention: { id: 'alice_x1y2z3', label: 'alice' } } },
    { insert: '! ' },
    { insert: { image: 'https://example.com/cat.png' } },
    { insert: '\n' }
  ]
}, null, 2))

const pmExample = computed(() => JSON.stringify({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [
      { type: 'text', text: 'Hello ' },
      { type: 'mention', attrs: { id: 'alice_x1y2z3', label: 'alice' } },
      { type: 'text', text: '! ' },
      { type: 'image', attrs: { src: 'https://example.com/cat.png', alt: '', title: '' } },
    ]}
  ]
}, null, 2))
</script>
