# API response shapes (fields actually consumed)

## OpenRouter `/api/v1/models` → `{ data: OpenRouterModel[] }`

Per model (zod-defaulted):
- `id`, `name`, `created` (unix s), `description`, `context_length`
- `architecture`: `modality`, `input_modalities[]`, `output_modalities[]`, `tokenizer`, `instruct_type`
- `pricing`: `prompt`, `completion`, `request`, `image` (all **strings**, USD/token)
- `top_provider`: `context_length`, `max_completion_tokens`, `is_moderated`
- `supported_parameters[]` (drives `hasTools` = includes `'tools'`, `hasReasoning` = includes `'reasoning'`)

→ mapped by `toModelEntry` to `ModelEntry { id, name, provider, contextWindow(K), inputPrice, outputPrice, maxCompletionTokens, hasTools, hasReasoning, isModerated, modality, tokenizer, description(≤200), createdAt(YYYY-MM-DD), supportedParams }`.

## Artificial Analysis `/api/v2/data/llms/models` → `{ status, data: AAModel[] }`

Per model:
- `id`, `name`, `slug`, `model_creator { id, name, slug }`
- `evaluations`: `artificial_analysis_intelligence_index`, `..._coding_index`, `..._math_index` (0–100), `mmlu_pro`, `gpqa`, `hle`, `livecodebench`, `scicode`, `math_500`, `aime` (0–1)
- `pricing`: `price_1m_blended_3_to_1`, `price_1m_input_tokens`, `price_1m_output_tokens`
- `median_output_tokens_per_second`, `median_time_to_first_token_seconds`, `median_time_to_first_answer_token`

→ mapped into `EnrichedModel.aa.{benchmarks, speed, pricing, creatorSlug, matched}`.
All evaluation/pricing fields are `.nullable().catch(null)` — assume any can be null.
