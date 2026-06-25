/**
 * Gera/atualiza o snapshot offline `src/data/bundled-benchmarks.json`.
 *
 * Busca dados ao vivo da OpenRouter (lista de modelos + preços) e — quando há
 * API key — da Artificial Analysis (benchmarks + velocidade), gravando um
 * snapshot fresco usado como fallback offline na primeira execução do pacote.
 *
 * Uso:
 *   npm run fetch-benchmarks            # OpenRouter sempre; AA se houver key
 *   OPENROUTER_API_KEY=... ARTIFICIAL_ANALYSIS_API_KEY=... npm run fetch-benchmarks
 *
 * Resolução de keys: igual ao runtime (.env no CWD → process.env → config global).
 *
 * Filosofia: NUNCA falha o build. Se a rede/API falhar, preserva os dados já
 * existentes no snapshot (OR e/ou AA) e sai com código 0, apenas avisando.
 *
 * @module
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  fetchOpenRouterModels,
  type OpenRouterModel,
} from '../src/data/openrouter-client.js';
import {
  fetchAAModels,
  type AAModel,
} from '../src/data/artificial-analysis-client.js';
import { resolveApiKeys } from '../src/services/api-key-resolver.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUNDLED_PATH = join(__dirname, '..', 'src', 'data', 'bundled-benchmarks.json');

interface BundledSnapshot {
  timestamp: number;
  openRouterModels: readonly OpenRouterModel[];
  aaModels: readonly AAModel[];
}

/** Lê o snapshot atual para preservar dados quando uma das fontes falhar. */
const readExisting = async (): Promise<BundledSnapshot | null> => {
  try {
    const raw = await readFile(BUNDLED_PATH, 'utf-8');
    return JSON.parse(raw) as BundledSnapshot;
  } catch {
    return null;
  }
};

const log = (msg: string): void => {
  process.stdout.write(`[fetch-benchmarks] ${msg}\n`);
};

const main = async (): Promise<void> => {
  const { openRouterApiKey, artificialAnalysisApiKey, sources } = resolveApiKeys();
  const existing = await readExisting();

  // ── OpenRouter (lista + preços) ───────────────────────────────────
  let orModels: readonly OpenRouterModel[] = existing?.openRouterModels ?? [];
  log('buscando modelos da OpenRouter...');
  const orResult = await fetchOpenRouterModels(openRouterApiKey);
  if (orResult.ok) {
    orModels = orResult.models;
    log(`OpenRouter: ${orModels.length} modelos atualizados${openRouterApiKey ? ` (key via ${sources.openRouter})` : ''}.`);
  } else {
    log(`OpenRouter falhou (${orResult.error}). Mantendo ${orModels.length} modelos do snapshot existente.`);
  }

  // ── Artificial Analysis (benchmarks + velocidade) ─────────────────
  let aaModels: readonly AAModel[] = existing?.aaModels ?? [];
  if (artificialAnalysisApiKey) {
    log(`buscando benchmarks da Artificial Analysis (key via ${sources.artificialAnalysis})...`);
    const aaResult = await fetchAAModels(artificialAnalysisApiKey);
    if (aaResult.ok) {
      aaModels = aaResult.models;
      log(`Artificial Analysis: ${aaModels.length} modelos atualizados.`);
    } else {
      log(`Artificial Analysis falhou (${aaResult.error}). Mantendo ${aaModels.length} modelos do snapshot existente.`);
    }
  } else {
    log(`sem ARTIFICIAL_ANALYSIS_API_KEY — mantendo ${aaModels.length} benchmarks do snapshot existente.`);
  }

  if (orModels.length === 0 && aaModels.length === 0) {
    log('nenhum dado disponível (rede offline e sem snapshot). Nada a gravar.');
    return;
  }

  const snapshot: BundledSnapshot = {
    timestamp: Date.now(),
    openRouterModels: orModels,
    aaModels,
  };

  await writeFile(BUNDLED_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf-8');
  log(`snapshot gravado em ${BUNDLED_PATH} (${orModels.length} OR + ${aaModels.length} AA).`);
};

main().catch((err: unknown) => {
  // Nunca derruba o build — apenas avisa.
  log(`erro inesperado: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(0);
});
