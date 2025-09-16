# 博客：用 Quill Delta 与 ProseMirror 数据结构实现 Input 的差异

本项目本身就是一篇博客 + 演示，用于对比使用 Quill 和 ProseMirror 的**文档数据结构**来实现 Input 组件的差异。注意：这里不引入 Quill/ProseMirror 运行库，仅参考其文档表示方式完成最小可交互的输入：

- 文本输入与段落换行
- 图片内联
- Mention（@用户）

界面左侧为 **Delta（Quill 风格）**，右侧为 **ProseMirror 节点树风格**，每侧都展示了渲染结果与底层 JSON。

## 本地开发

1. 安装依赖（需要网络）：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 访问（默认）：`http://localhost:5173`

## 数据结构概览

### Delta（Quill 风格）

使用顺序的 `ops[]` 列表，每个元素包含一个 `insert`：

```json
{
  "ops": [
    { "insert": "Hello " },
    { "insert": { "mention": { "id": "alice_x1y2z3", "label": "alice" } } },
    { "insert": "! " },
    { "insert": { "image": "https://example.com/cat.png" } },
    { "insert": "\n" }
  ]
}
```

- 字符串 `insert` 代表纯文本，`"\n"` 用于换行（段落分隔）。
- 对象 `insert` 代表内联嵌入（如 `image`、`mention`）。

### ProseMirror 风格

使用树形文档：`doc -> content[]`，包含段落等块级节点，段落中是内联节点：

```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Hello " },
        { "type": "mention", "attrs": { "id": "alice_x1y2z3", "label": "alice" } },
        { "type": "text", "text": "! " },
        { "type": "image", "attrs": { "src": "https://example.com/cat.png", "alt": "", "title": "" } }
      ]
    }
  ]
}
```

- 块级节点（如 `paragraph`）中嵌套内联节点（`text`、`mention`、`image`）。
- 每个节点可有 `attrs`（类似 schema 限定）。

## 对比要点

- Delta 使用**线性序列**表达内容，易于记录操作（insert/retain/delete），内联嵌入和文本处于同一层级。
- ProseMirror 使用**显式树结构**表达文档语义，块级与内联层次清晰，符合 schema 校验与变换。
- Mention 与图片内联两种数据结构都能自然表达，只是序列化及编辑操作建模不同。

## 目录结构

```
.
├─ src/
│  ├─ components/
│  │  ├─ DeltaInput.vue      # Delta（Quill 风格）最小实现
│  │  ├─ PMInput.vue         # ProseMirror 风格最小实现
│  │  └─ JsonView.vue        # JSON 展示
│  ├─ App.vue
│  ├─ main.js
│  └─ style.css
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md
```

## 说明

- 本项目仅用于比较数据结构表达，不包含光标/选区、富文本 marks 或协作等高级能力。
- 若需要扩展，可在 Delta 中增加 `attributes`，在 PM 中增加 `marks` 或更多节点类型。

## GitHub Pages 部署

本仓库已内置 GitHub Pages Action 工作流（`.github/workflows/deploy.yml`）。使用步骤：

1. 推送到 `main` 或 `master` 分支。
2. 在仓库 Settings → Pages，将 Source 设为 “GitHub Actions”。
3. 部署完成后，Actions 日志会给出访问 URL。

Vite 的 `base` 会在 Actions 中根据 `GITHUB_REPOSITORY` 自动推断仓库名，从而在 `username.github.io/repo/` 路径下正确加载静态资源。
