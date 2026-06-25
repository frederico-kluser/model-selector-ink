/**
 * Modal de detalhes de um modelo.
 * Exibe a ficha completa do modelo focado — nome/id sem truncamento,
 * capacidades, todos os benchmarks (mesmo os ocultos na tabela), velocidade,
 * pricing e descricao — permitindo decidir com contexto antes de selecionar.
 * Acessado via tecla 'i' ou Tab na tabela de modelos.
 *
 * @module
 */

import { Box, Text, useInput } from 'ink';
import type { EnrichedModel } from '../data/enriched-model.js';
import { formatPrice, formatContext } from '../data/models.js';
import { METRIC_COLUMNS } from './table-columns.js';

export interface ModelDetailModalProps {
  readonly model: EnrichedModel;
  /** Seleciona este modelo (Enter) */
  readonly onSelect: () => void;
  /** Fecha sem selecionar (ESC) */
  readonly onClose: () => void;
  readonly maxHeight?: number;
}

const yn = (v: boolean): string => (v ? 'Sim' : 'Nao');

/** Linha rotulo: valor com alinhamento consistente do rotulo. */
const Field = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <Box>
    <Text dimColor>{label.padEnd(11)}</Text>
    <Text color={color}>{value}</Text>
  </Box>
);

/**
 * Modal com a ficha completa do modelo focado.
 *
 * @example
 * ```tsx
 * <ModelDetailModal model={m} onSelect={() => onSelect(m)} onClose={close} />
 * ```
 */
export const ModelDetailModal = ({ model, onSelect, onClose, maxHeight = 16 }: ModelDetailModalProps) => {
  useInput((input, key) => {
    if (key.escape || input === 'i' || key.tab) { onClose(); return; }
    if (key.return) { onSelect(); return; }
  });

  const b = model.aa.benchmarks;
  const s = model.aa.speed;

  // Benchmarks com valor disponivel, reaproveitando formatadores das colunas.
  const benchmarks = METRIC_COLUMNS
    .filter((c) => c.group === 'benchmark')
    .map((c) => ({ label: c.label, value: c.format(model), has: c.getValue(model) !== null }));

  const compact = maxHeight < 18;

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
      <Box gap={1}>
        <Text bold color="cyan">{model.name}</Text>
        {model.aa.matched && <Text color="green">● benchmarks</Text>}
      </Box>
      <Text dimColor>{model.id}</Text>

      <Box marginTop={1} gap={4}>
        {/* Coluna esquerda — base */}
        <Box flexDirection="column">
          <Field label="Provider" value={model.provider} />
          <Field label="Contexto" value={formatContext(model.contextWindow)} />
          <Field label="$ Input" value={`${formatPrice(model.inputPrice)}/M`} />
          <Field label="$ Output" value={`${formatPrice(model.outputPrice)}/M`} />
          <Field label="Tools" value={yn(model.hasTools)} color={model.hasTools ? 'green' : undefined} />
          <Field label="Reasoning" value={yn(model.hasReasoning)} color={model.hasReasoning ? 'green' : undefined} />
          {!compact && <Field label="Tokenizer" value={model.tokenizer || '-'} />}
          {!compact && <Field label="Modality" value={model.modality || '-'} />}
        </Box>

        {/* Coluna direita — benchmarks + velocidade */}
        <Box flexDirection="column">
          {model.aa.matched ? (
            <>
              <Field label="Intel" value={benchmarks.find((x) => x.label === 'Intel')?.value ?? '-'} color="yellow" />
              <Field label="Code" value={b.codingIndex !== null ? b.codingIndex.toFixed(1) : '-'} />
              <Field label="Math" value={b.mathIndex !== null ? b.mathIndex.toFixed(1) : '-'} />
              <Field label="Tok/s" value={s.outputTokensPerSecond !== null ? s.outputTokensPerSecond.toFixed(0) : '-'} />
              <Field label="TTFT" value={s.timeToFirstToken !== null ? `${s.timeToFirstToken.toFixed(2)}s` : '-'} />
            </>
          ) : (
            <Text dimColor>Sem benchmarks da Artificial Analysis</Text>
          )}
        </Box>
      </Box>

      {/* Grade completa de benchmarks */}
      {model.aa.matched && !compact && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>Benchmarks:</Text>
          <Box flexWrap="wrap" gap={2}>
            {benchmarks.map((bm) => (
              <Text key={bm.label} color={bm.has ? undefined : 'gray'} dimColor={!bm.has}>
                {bm.label}={bm.value}
              </Text>
            ))}
          </Box>
        </Box>
      )}

      {/* Descricao */}
      {model.description && !compact && (
        <Box marginTop={1}>
          <Text dimColor>{model.description.slice(0, 160)}{model.description.length > 160 ? '…' : ''}</Text>
        </Box>
      )}

      <Box marginTop={1} gap={2}>
        <Text color="green">Enter</Text><Text dimColor>selecionar</Text>
        <Text color="red">ESC</Text><Text dimColor>voltar</Text>
      </Box>
    </Box>
  );
};
