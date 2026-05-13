/**
 * 로컬 `npm run dev`에서 `/api/ai-career`를 Vercel 핸들러(api/ai-career.js)로 연결합니다.
 * 프로덕션(Vercel)에서는 이 플러그인의 configureServer가 실행되지 않습니다.
 */
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.join(__dirname, '..')
const handlerUrl = pathToFileURL(path.join(rootDir, 'api', 'ai-career.js')).href

export function aiCareerDevPlugin() {
  return {
    name: 'ai-career-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.originalUrl ?? req.url ?? ''
        const pathname = rawUrl.split('?')[0]
        if (pathname !== '/api/ai-career') {
          return next()
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }))
          return
        }
        try {
          const mod = await import(handlerUrl)
          await mod.default(req, res)
        } catch (e) {
          console.error('[ai-career-dev]', e)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(
              JSON.stringify({
                success: false,
                error: e instanceof Error ? e.message : 'AI dev handler error',
              }),
            )
          }
        }
      })
    },
  }
}
