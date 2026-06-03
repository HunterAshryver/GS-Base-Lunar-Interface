export interface Sensor {
  id?: number;
  tipo: string;
  localizacao: string;
  valorAtual: number;
  status: string;
  ultimaLeitura?: string;
}

export interface Reservatorio {
  id?: number;
  tipo: string;
  capacidadeMaxima: number;
  nivelAtual: number;
  localizacao: string;
}

export interface ConsumoEnergia {
  id?: number;
  consumoKwh: number;
  setor: string;
  dataHora?: string;
}

export interface Climatizacao {
  id?: number;
  temperatura: number;
  umidade: number;
  status: string;
  ultimaAtualizacao?: string;
}

export interface Alerta {
  id?: number;
  titulo: string;
  descricao: string;
  severidade: string;
  resolvido: boolean;
  dataHora?: string;
}