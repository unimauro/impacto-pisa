export interface Distrito {
  ubigeo: string; distrito: string; provincia: string; departamento: string;
  pob?: number | null; idh?: number | null; pobreza?: number | null; pobreza_ext?: number | null; vuln_alim?: number | null;
  altitud?: number | null; agua_red?: number | null; desague_red?: number | null; electricidad?: number | null; internet?: number | null;
  enla_lec_sat?: number | null; enla_mat_sat?: number | null; enla_lec_prev?: number | null; enla_mat_prev?: number | null; enla_cob_est?: number | null; enla_cob_ie?: number | null;
  sed_n?: number; sed_anios?: string | null;
  sed_as_n?: number; sed_as_med?: number; sed_as_p90?: number; sed_as_max?: number; sed_as_pct_pel?: number; sed_as_n_ld?: number;
  sed_hg_n?: number; sed_hg_med?: number; sed_hg_p90?: number; sed_hg_max?: number; sed_hg_pct_pel?: number; sed_hg_n_ld?: number;
  sed_pb_n?: number; sed_pb_med?: number; sed_pb_p90?: number; sed_pb_max?: number; sed_pb_pct_pel?: number;
  sed_cd_n?: number; sed_cd_med?: number; sed_cd_p90?: number; sed_cd_max?: number; sed_cd_pct_pel?: number;
  sed_cu_n?: number; sed_cu_med?: number; sed_cu_max?: number;
  pam_n: number; pam_residuo_n: number; reinfo_vigente: number; reinfo_suspendido: number; reinfo_beneficio: number; reinfo_total: number;
  um_n: number; um_produccion_n: number; relaves_n: number; mineria_ilegal_anp_n: number; pasivos_hc_n: number; riesgo_oefa_alto_n: number; lotes_hc_n: number;
  emerg_n: number; emerg_hc_n: number; emerg_min_n: number; emerg_anios?: string | null; min_ilegal_ha?: number; min_informal_ha?: number;
  oefa_agua_n?: number; oefa_agua_anios?: string; oefa_as_n?: number; oefa_as_pct_a1?: number; oefa_as_pct_cat3?: number; oefa_as_max?: number; oefa_hg_n?: number; oefa_hg_pct_a1?: number; oefa_hg_pct_cat3?: number; oefa_hg_max?: number; oefa_pb_n?: number; oefa_pb_pct_a1?: number; oefa_pb_pct_cat3?: number; oefa_pb_max?: number; oefa_cd_n?: number; oefa_cd_pct_a1?: number; oefa_cd_pct_cat3?: number; oefa_cd_max?: number;
  ece16_4p_lec_sat?: number; ece16_4p_mat_sat?: number; ece18_4p_lec_sat?: number; ece18_4p_mat_sat?: number; ece19_2s_lec_sat?: number; ece19_2s_mat_sat?: number; desercion_prim_23_24?: number; atraso_prim_2025?: number;
  def_total_19_25?: number; tasa_inestable?: boolean; def_serie?: Record<string, number>;
  cob: Record<string, boolean>;
  [k: string]: unknown;
}
export interface Par {
  x: string; y: string; n: number; x_label: string; y_label: string; x_fuente: string; y_fuente: string; x_tipo: string; dominio: string;
  activo: boolean; motivo?: string; pearson?: number; pearson_p?: number; pearson_ci?: [number, number]; spearman?: number; spearman_p?: number; spearman_ci?: [number, number];
  parcial?: number; parcial_p?: number; parcial_ctrl?: string[];
  ols?: { beta: number; se: number; p: number; r2: number; ci: [number, number]; n: number; coef: Record<string, number> };
  por_departamento?: { dep: string; n: number; spearman: number; p: number }[];
}
export interface Analisis {
  n_min: number; controles: Record<string, string>; pares: Par[];
  matriz: { vars: string[]; labels: Record<string, string>; rho: (number | null)[][]; n: number[][] };
  descriptivos: Record<string, { n: number; media: number; mediana: number; p10: number; p90: number; min: number; max: number }>;
  advertencias: string[];
}
export interface Resumen {
  generado: string; n_distritos: number; cobertura: Record<string, number>;
  sedimentos: { n: number; asignados: number; anios: string; as_sobre_pel: number; hg_sobre_pel: number };
  pam: { n: number }; emergencias?: { n: number; asignadas: number }; mineria_ilegal_ha?: number; mineria_informal_ha?: number; oefa_agua?: { muestras: number; distritos: number }; reinfo: { n: number; vigente: number; suspendido: number };
  sinadef: { anios_tasa: [number, number]; def_total: number; t56_total_2017_2026: number }; enla: { n_distritos: number };
  referencias: Record<string, { eca_suelo_agr: number; ccme_pel: number }>;
}
export type PuntoSed = [number, number, number | null, number | null, number | null, number | null, string, string | null, string];
export type PuntoPam = [number, number, string, string, string, string, string | null];
export type PuntoOefa = [number, number, 'as' | 'hg' | 'pb' | 'cd', number, number, number, number, number, string | null, string];
export interface PuntoAgua { lon: number; lat: number; codigo: string; nombre: string | null; informe: string; ubigeo: string | null; as: number | null; as_ld: boolean; hg: number | null; hg_ld: boolean; pb: number | null; pb_ld: boolean; cd: number | null; cd_ld: boolean; cu: number | null; fe: number | null; mn: number | null; al: number | null }
export interface Fuente { id: string; institucion: string; dataset: string; url: string; formato: string; unidad: string; anios: string; licencia: string; limitaciones: string; estado: string; uso: string; dominio: string }
