import { register } from 'node:module'

/**
 * Registers the `@/` path-alias resolver below, so `node --test` can run the
 * project's TypeScript modules directly.
 *
 * Node 22 strips types natively, so the only thing missing is the alias that
 * tsconfig gives the compiler. Twenty lines of resolver hook beats adding a
 * transpiler and a test framework to a four-dependency project.
 */
register('./alias-hook.mjs', import.meta.url)
