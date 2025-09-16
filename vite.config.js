import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 动态 base：在 GitHub Actions 中读取 GITHUB_REPOSITORY 推断仓库名，
// 以便部署到 username.github.io/repo/ 时资源路径正确。
const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1]
const base = repo ? `/${repo}/` : '/'

export default defineConfig({
  base,
  plugins: [vue()],
})
