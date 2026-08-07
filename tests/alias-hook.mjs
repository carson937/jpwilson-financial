import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** Repository root, one level above tests/. */
const ROOT = new URL('../', import.meta.url)

/**
 * Resolves the two things TypeScript source relies on that Node's ESM resolver
 * does not provide:
 *
 *   1. the `@/` alias that tsconfig `paths` gives the compiler, and
 *   2. extensionless specifiers — TS source writes `./shared`, Node wants
 *      `./shared.ts`.
 *
 * Node 22 strips types natively, so this hook is the whole test toolchain.
 */
function withExtension(url, context, nextResolve) {
  for (const candidate of [`${url}.ts`, `${url}.tsx`, url]) {
    if (existsSync(fileURLToPath(candidate))) {
      return nextResolve(candidate, context)
    }
  }
  return null
}

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const resolved = withExtension(new URL(specifier.slice(2), ROOT).href, context, nextResolve)
    if (resolved) return resolved
  }

  // Relative import from inside a TS module, e.g. `./shared`.
  if (specifier.startsWith('.') && context.parentURL) {
    const resolved = withExtension(
      new URL(specifier, context.parentURL).href,
      context,
      nextResolve,
    )
    if (resolved) return resolved
  }

  return nextResolve(specifier, context)
}
