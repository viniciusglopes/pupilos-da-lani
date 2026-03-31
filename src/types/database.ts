// Tipos TypeScript para o banco de dados

export interface Pessoa {
  id: string;
  nome: string;
  descricao?: string;
  altura?: number;
  cor_olhos?: string;
  cor_cabelo?: string;
  medidas_busto?: number;
  medidas_cintura?: number;
  medidas_quadril?: number;
  sexo?: string;  // NOVO: Campo sexo (Masculino/Feminino)
  especializacoes?: string[];
  localizacao?: string;
  instagram_url?: string;
  email?: string;
  telefone?: string;
  consentimento_contato: boolean;
  data_consentimento?: string;
  parceria: boolean;
  destaque: boolean;  // NOVO: Marcar pessoa como destaque na tela principal
  foto_principal?: string;
  video_principal?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Foto {
  id: string;
  pessoa_id: string;
  url_arquivo: string;
  caminho_storage?: string;
  eh_principal: boolean;
  ordem: number;
  created_at: string;
}

export interface Video {
  id: string;
  pessoa_id: string;
  url_arquivo: string;
  caminho_storage?: string;
  eh_principal: boolean;
  ordem: number;
  created_at: string;
}

export interface PessoaCompleta extends Pessoa {
  fotos: Foto[];
  videos: Video[];
}

// Tipos para forms
export interface PessoaForm {
  nome: string;
  descricao?: string;
  altura?: number;
  cor_olhos?: string;
  cor_cabelo?: string;
  medidas_busto?: number;
  medidas_cintura?: number;
  medidas_quadril?: number;
  sexo?: string;  // NOVO: Campo sexo no form
  especializacoes?: string[];
  localizacao?: string;
  instagram_url?: string;
  email?: string;
  telefone?: string;
  consentimento_contato: boolean;
  parceria: boolean;
  destaque?: boolean;  // NOVO: Campo destaque no form
}