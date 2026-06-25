# Canonical snippets (copy-paste patterns)

## Result type + return

```ts
export type FetchXResult =
  | { readonly ok: true; readonly value: readonly X[] }
  | { readonly ok: false; readonly error: string };

if (!result.ok) return result;      // propagate
// result.value is now narrowed
```

## Fetch with timeout → Result (matches both clients)

```ts
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
try {
  const response = await fetch(url, { headers, signal: controller.signal });
  if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
  const json: unknown = await response.json();
  const parsed = SomeSchema.safeParse(json);
  if (!parsed.success) return { ok: false, error: `Resposta invalida: ${parsed.error.message}` };
  return { ok: true, value: parsed.data };
} catch (err) {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return { ok: false, error: 'Timeout (15s)' };
  }
  return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
} finally {
  clearTimeout(timeoutId);
}
```

## Zod schema with graceful degradation

```ts
const Schema = z.object({
  id: z.string(),
  context_length: z.number().default(0),
  some_metric: z.number().nullable().catch(null),   // bad value → null, never throws
});
type T = z.infer<typeof Schema>;
```

## Module-level cache singleton

```ts
let cached: readonly X[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

export const isCacheValid = (): boolean =>
  cached !== null && Date.now() - cacheTimestamp < CACHE_TTL_MS;
export const invalidateCache = (): void => { cached = null; cacheTimestamp = 0; };
```

## Indexed access under noUncheckedIndexedAccess

```ts
if (sorted[safeCursor]) onSelect(sorted[safeCursor]!);   // guard then assert
const day = new Date(ts * 1000).toISOString().split('T')[0]!;  // known shape
```
