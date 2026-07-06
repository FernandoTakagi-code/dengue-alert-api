// Representa um único registro semanal retornado pela API do InfoDengue
export interface InfoDengueRecord {
  data_iniSE: string; // data de início da semana epidemiológica
  SE: number; // semana epidemiológica, formato YYYYWW

  // Casos
  casos: number;
  casos_est: number;
  casos_est_min: number;
  casos_est_max: number;

  // Localização
  municipio_geocodigo: number;
  municipio_nome: string;
  pop: number;

  // Indicadores de risco - os mais importantes pro nosso projeto
  nivel: 1 | 2 | 3 | 4; // 1=verde, 2=amarelo, 3=laranja, 4=vermelho
  Rt: number; // número reprodutivo
  p_rt1: number; // probabilidade de Rt > 1
  p_inc100k: number; // incidência por 100k habitantes

  // Clima da semana
  tempmed: number;
  tempmax: number;
  tempmin: number;
  umidmed: number;

  // Evidência epidemiológica
  receptivo: 0 | 1 | 2 | 3;
  transmissao: 0 | 1 | 2 | 3;
}

// Metadados de paginação que a API retorna junto com os dados
export interface Pagination {
  items: number;
  total_items: number;
  page: number;
  total_pages: number;
  per_page: number;
}

// Formato completo da resposta da API
export interface InfoDengueResponse {
  items: InfoDengueRecord[];
  pagination: Pagination;
}