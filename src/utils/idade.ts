/**
 * Idade a partir da data de nascimento.
 *
 * Por que existe: a coluna `idade` do banco é um número digitado à mão, e por
 * isso ENVELHECE ERRADO — quem foi cadastrado com 8 anos continua aparecendo
 * com 8 no ano seguinte. A data de nascimento se mantém verdadeira sozinha.
 *
 * A data é dado INTERNO: nunca vai pra tela pública, só a idade calculada.
 *
 * Transição: enquanto `data_nascimento` estiver vazia, vale a `idade` digitada.
 * Assim que a data for preenchida, ela manda. Ninguém fica sem idade no meio
 * do caminho.
 */

/** Idade em anos completos hoje. `null` se a data não der pra ler. */
export function idadePorNascimento(dataNascimento?: string | null): number | null {
  if (!dataNascimento) return null

  // 'YYYY-MM-DD' do Postgres. Ler com `new Date('2015-03-20')` cai em UTC e, no
  // fuso do Brasil, volta um dia — o aniversário viraria véspera. Por isso os
  // números são separados na mão.
  const m = String(dataNascimento).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const ano = +m[1], mes = +m[2], dia = +m[3]

  const hoje = new Date()
  let idade = hoje.getFullYear() - ano
  // ainda não fez aniversário este ano
  const jaFezAniversario = hoje.getMonth() + 1 > mes || (hoje.getMonth() + 1 === mes && hoje.getDate() >= dia)
  if (!jaFezAniversario) idade--

  if (idade < 0 || idade > 120) return null
  return idade
}

/** A idade que a tela deve mostrar: a calculada, ou a digitada como reserva. */
export function idadeDe(p: { data_nascimento?: string | null; idade?: number | null }): number | null {
  return idadePorNascimento(p.data_nascimento) ?? (p.idade ?? null)
}

/** "8 anos" / "1 ano" / `null` quando não há idade nenhuma. */
export function idadeTexto(p: { data_nascimento?: string | null; idade?: number | null }): string | null {
  const i = idadeDe(p)
  if (i === null) return null
  return `${i} ${i === 1 ? 'ano' : 'anos'}`
}
