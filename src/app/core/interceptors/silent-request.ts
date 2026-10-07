import { HttpContext, HttpContextToken } from '@angular/common/http';

/**
 * Marca requisições feitas em lote (ex.: importação de resumos dos anais).
 * Nelas os interceptors não mostram toast, não abrem o carregamento de tela
 * cheia e não redirecionam: a própria tela trata o erro de cada item.
 */
export const REQUISICAO_SILENCIOSA = new HttpContextToken<boolean>(() => false);

export function contextoSilencioso(): HttpContext {
  return new HttpContext().set(REQUISICAO_SILENCIOSA, true);
}
