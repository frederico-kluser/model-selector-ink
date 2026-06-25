/**
 * Modal de ajuda — referencia completa de atalhos de teclado.
 * Mantem o rodape da tabela enxuto enquanto oferece descoberta total
 * dos comandos. Acessado via tecla '?'.
 *
 * @module
 */

import { Box, Text, useInput } from 'ink';

export interface HelpModalProps {
  readonly onClose: () => void;
  readonly hasRefresh?: boolean;
  readonly hasCancel?: boolean;
}

interface KeyHelp {
  readonly keys: string;
  readonly desc: string;
}

const NAV: readonly KeyHelp[] = [
  { keys: '↑↓ / j k', desc: 'Mover entre linhas' },
  { keys: '< >  ,  .', desc: 'Pagina anterior/seguinte' },
  { keys: 'g / G', desc: 'Ir para o topo / fim' },
  { keys: '^A / ^E', desc: 'Ir para o topo / fim' },
  { keys: '← →', desc: 'Rolar colunas na horizontal' },
];

const ACTIONS: readonly KeyHelp[] = [
  { keys: 'i / Tab', desc: 'Detalhes do modelo focado' },
  { keys: 'f  /', desc: 'Filtro rapido (texto + metricas)' },
  { keys: 'F', desc: 'Construtor visual de filtros' },
  { keys: 's', desc: 'Escolher criterio de ordenacao' },
  { keys: 'S', desc: 'Inverter direcao da ordenacao' },
  { keys: 'c', desc: 'Mostrar/ocultar colunas de metricas' },
  { keys: 'p', desc: 'Alternar presets de filtro' },
  { keys: 'Enter', desc: 'Selecionar modelo' },
];

const Column = ({ title, items }: { title: string; items: readonly KeyHelp[] }) => (
  <Box flexDirection="column">
    <Text bold color="cyan">{title}</Text>
    {items.map((it) => (
      <Box key={it.keys} gap={1}>
        <Text color="green">{it.keys.padEnd(11)}</Text>
        <Text dimColor>{it.desc}</Text>
      </Box>
    ))}
  </Box>
);

/**
 * Overlay com a referencia completa de atalhos.
 *
 * @example
 * ```tsx
 * <HelpModal onClose={() => setHelpOpen(false)} />
 * ```
 */
export const HelpModal = ({ onClose, hasRefresh, hasCancel }: HelpModalProps) => {
  useInput((input, key) => {
    if (key.escape || key.return || input === '?') onClose();
  });

  const extras: KeyHelp[] = [];
  if (hasRefresh) extras.push({ keys: 'u', desc: 'Atualizar dados das APIs' });
  if (hasCancel) extras.push({ keys: 'ESC', desc: 'Cancelar / voltar' });
  extras.push({ keys: '?', desc: 'Abrir/fechar esta ajuda' });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="cyan" paddingX={2} paddingY={1}>
      <Text bold color="cyan">Atalhos de Teclado</Text>
      <Box marginTop={1} gap={4}>
        <Column title="Navegacao" items={NAV} />
        <Column title="Acoes" items={[...ACTIONS, ...extras]} />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Filtros: </Text>
        <Text color="yellow">$intel{'>='}40</Text>
        <Text dimColor> e metrica (AND), </Text>
        <Text color="white">gpt|claude</Text>
        <Text dimColor> e texto (OR). Combine com </Text>
        <Text color="white">|</Text>
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Pressione </Text>
        <Text color="green">?</Text>
        <Text dimColor> ou </Text>
        <Text color="red">ESC</Text>
        <Text dimColor> para fechar</Text>
      </Box>
    </Box>
  );
};
