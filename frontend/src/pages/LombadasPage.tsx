import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { BasePage } from '../components/BasePage';
import { useAccessibility } from '../hooks/useAccessibility';

const PERFIL_BASE_KEY = 'Casamento__B';
const LETRAS_COMPARTILHADAS = new Set(['B', 'C', 'E', 'A']);

const DEFAULT_LAYOUT_PROFILE_OVERRIDES: Record<string, Partial<LayoutConfig>> = {
  'Casamento__B': {
    alturaLogo: 50,
    alturaLetra: 30,
    alturaNumero: 15.83,
    alturaDatas: 15.83,
    fonteLetra: 90,
    fonteNumero: 90,
    fonteDatas: 22,
    larguraLogoSecao: 28,
    larguraLetraSecao: 9,
    larguraNumeroSecao: 9,
    larguraDatasSecao: 9,
    logoEscala: 140,
    offsetLogo: -17,
    offsetLetra: -33,
    offsetNumero: -25,
    offsetDatas: -10,
    bordaAtiva: true,
    bordaQuadrada: false
  },
  'Casamento__B-AUX': {
    alturaLogo: 50,
    alturaLetra: 30,
    alturaNumero: 15.83,
    alturaDatas: 15.83,
    fonteLetra: 55,
    fonteNumero: 55,
    fonteDatas: 22,
    larguraLogoSecao: 28,
    larguraLetraSecao: 9,
    larguraNumeroSecao: 9,
    larguraDatasSecao: 9,
    logoEscala: 140,
    offsetLogo: -17,
    offsetLetra: -33,
    offsetNumero: -25,
    offsetDatas: -10,
    bordaAtiva: true,
    bordaQuadrada: false
  },
  'Nascimento__A': {
    alturaLogo: 50,
    alturaLetra: 30,
    alturaNumero: 15.83,
    alturaDatas: 15.83,
    fonteLetra: 90,
    fonteNumero: 90,
    fonteDatas: 22,
    larguraLogoSecao: 28,
    larguraLetraSecao: 9,
    larguraNumeroSecao: 9,
    larguraDatasSecao: 9,
    logoEscala: 140,
    offsetLogo: -17,
    offsetLetra: -33,
    offsetNumero: -25,
    offsetDatas: -10,
    bordaAtiva: true,
    bordaQuadrada: false
  },
  'Livro E__E': {
    alturaLogo: 50,
    alturaLetra: 30,
    alturaNumero: 15.83,
    alturaDatas: 15.83,
    fonteLetra: 90,
    fonteNumero: 90,
    fonteDatas: 22,
    larguraLogoSecao: 28,
    larguraLetraSecao: 9,
    larguraNumeroSecao: 9,
    larguraDatasSecao: 9,
    logoEscala: 140,
    offsetLogo: -17,
    offsetLetra: -33,
    offsetNumero: -25,
    offsetDatas: -10,
    bordaAtiva: true,
    bordaQuadrada: false
  },
  'Óbito__C-AUX': {
    alturaLogo: 50,
    alturaLetra: 30,
    alturaNumero: 15.83,
    alturaDatas: 15.83,
    fonteLetra: 55,
    fonteNumero: 55,
    fonteDatas: 22,
    larguraLogoSecao: 28,
    larguraLetraSecao: 9,
    larguraNumeroSecao: 9,
    larguraDatasSecao: 9,
    logoEscala: 140,
    offsetLogo: -17,
    offsetLetra: -33,
    offsetNumero: -25,
    offsetDatas: -10,
    bordaAtiva: true,
    bordaQuadrada: false
  },
  'Remissivo__Livro de Transporte': {
    alturaLogo: 50,
    alturaLetra: 30,
    alturaNumero: 15.83,
    alturaDatas: 15.83,
    fonteLetra: 55,
    fonteNumero: 55,
    fonteDatas: 22,
    larguraLogoSecao: 28,
    larguraLetraSecao: 9,
    larguraNumeroSecao: 9,
    larguraDatasSecao: 9,
    logoEscala: 140,
    offsetLogo: -17,
    offsetLetra: -33,
    offsetNumero: -25,
    offsetDatas: -10,
    bordaAtiva: true,
    bordaQuadrada: false
  },
  'Edital de Proclamas__D': {
    alturaLogo: 50,
    alturaLetra: 30,
    alturaNumero: 15.83,
    alturaDatas: 15.83,
    fonteLetra: 90,
    fonteNumero: 90,
    fonteDatas: 22,
    larguraLogoSecao: 28,
    larguraLetraSecao: 9,
    larguraNumeroSecao: 9,
    larguraDatasSecao: 9,
    logoEscala: 140,
    offsetLogo: -17,
    offsetLetra: -33,
    offsetNumero: -25,
    offsetDatas: -10,
    bordaAtiva: true,
    bordaQuadrada: false
  }
};
type LayoutConfig = {
  alturaLogo: number;
  alturaLetra: number;
  alturaNumero: number;
  alturaDatas: number;
  fonteLetra: number;
  fonteNumero: number;
  fonteDatas: number;
  larguraLogoSecao: number;
  larguraLetraSecao: number;
  larguraNumeroSecao: number;
  larguraDatasSecao: number;
  logoEscala: number;
  offsetLogo: number;
  offsetLetra: number;
  offsetNumero: number;
  offsetDatas: number;
  bordaAtiva: boolean;
  bordaQuadrada: boolean;
};

type PerfilOverrides = Partial<LayoutConfig>;

interface LombadaData {
  codigo: string; // Código único gerado automaticamente
  logo: string;
  tipoLivro: string;
  letra: string;
  numero: string;
  dataInicio: string;
  dataFim: string;
  infoAdicional: string;
  contexto?: 'livro' | 'classificador';
  layout?: LayoutConfig;
}

interface LombadasPageProps {
  onClose: () => void;
  modo?: 'livro' | 'classificador';
}

interface ConfiguracoesImpressao {
  logoCartorio: string;
  alturaLombada: number;
  larguraLombada: number;
  alturaLogo: number;
  alturaLetra: number;
  alturaNumero: number;
  alturaDatas: number;
  fonteLetra: number;
  fonteNumero: number;
  fonteDatas: number;
  larguraLogoSecao: number;
  larguraLetraSecao: number;
  larguraNumeroSecao: number;
  larguraDatasSecao: number;
  logoEscala: number;
  perfis?: Record<string, PerfilOverrides>;
  offsetLogo: number;
  offsetLetra: number;
  offsetNumero: number;
  offsetDatas: number;
  bordaAtiva?: boolean;
  bordaQuadrada?: boolean;
}

const MM_TO_PX = 3.7795275591;
const PREVIEW_SCALE = 3.8;
const PREVIEW_PADDING = 14;
const TEXT_SECTION_COUNT = 3;
const SECTION_GAP_MM = 2.5;
const TARGET_FONT_PX = 20;
const DEFAULT_SPINE_HEIGHT_MM = 105;
const DEFAULT_SPINE_WIDTH_MM = 55;
const DEFAULT_LOGO_HEIGHT_MM = 50;
const DEFAULT_LOGO_WIDTH_MM = 28;
const DEFAULT_TEXT_HEIGHT_MM = Number(
  ((DEFAULT_SPINE_HEIGHT_MM - DEFAULT_LOGO_HEIGHT_MM - SECTION_GAP_MM * TEXT_SECTION_COUNT) / TEXT_SECTION_COUNT).toFixed(2)
);
const DEFAULT_TEXT_WIDTH_MM = Number(
  ((DEFAULT_SPINE_WIDTH_MM - DEFAULT_LOGO_WIDTH_MM) / TEXT_SECTION_COUNT).toFixed(2)
);
const DEFAULT_OFFSET_MM = 0;

const clamp = (valor: number, min: number, max: number) => Math.min(Math.max(valor, min), max);

export default function LombadasPage({ onClose, modo }: LombadasPageProps) {
  const { getTheme, currentTheme } = useAccessibility();
  const theme = getTheme();
  const headerColor = currentTheme === 'dark' ? theme.primary : '#008080';
  
  const [abaAtiva, setAbaAtiva] = useState<'cadastro' | 'impressao'>('cadastro');
  const [submenuCadastro, setSubmenuCadastro] = useState<'livro' | 'classificador'>(modo ?? 'livro');
  
  // Carregar configurações de impressão
  const [logo, setLogo] = useState<string>('');
  const [alturaLombada, setAlturaLombada] = useState<number>(DEFAULT_SPINE_HEIGHT_MM);
  const [larguraLombada, setLarguraLombada] = useState<number>(DEFAULT_SPINE_WIDTH_MM);
  const [alturaLogo, setAlturaLogo] = useState<number>(DEFAULT_LOGO_HEIGHT_MM);
  const [alturaLetra, setAlturaLetra] = useState<number>(DEFAULT_TEXT_HEIGHT_MM);
  const [alturaNumero, setAlturaNumero] = useState<number>(DEFAULT_TEXT_HEIGHT_MM);
  const [alturaDatas, setAlturaDatas] = useState<number>(DEFAULT_TEXT_HEIGHT_MM);
  const [fonteLetra, setFonteLetra] = useState<number>(TARGET_FONT_PX);
  const [fonteNumero, setFonteNumero] = useState<number>(TARGET_FONT_PX);
  const [fonteDatas, setFonteDatas] = useState<number>(TARGET_FONT_PX);
  const [larguraLogoSecao, setLarguraLogoSecao] = useState<number>(DEFAULT_LOGO_WIDTH_MM);
  const [larguraLetraSecao, setLarguraLetraSecao] = useState<number>(DEFAULT_TEXT_WIDTH_MM);
  const [larguraNumeroSecao, setLarguraNumeroSecao] = useState<number>(DEFAULT_TEXT_WIDTH_MM);
  const [larguraDatasSecao, setLarguraDatasSecao] = useState<number>(DEFAULT_TEXT_WIDTH_MM);
  const [logoEscala, setLogoEscala] = useState<number>(100);
  const [perfis, setPerfis] = useState<Record<string, PerfilOverrides>>({ ...DEFAULT_LAYOUT_PROFILE_OVERRIDES });
  const [offsetLogo, setOffsetLogo] = useState<number>(DEFAULT_OFFSET_MM);
  const [offsetLetra, setOffsetLetra] = useState<number>(DEFAULT_OFFSET_MM);
  const [offsetNumero, setOffsetNumero] = useState<number>(DEFAULT_OFFSET_MM);
  const [offsetDatas, setOffsetDatas] = useState<number>(DEFAULT_OFFSET_MM);
  const [bordaAtiva, setBordaAtiva] = useState<boolean>(true);
  const [bordaQuadrada, setBordaQuadrada] = useState<boolean>(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const [lombadas, setLombadas] = useState<LombadaData[]>(() => {
    try {
      const lombadasSalvas = localStorage.getItem('lombadas-livros');
      if (lombadasSalvas) {
        const lombadasParseadas = JSON.parse(lombadasSalvas) as Partial<LombadaData>[];
        return lombadasParseadas.map((lombada) => ({
          codigo: '0',
          logo: lombada.logo ?? '',
          tipoLivro: lombada.tipoLivro ?? '',
          letra: lombada.letra ?? '',
          numero: lombada.numero ?? '',
          dataInicio: lombada.dataInicio ?? '',
          dataFim: lombada.dataFim ?? '',
          infoAdicional: lombada.infoAdicional ?? '',
          contexto: lombada.contexto === 'classificador' ? 'classificador' : 'livro',
          layout: lombada.layout as LayoutConfig | undefined
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar lombadas:', error);
    }
    return [];
  });
  // Função para carregar configurações
  const carregarConfiguracoes = useCallback(() => {
    try {
      const configImpressao = localStorage.getItem('config-impressao-livros');
      if (configImpressao) {
        const config = JSON.parse(configImpressao) as Partial<ConfiguracoesImpressao>;
        setLogo(config.logoCartorio || '');
        setAlturaLombada(config.alturaLombada ?? DEFAULT_SPINE_HEIGHT_MM);
        setLarguraLombada(config.larguraLombada ?? DEFAULT_SPINE_WIDTH_MM);
        setAlturaLogo(config.alturaLogo ?? DEFAULT_LOGO_HEIGHT_MM);
        setAlturaLetra(config.alturaLetra ?? DEFAULT_TEXT_HEIGHT_MM);
        setAlturaNumero(config.alturaNumero ?? DEFAULT_TEXT_HEIGHT_MM);
        setAlturaDatas(config.alturaDatas ?? DEFAULT_TEXT_HEIGHT_MM);
        setFonteLetra(config.fonteLetra ?? TARGET_FONT_PX);
        setFonteNumero(config.fonteNumero ?? TARGET_FONT_PX);
        setFonteDatas(config.fonteDatas ?? TARGET_FONT_PX);
        setLarguraLogoSecao(config.larguraLogoSecao ?? DEFAULT_LOGO_WIDTH_MM);
        setLarguraLetraSecao(config.larguraLetraSecao ?? DEFAULT_TEXT_WIDTH_MM);
        setLarguraNumeroSecao(config.larguraNumeroSecao ?? DEFAULT_TEXT_WIDTH_MM);
        setLarguraDatasSecao(config.larguraDatasSecao ?? DEFAULT_TEXT_WIDTH_MM);
        setLogoEscala(config.logoEscala ?? 100);
        setOffsetLogo(config.offsetLogo ?? DEFAULT_OFFSET_MM);
        setOffsetLetra(config.offsetLetra ?? DEFAULT_OFFSET_MM);
        setOffsetNumero(config.offsetNumero ?? DEFAULT_OFFSET_MM);
        setOffsetDatas(config.offsetDatas ?? DEFAULT_OFFSET_MM);
        setBordaAtiva(config.bordaAtiva ?? true);
        setBordaQuadrada(config.bordaQuadrada ?? false);
        const mergedPerfis = {
          ...DEFAULT_LAYOUT_PROFILE_OVERRIDES,
          ...(config.perfis ?? {})
        };
        setPerfis(mergedPerfis);
        console.log('✅ Configurações carregadas:', config);
      } else {
        setAlturaLombada(DEFAULT_SPINE_HEIGHT_MM);
        setLarguraLombada(DEFAULT_SPINE_WIDTH_MM);
        setAlturaLogo(DEFAULT_LOGO_HEIGHT_MM);
        setAlturaLetra(DEFAULT_TEXT_HEIGHT_MM);
        setAlturaNumero(DEFAULT_TEXT_HEIGHT_MM);
        setAlturaDatas(DEFAULT_TEXT_HEIGHT_MM);
        setFonteLetra(TARGET_FONT_PX);
        setFonteNumero(TARGET_FONT_PX);
        setFonteDatas(TARGET_FONT_PX);
        setLarguraLogoSecao(DEFAULT_LOGO_WIDTH_MM);
        setLarguraLetraSecao(DEFAULT_TEXT_WIDTH_MM);
        setLarguraNumeroSecao(DEFAULT_TEXT_WIDTH_MM);
        setLarguraDatasSecao(DEFAULT_TEXT_WIDTH_MM);
        setLogoEscala(100);
        setOffsetLogo(DEFAULT_OFFSET_MM);
        setOffsetLetra(DEFAULT_OFFSET_MM);
        setOffsetNumero(DEFAULT_OFFSET_MM);
        setOffsetDatas(DEFAULT_OFFSET_MM);
        setBordaAtiva(true);
        setBordaQuadrada(false);
        setPerfis({ ...DEFAULT_LAYOUT_PROFILE_OVERRIDES });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setAlturaLombada(DEFAULT_SPINE_HEIGHT_MM);
      setLarguraLombada(DEFAULT_SPINE_WIDTH_MM);
      setAlturaLogo(DEFAULT_LOGO_HEIGHT_MM);
      setAlturaLetra(DEFAULT_TEXT_HEIGHT_MM);
      setAlturaNumero(DEFAULT_TEXT_HEIGHT_MM);
      setAlturaDatas(DEFAULT_TEXT_HEIGHT_MM);
      setFonteLetra(TARGET_FONT_PX);
      setFonteNumero(TARGET_FONT_PX);
      setFonteDatas(TARGET_FONT_PX);
      setLarguraLogoSecao(DEFAULT_LOGO_WIDTH_MM);
      setLarguraLetraSecao(DEFAULT_TEXT_WIDTH_MM);
      setLarguraNumeroSecao(DEFAULT_TEXT_WIDTH_MM);
      setLarguraDatasSecao(DEFAULT_TEXT_WIDTH_MM);
      setLogoEscala(100);
      setPerfis({ ...DEFAULT_LAYOUT_PROFILE_OVERRIDES });
      setOffsetLogo(DEFAULT_OFFSET_MM);
      setOffsetLetra(DEFAULT_OFFSET_MM);
      setOffsetNumero(DEFAULT_OFFSET_MM);
      setOffsetDatas(DEFAULT_OFFSET_MM);
      setBordaAtiva(true);
      setBordaQuadrada(false);
    }
  }, []);

  // Carregar configurações ao montar o componente
  useEffect(() => {
    carregarConfiguracoes();
  }, [carregarConfiguracoes]);

  // Atualizar quando configurações mudarem
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🖼️ Configurações de impressão atualizadas! Recarregando...');
      carregarConfiguracoes();
      setLombadas((prev) =>
        prev.map((lombada) =>
          lombada.layout ? { ...lombada, layout: undefined } : lombada
        )
      );
    };

    window.addEventListener('config-impressao-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('config-impressao-updated', handleConfigUpdate);
    };
  }, [carregarConfiguracoes]);
  const [tiposLivro] = useState([
    'Casamento',
    'Edital de Proclamas',
    'Livro E',
    'Nascimento',
    'Remissivo',
    'Óbito'
  ]);

  // Mapeamento de tipo de livro para letras disponíveis
  const tipoParaLetras: Record<string, string[]> = {
    'Casamento': ['B', 'B-AUX'],
    'Óbito': ['C', 'C-AUX'],
    'Nascimento': ['A'],
    'Livro E': ['E'],
    'Edital de Proclamas': ['D'],
    'Remissivo': ['Livro de Transporte']
  };

  const criarChavePerfil = (tipo: string, letra: string) => `${tipo}__${letra}`;

  const construirLayout = useCallback((overrides: Partial<LayoutConfig> = {}): LayoutConfig => ({
    alturaLogo,
    alturaLetra,
    alturaNumero,
    alturaDatas,
    fonteLetra,
    fonteNumero,
    fonteDatas,
    larguraLogoSecao,
    larguraLetraSecao,
    larguraNumeroSecao,
    larguraDatasSecao,
    logoEscala,
    offsetLogo,
    offsetLetra,
    offsetNumero,
    offsetDatas,
    bordaAtiva,
    bordaQuadrada,
    ...overrides
  }), [
    alturaLogo,
    alturaLetra,
    alturaNumero,
    alturaDatas,
    fonteLetra,
    fonteNumero,
    fonteDatas,
    larguraLogoSecao,
    larguraLetraSecao,
    larguraNumeroSecao,
    larguraDatasSecao,
    logoEscala,
    offsetLogo,
    offsetLetra,
    offsetNumero,
    offsetDatas,
    bordaAtiva,
    bordaQuadrada
  ]);

  const obterLayoutPara = useCallback((tipo?: string, letra?: string): LayoutConfig => {
    if (!tipo || !letra) {
      return construirLayout();
    }
    const key = criarChavePerfil(tipo, letra);
    const overridesDiretos = perfis[key];
    if (overridesDiretos) {
      return construirLayout(overridesDiretos);
    }
    if (LETRAS_COMPARTILHADAS.has(letra)) {
      const overridesFallback = perfis[PERFIL_BASE_KEY];
      if (overridesFallback) {
        return construirLayout(overridesFallback);
      }
    }
    return construirLayout();
  }, [construirLayout, perfis]);

  const obterLayoutParaLombada = useCallback((lombada?: LombadaData): LayoutConfig => {
    if (!lombada) {
      return construirLayout();
    }
    if (lombada.layout) {
      return construirLayout(lombada.layout);
    }
    return obterLayoutPara(lombada.tipoLivro, lombada.letra);
  }, [construirLayout, obterLayoutPara]);

  const formatTwoDecimalsTruncated = (value: number) => {
    if (!Number.isFinite(value)) {
      return '0.00';
    }
    return (Math.trunc(value * 100) / 100).toFixed(2);
  };

  const calcularLayoutDados = useCallback((layout: LayoutConfig) => {
    const availableHeightMm = Math.max(alturaLombada - SECTION_GAP_MM * TEXT_SECTION_COUNT, 0);
    const logoBaseHeightMm = clamp(layout.alturaLogo, 0, availableHeightMm);
    const logoScaleFactor = Math.max(layout.logoEscala || 100, 1) / 100;
    const logoHeightMm = Math.min(logoBaseHeightMm * logoScaleFactor, availableHeightMm);
    const remainingHeightMm = Math.max(availableHeightMm - logoHeightMm, 0);

    const heightWeights = {
      letra: Math.max(layout.alturaLetra, 0),
      numero: Math.max(layout.alturaNumero, 0),
      datas: Math.max(layout.alturaDatas, 0)
    };
    const totalHeightWeights = heightWeights.letra + heightWeights.numero + heightWeights.datas;

    const calcularAlturaTexto = (peso: number) => {
      if (remainingHeightMm <= 0) return 0;
      if (totalHeightWeights <= 0) return remainingHeightMm / TEXT_SECTION_COUNT;
      return (remainingHeightMm * peso) / totalHeightWeights;
    };

    const heightsMm = {
      logo: logoHeightMm,
      letra: calcularAlturaTexto(heightWeights.letra),
      numero: calcularAlturaTexto(heightWeights.numero),
      datas: calcularAlturaTexto(heightWeights.datas)
    };

    const previewHeights = {
      logo: heightsMm.logo * PREVIEW_SCALE,
      letra: heightsMm.letra * PREVIEW_SCALE,
      numero: heightsMm.numero * PREVIEW_SCALE,
      datas: heightsMm.datas * PREVIEW_SCALE
    };

    const printHeightsPx = {
      logo: heightsMm.logo * MM_TO_PX,
      letra: heightsMm.letra * MM_TO_PX,
      numero: heightsMm.numero * MM_TO_PX,
      datas: heightsMm.datas * MM_TO_PX
    };

    const availableWidthMm = Math.max(larguraLombada, 0);
    const logoBaseWidthMm = clamp(layout.larguraLogoSecao, 0, availableWidthMm);
    const logoWidthMm = Math.min(logoBaseWidthMm * logoScaleFactor, availableWidthMm);
    const remainingWidthMm = Math.max(availableWidthMm - logoWidthMm, 0);
    const widthWeights = {
      letra: Math.max(layout.larguraLetraSecao, 0),
      numero: Math.max(layout.larguraNumeroSecao, 0),
      datas: Math.max(layout.larguraDatasSecao, 0)
    };
    const totalWidthWeights = widthWeights.letra + widthWeights.numero + widthWeights.datas;

    const calcularLarguraTexto = (peso: number) => {
      if (remainingWidthMm <= 0) return 0;
      if (totalWidthWeights <= 0) return remainingWidthMm / TEXT_SECTION_COUNT;
      return (remainingWidthMm * peso) / totalWidthWeights;
    };

    const widthsMm = {
      logo: logoWidthMm,
      letra: calcularLarguraTexto(widthWeights.letra),
      numero: calcularLarguraTexto(widthWeights.numero),
      datas: calcularLarguraTexto(widthWeights.datas)
    };

    const previewWidths = {
      logo: Math.max(widthsMm.logo, 0.1) * PREVIEW_SCALE,
      letra: Math.max(widthsMm.letra, 0.1) * PREVIEW_SCALE,
      numero: Math.max(widthsMm.numero, 0.1) * PREVIEW_SCALE,
      datas: Math.max(widthsMm.datas, 0.1) * PREVIEW_SCALE
    };

    const printWidthsPx = {
      logo: Math.max(widthsMm.logo, 0.1) * MM_TO_PX,
      letra: Math.max(widthsMm.letra, 0.1) * MM_TO_PX,
      numero: Math.max(widthsMm.numero, 0.1) * MM_TO_PX,
      datas: Math.max(widthsMm.datas, 0.1) * MM_TO_PX
    };

    const printLetterFontPx = Math.max(layout.fonteLetra || TARGET_FONT_PX, 1);
    const printNumberFontPx = Math.max(layout.fonteNumero || TARGET_FONT_PX, 1);
    const printDatesFontPx = Math.max(layout.fonteDatas || TARGET_FONT_PX, 1);
    const printDatesSeparatorFontPx = Math.max(printDatesFontPx * 0.8, 12);

    const previewFontFactor = PREVIEW_SCALE / MM_TO_PX;
    const previewLetterFontSize = printLetterFontPx * previewFontFactor;
    const previewNumberFontSize = printNumberFontPx * previewFontFactor;
    const previewDatesFontSize = printDatesFontPx * previewFontFactor;
    const previewDatesSeparatorSize = printDatesSeparatorFontPx * previewFontFactor;

    const safeOffsetLogo = typeof layout.offsetLogo === 'number' ? layout.offsetLogo : 0;
    const safeOffsetLetra = typeof layout.offsetLetra === 'number' ? layout.offsetLetra : 0;
    const safeOffsetNumero = typeof layout.offsetNumero === 'number' ? layout.offsetNumero : 0;
    const safeOffsetDatas = typeof layout.offsetDatas === 'number' ? layout.offsetDatas : 0;

    const previewOffsets = {
      logo: safeOffsetLogo * PREVIEW_SCALE,
      letra: safeOffsetLetra * PREVIEW_SCALE,
      numero: safeOffsetNumero * PREVIEW_SCALE,
      datas: safeOffsetDatas * PREVIEW_SCALE
    };

    const printOffsets = {
      logo: safeOffsetLogo * MM_TO_PX,
      letra: safeOffsetLetra * MM_TO_PX,
      numero: safeOffsetNumero * MM_TO_PX,
      datas: safeOffsetDatas * MM_TO_PX
    };

    const bordaAtiva = layout.bordaAtiva !== false;
    const bordaQuadrada = layout.bordaQuadrada === true;

    return {
      heightsMm,
      widthsMm,
      previewHeights,
      previewWidths,
      printHeightsPx,
      printWidthsPx,
      previewLetterFontSize,
      previewNumberFontSize,
      previewDatesFontSize,
      previewDatesSeparatorSize,
      printLetterFontPx,
      printNumberFontPx,
      printDatesFontPx,
      printDatesSeparatorFontPx,
      logoScaleFactor,
      previewOffsets,
      printOffsets,
      bordaAtiva,
      bordaQuadrada
    };
  }, [alturaLombada, larguraLombada]);

  useEffect(() => {
    if (logo) {
      setLombadas((prev) =>
        prev.map(lombada =>
          lombada.logo ? lombada : { ...lombada, logo }
        ));
    }
  }, [logo]);

  useEffect(() => {
    setLombadas((prev) => {
      let alterou = false;
      const atualizadas = prev.map((lombada) => {
        if (!lombada.tipoLivro || !lombada.letra) {
          return lombada;
        }
        const novoLayout = obterLayoutPara(lombada.tipoLivro, lombada.letra);
        const layoutExistente = lombada.layout;
        let igual = true;
        if (!layoutExistente) {
          igual = false;
        } else {
          (Object.keys(novoLayout) as (keyof LayoutConfig)[]).forEach((campo) => {
            if (!igual) {
              return;
            }
            const valorAtual = layoutExistente[campo];
            const valorNovo = novoLayout[campo];

            if (typeof valorAtual === 'number' && typeof valorNovo === 'number') {
              if (Math.abs(valorAtual - valorNovo) > 0.0001) {
                igual = false;
              }
            } else if (typeof valorAtual === 'boolean' && typeof valorNovo === 'boolean') {
              if (valorAtual !== valorNovo) {
                igual = false;
              }
            }
          });
        }
        if (igual) {
          return lombada;
        }
        alterou = true;
        return { ...lombada, layout: novoLayout };
      });
      return alterou ? atualizadas : prev;
    });
  }, [obterLayoutPara]);

  // Função para gerar código fixo
  const gerarCodigo = useCallback(() => '0', []);

  const criarFormDataInicial = useCallback((contexto: 'livro' | 'classificador'): LombadaData => ({
    codigo: gerarCodigo(),
    logo: '',
    tipoLivro: '',
    letra: '',
    numero: '',
    dataInicio: '',
    dataFim: '',
    infoAdicional: '',
    contexto,
    layout: undefined
  }), [gerarCodigo]);

  const [formData, setFormData] = useState<LombadaData>(() => criarFormDataInicial(modo ?? 'livro'));

  const [letrasDisponiveis, setLetrasDisponiveis] = useState<string[]>([]);
  const [lombadaSelecionada, setLombadaSelecionada] = useState<number | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const activePreviewIndices = useMemo(() => {
    if (selectionMode && selectedIndices.length > 0) {
      return selectedIndices;
    }
    if (lombadaSelecionada !== null) {
      return [lombadaSelecionada];
    }
    return lombadas.length > 0 ? [0] : [];
  }, [selectionMode, selectedIndices, lombadaSelecionada, lombadas.length]);

  const lombadasParaImpressao = useMemo(() => {
    if (selectionMode && selectedIndices.length > 0) {
      return selectedIndices
        .map((index) => lombadas[index])
        .filter((item): item is LombadaData => Boolean(item));
    }
    if (lombadaSelecionada !== null) {
      const item = lombadas[lombadaSelecionada];
      return item ? [item] : [];
    }
    if (lombadas.length > 0) {
      const first = lombadas[0];
      return first ? [first] : [];
    }
    return [];
  }, [selectionMode, selectedIndices, lombadaSelecionada, lombadas]);

  const previewLabel = useMemo(() => {
    const currentIndex = activePreviewIndices.indexOf(lombadaSelecionada ?? -1);
    if (currentIndex === -1) {
      return '';
    }
    const total = selectionMode && activePreviewIndices.length > 0 ? activePreviewIndices.length : lombadas.length;
    return ` (${currentIndex + 1}/${total})`;
  }, [activePreviewIndices, selectionMode, lombadaSelecionada, lombadas.length]);

  useEffect(() => {
    if (selectionMode) {
      if (selectedIndices.length > 0) {
        if (!selectedIndices.includes(lombadaSelecionada ?? -1)) {
          setLombadaSelecionada(selectedIndices[0]);
        }
      } else {
        setSelectionMode(false);
        setLombadaSelecionada(null);
      }
    } else if (lombadas.length > 0 && (lombadaSelecionada === null || lombadaSelecionada >= lombadas.length)) {
      setLombadaSelecionada(0);
    }
  }, [selectionMode, selectedIndices, lombadas.length, lombadaSelecionada]);

  const selecionarSubmenu = useCallback((novo: 'livro' | 'classificador', resetForm = true) => {
    setSubmenuCadastro(novo);
    if (resetForm) {
      setModoEdicao(false);
      setLombadaSelecionada(null);
      setLetrasDisponiveis([]);
      setFormData(criarFormDataInicial(novo));
    }
  }, [criarFormDataInicial]);

  useEffect(() => {
    if (modo) {
      selecionarSubmenu(modo, true);
    }
  }, [modo, selecionarSubmenu]);

  // Salvar lombadas no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('lombadas-livros', JSON.stringify(lombadas));
      console.log('💾 Lombadas salvas:', lombadas.length);
    } catch (error) {
      console.error('Erro ao salvar lombadas:', error);
    }
  }, [lombadas]);

  const printRef = useRef<HTMLDivElement>(null);

  const aguardarImagens = useCallback(() => {
    return new Promise<void>((resolve) => {
      const container = printRef.current;
      if (!container) {
        resolve();
        return;
      }

      const imagens = Array.from(container.querySelectorAll('img'));
      if (imagens.length === 0) {
        resolve();
        return;
      }

      let carregadas = 0;
      const finalizar = () => {
        carregadas += 1;
        if (carregadas >= imagens.length) {
          resolve();
        }
      };

      imagens.forEach((img) => {
        if (img.complete && img.naturalWidth !== 0) {
          finalizar();
        } else {
          const onLoad = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            finalizar();
          };
          const onError = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            console.warn('Imagem não pôde ser carregada para impressão:', img.src);
            finalizar();
          };
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
        }
      });
    });
  }, []);

  const printHandler = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Lombadas',
    preserveAfterPrint: true,
    onBeforePrint: aguardarImagens
  });

  const handlePrintClick = useCallback(() => {
    if (lombadasParaImpressao.length === 0) {
      alert('⚠️ Selecione ao menos uma lombada para imprimir.');
      return;
    }
    if (typeof printHandler === 'function') {
      printHandler();
    } else {
      alert('Não foi possível iniciar a impressão.');
    }
  }, [printHandler, lombadasParaImpressao.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Se mudou o tipo de livro, atualiza as letras disponíveis
    if (name === 'tipoLivro') {
      const novasLetras = tipoParaLetras[value] || [];
      setLetrasDisponiveis(novasLetras);
      setFormData({ ...formData, [name]: value, letra: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const adicionarLombada = () => {
    if (!formData.letra || !formData.numero || !formData.dataInicio || !formData.dataFim) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const layoutAtual = obterLayoutPara(formData.tipoLivro, formData.letra);

    if (modoEdicao && lombadaSelecionada !== null) {
      const novasLombadas = [...lombadas];
      novasLombadas[lombadaSelecionada] = { ...formData, contexto: submenuCadastro, logo, layout: layoutAtual };
      setLombadas(novasLombadas);
      setModoEdicao(false);
      setLombadaSelecionada(null);
      limparFormulario();
    } else {
      const novaLombada: LombadaData = { ...formData, contexto: submenuCadastro, logo, layout: layoutAtual };
      setLombadas([...lombadas, novaLombada]);
      setLombadaSelecionada(lombadas.length);
      limparFormulario();
    }

    setAbaAtiva('impressao');
  };

  const removerLombada = (index: number) => {
    setLombadas((prev) => prev.filter((_, i) => i !== index));

    if (selectionMode) {
      setSelectedIndices((prev) => {
        const adjusted = prev
          .filter((i) => i !== index)
          .map((i) => (i > index ? i - 1 : i));

        if (adjusted.length === 0) {
          setSelectionMode(false);
          setLombadaSelecionada(null);
        } else {
          setLombadaSelecionada(adjusted[adjusted.length - 1]);
        }

        return adjusted;
      });
    } else {
      if (lombadaSelecionada === index) {
        setLombadaSelecionada(null);
      } else if (lombadaSelecionada !== null && lombadaSelecionada > index) {
        setLombadaSelecionada(lombadaSelecionada - 1);
      }
    }
  };

  const handleItemClick = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (event.detail > 1) {
      return;
    }
    setModoEdicao(false);

    if (selectionMode) {
      setSelectedIndices((prev) => {
        const exists = prev.includes(index);
        let next: number[];
        if (exists) {
          next = prev.filter((i) => i !== index);
        } else {
          next = [...prev, index];
        }

        if (next.length > 0) {
          setLombadaSelecionada(next[next.length - 1]);
        } else {
          setLombadaSelecionada(null);
          setSelectionMode(false);
        }

        return next;
      });
    } else {
      setLombadaSelecionada((prev) => (prev === index ? null : index));
    }
  };

  const handleItemDoubleClick = (index: number) => {
    setModoEdicao(false);
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIndices([index]);
      setLombadaSelecionada(index);
    }
  };

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIndices([]);
    setLombadaSelecionada((prev) => {
      if (lombadas.length === 0) {
        return null;
      }
      if (prev !== null && prev < lombadas.length) {
        return prev;
      }
      return 0;
    });
  }, [lombadas.length]);

  const editarLombada = (index: number) => {
    const lombada = lombadas[index];
    selecionarSubmenu(lombada.contexto ?? 'livro', false);
    setFormData({
      codigo: lombada.codigo || '0', // Mantém o código atual ou padrão
      logo: lombada.logo,
      tipoLivro: lombada.tipoLivro,
      letra: lombada.letra,
      numero: lombada.numero,
      dataInicio: lombada.dataInicio,
      dataFim: lombada.dataFim,
      infoAdicional: lombada.infoAdicional,
      contexto: lombada.contexto ?? submenuCadastro,
      layout: lombada.layout
    });
    setLetrasDisponiveis(tipoParaLetras[lombada.tipoLivro] || []);
    setLombadaSelecionada(index);
    setModoEdicao(true);
    setAbaAtiva('cadastro');
  };

  const limparFormulario = () => {
    setFormData(criarFormDataInicial(submenuCadastro));
  };

  // Estilos dinâmicos baseados no tema
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: theme.surface,
    color: theme.text,
    borderRadius: '12px',
    boxShadow: currentTheme === 'dark'
      ? '0 2px 6px rgba(0,0,0,0.4)'
      : '0 2px 10px rgba(0,0,0,0.08)'
  };

  const outerWrapperStyle: React.CSSProperties = {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.background,
    padding: '16px',
    borderRadius: '12px',
    overflow: 'hidden',
    gap: '16px'
  };

  const formGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '20px'
  };

  const fieldContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column'
  };

  const labelStyle: React.CSSProperties = {
    marginBottom: '8px',
    fontWeight: '500',
    color: theme.text,
    fontSize: '14px'
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px',
    fontSize: '14px',
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: theme.surface,
    color: theme.text
  };

  const arrowColor = currentTheme === 'dark' ? '%23FFFFFF' : '%23333333';
  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${arrowColor}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '16px',
    paddingRight: '32px'
  };

  const buttonContainerStyle: React.CSSProperties = {
    marginTop: '10px',
    display: 'flex',
    gap: '10px'
  };

  const previewWidthPx = Math.max(larguraLombada, 0.1) * PREVIEW_SCALE;
  const previewHeightPx = Math.max(alturaLombada, 0.1) * PREVIEW_SCALE;
  const previewContainerWidth = previewWidthPx + PREVIEW_PADDING * 2;
  const previewContainerHeight = previewHeightPx + PREVIEW_PADDING * 2;

  const previewGapPx = SECTION_GAP_MM * PREVIEW_SCALE;
  const printGapPx = SECTION_GAP_MM * MM_TO_PX;

  const cardShadow = currentTheme === 'dark'
    ? '0 4px 12px rgba(0,0,0,0.6)'
    : '0 4px 10px rgba(0,0,0,0.15)';

  const buttonStyle = (bgColor: string): React.CSSProperties => ({
    padding: '12px 24px',
    fontSize: '14px',
    backgroundColor: bgColor,
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'opacity 0.2s',
  });

  const previewListStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: theme.surface,
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    flex: '1 1 0'
  };

  const selectedItemBackground = currentTheme === 'dark'
    ? theme.background
    : 'rgba(255, 140, 0, 0.1)';
  const hoverItemBackground = currentTheme === 'dark'
    ? '#1e1e1e'
    : 'rgba(0, 0, 0, 0.05)';

  const tabContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: `2px solid ${theme.border}`
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: isActive ? theme.surface : 'transparent',
    color: isActive ? theme.primary : theme.text,
    border: 'none',
    borderBottom: isActive ? `3px solid ${theme.primary}` : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '-2px'
  });

  const cadastroSubmenuContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    backgroundColor: theme.surface,
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    padding: '8px',
    alignSelf: 'flex-start'
  };

  const cadastroSubmenuButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '10px 18px',
    borderRadius: '8px',
    border: `1px solid ${isActive ? theme.primary : theme.border}`,
    backgroundColor: isActive ? (currentTheme === 'dark' ? theme.primary : '#e0f2f1') : theme.surface,
    color: isActive ? (currentTheme === 'dark' ? '#ffffff' : theme.primary) : theme.text,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    transition: 'all 0.2s',
    boxShadow: isActive ? `0 0 0 3px ${theme.primary}22` : 'none'
  });

  const submenuCadastroOptions: Array<{ id: 'livro' | 'classificador'; label: string; icon: string }> = [
    { id: 'livro', label: 'Lombada de Livros', icon: '📚' },
    { id: 'classificador', label: 'Lombada de Classificador', icon: '🗂️' }
  ];

  const [mostrarMedidas, setMostrarMedidas] = useState(false);

  const renderPreview = () => {
    if (lombadaSelecionada === null || !lombadas[lombadaSelecionada]) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: theme.textSecondary,
          fontSize: '16px'
        }}>
          👆 Clique em uma lombada abaixo para visualizar
        </div>
      );
    }

    const lombadaAtual = lombadas[lombadaSelecionada];
    const logoAtual = lombadaAtual.logo || logo;
    const layoutConfig = obterLayoutParaLombada(lombadaAtual);
    const layoutDados = calcularLayoutDados(layoutConfig);
    const logoEscalaPercent = Number.isFinite(layoutConfig.logoEscala) ? Number(layoutConfig.logoEscala) : 100;
    const previewBorder = layoutDados.bordaAtiva ? `2px solid ${theme.border}` : 'none';
    const previewShadow = layoutDados.bordaAtiva ? '0 12px 28px rgba(0,0,0,0.18)' : 'none';

    const dataInicioFormatada = new Date(lombadaAtual.dataInicio).toLocaleDateString('pt-BR');
    const dataFimFormatada = new Date(lombadaAtual.dataFim).toLocaleDateString('pt-BR');

    const metrics = [
      {
        label: 'Altura (mm)',
        values: [
          `Logo: ${formatTwoDecimalsTruncated(layoutDados.heightsMm.logo)}`,
          `Letra: ${formatTwoDecimalsTruncated(layoutDados.heightsMm.letra)}`,
          `Número: ${formatTwoDecimalsTruncated(layoutDados.heightsMm.numero)}`,
          `Datas: ${formatTwoDecimalsTruncated(layoutDados.heightsMm.datas)}`
        ]
      },
      {
        label: 'Logo (%)',
        values: [`${Math.trunc(logoEscalaPercent)}%`]
      },
      {
        label: 'Offsets (mm)',
        values: [
          `Logo: ${formatTwoDecimalsTruncated(layoutConfig.offsetLogo ?? 0)}`,
          `Letra: ${formatTwoDecimalsTruncated(layoutConfig.offsetLetra ?? 0)}`,
          `Número: ${formatTwoDecimalsTruncated(layoutConfig.offsetNumero ?? 0)}`,
          `Datas: ${formatTwoDecimalsTruncated(layoutConfig.offsetDatas ?? 0)}`
        ]
      },
      {
        label: 'Borda',
        values: [
          layoutDados.bordaAtiva ? (layoutDados.bordaQuadrada ? 'Sim (Quadrada)' : 'Sim (Arredondada)') : 'Não'
        ]
      },
      {
        label: 'Largura (mm)',
        values: [
          `Logo: ${formatTwoDecimalsTruncated(layoutDados.widthsMm.logo)}`,
          `Letra: ${formatTwoDecimalsTruncated(layoutDados.widthsMm.letra)}`,
          `Número: ${formatTwoDecimalsTruncated(layoutDados.widthsMm.numero)}`,
          `Datas: ${formatTwoDecimalsTruncated(layoutDados.widthsMm.datas)}`
        ]
      }
    ];

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          width: '100%'
        }}
      >
        <div
          style={{
            width: `${previewContainerWidth}px`,
            height: `${previewContainerHeight}px`,
            backgroundColor: '#ffffff',
            border: previewBorder,
            borderRadius: layoutDados.bordaQuadrada ? '0px' : '18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: `${PREVIEW_PADDING}px`,
            boxShadow: previewShadow,
            gap: `${previewGapPx}px`
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: `${layoutDados.previewWidths.logo}px`,
              height: `${layoutDados.previewHeights.logo}px`,
              transform: `translateY(${layoutDados.previewOffsets.logo}px)`
            }}
          >
            {logoAtual ? (
              <img
                src={logoAtual}
                alt="Logo da lombada"
                style={{
                  width: `${layoutDados.previewWidths.logo}px`,
                  height: `${layoutDados.previewHeights.logo}px`,
                  objectFit: 'contain'
                }}
              />
            ) : null}
          </div>

          <div
            style={{
              height: `${layoutDados.previewHeights.letra}px`,
              width: '100%',
              maxWidth: `${layoutDados.previewWidths.letra}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontFamily: '"Arial Black", Arial, sans-serif',
              color: '#000',
              transform: `translateY(${layoutDados.previewOffsets.letra}px)`
            }}
          >
            {(() => {
              const letra = lombadaAtual.letra || '—';
              const parts =
                letra === 'Livro de Transporte'
                  ? ['Livro de', 'Transporte']
                  : [letra];
              const perLineFontSize =
                layoutDados.previewLetterFontSize / Math.max(parts.length, 1);

              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    width: '100%',
                    textAlign: 'center',
                    gap: parts.length > 1 ? `${previewGapPx * 0.1}px` : 0
                  }}
                >
                  {parts.map((part, index) => (
                    <span
                      key={`preview-letter-part-${index}`}
                      style={{
                        fontSize: `${perLineFontSize}px`,
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                        margin: 0
                      }}
                    >
                      {part}
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>

          {(() => {
            const letraAtual = lombadaAtual.letra || '';
            const numeroAtual = lombadaAtual.numero || '—';
            const isLivroTransporte = letraAtual === 'Livro de Transporte';

            return (
              <div
                style={{
                  height: `${layoutDados.previewHeights.numero}px`,
                  width: '100%',
                  maxWidth: `${layoutDados.previewWidths.numero}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isLivroTransporte ? `${previewGapPx * 0.3}px` : 0,
                  fontWeight: 900,
                  fontFamily: '"Arial Black", Arial, sans-serif',
                  fontSize: `${layoutDados.previewNumberFontSize}px`,
                  color: '#000',
                  lineHeight: 1,
                  transform: `translateY(${layoutDados.previewOffsets.numero}px)`
                }}
              >
                {isLivroTransporte ? (
                  <>
                    <span style={{ fontSize: `${layoutDados.previewNumberFontSize * 0.75}px` }}>nº</span>
                    <span>{numeroAtual}</span>
                  </>
                ) : (
                  numeroAtual
                )}
              </div>
            );
          })()}

          <div
            style={{
              height: `${layoutDados.previewHeights.datas}px`,
              width: '100%',
              maxWidth: `${layoutDados.previewWidths.datas}px`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: `${previewGapPx * 0.4}px`,
              fontWeight: 700,
              fontSize: `${layoutDados.previewDatesFontSize}px`,
              color: '#000',
              lineHeight: 1.1,
            textAlign: 'center',
            transform: `translateY(${layoutDados.previewOffsets.datas}px)`
            }}
          >
            <span>{dataInicioFormatada}</span>
            <span style={{ fontSize: `${layoutDados.previewDatesSeparatorSize}px` }}>a</span>
            <span>{dataFimFormatada}</span>
          </div>
        </div>
        <div
          style={{
            width: `${previewContainerWidth}px`,
            display: 'flex',
            justifyContent: 'center',
            marginTop: '8px'
          }}
        >
          <button
            type="button"
            onClick={() => setMostrarMedidas(true)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.surface,
              color: theme.text,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverItemBackground)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = theme.surface)}
          >
            Medidas
          </button>
        </div>

        {mostrarMedidas && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
            onClick={() => setMostrarMedidas(false)}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: Math.min(previewContainerWidth, 360),
                maxWidth: '90vw',
                backgroundColor: theme.surface,
                color: theme.text,
                borderRadius: '10px',
                padding: '18px 20px',
                boxShadow: '0 22px 48px rgba(0,0,0,0.35)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '14px', letterSpacing: '0.5px' }}>Medidas da Lombada</h4>
                <button
                  type="button"
                  onClick={() => setMostrarMedidas(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme.textSecondary,
                    fontSize: '18px',
                    cursor: 'pointer',
                    lineHeight: 1
                  }}
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                {metrics.map((row) => (
                  <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600, color: theme.text }}>{row.label}</span>
                    <span style={{ color: theme.textSecondary, lineHeight: 1.4 }}>{row.values.join(' • ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const tituloJanela = submenuCadastro === 'classificador'
    ? 'Criação de Lombadas de Classificador'
    : 'Criação de Lombadas de Livros';

  const renderLista = () => (
    <div style={previewListStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <h3 style={{ color: theme.text, margin: 0 }}>📚 Lombadas Criadas ({lombadas.length})</h3>
        {selectionMode && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#2ec4b6' }}>
              Modo seleção múltipla ativo
            </span>
            <button
              type="button"
              onClick={exitSelectionMode}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                border: '1px solid #2ec4b6',
                backgroundColor: '#d7f8f4',
                color: '#087a6d',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Sair do modo seleção
            </button>
          </div>
        )}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: lombadas.length > 4 ? '360px' : 'none',
        overflowY: lombadas.length > 4 ? 'auto' : 'visible',
        paddingRight: lombadas.length > 4 ? '6px' : 0
      }}>
        {lombadas.map((lombada, index) => {
          const isSelected = selectionMode
            ? selectedIndices.includes(index)
            : lombadaSelecionada === index;
          const borderColor = selectionMode
            ? isSelected
              ? '#2ec4b6'
              : theme.border
            : isSelected
              ? theme.primary
              : theme.border;
          const backgroundColor = selectionMode
            ? isSelected
              ? '#d7f8f4'
              : theme.surface
            : isSelected
              ? selectedItemBackground
              : theme.surface;
          const hoverColor = selectionMode ? '#e9fffb' : hoverItemBackground;

          return (
            <div 
              key={index} 
              onClick={(e) => handleItemClick(e, index)}
              onDoubleClick={() => handleItemDoubleClick(index)}
              style={{
                padding: '12px 16px',
                border: `2px solid ${borderColor}`,
                borderRadius: '8px',
                backgroundColor,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                boxShadow: isSelected && !selectionMode ? `0 0 0 3px ${theme.primary}33` : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = hoverColor;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = backgroundColor;
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flex: 1
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: theme.text,
                  minWidth: '80px'
                }}>
                  {lombada.letra} {lombada.numero}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  flex: 1
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: theme.text
                  }}>
                    {lombada.tipoLivro}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.textSecondary
                  }}>
                    {new Date(lombada.dataInicio).toLocaleDateString('pt-BR')} a {new Date(lombada.dataFim).toLocaleDateString('pt-BR')}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: theme.primary,
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {lombada.contexto === 'classificador' ? 'Lombada de Classificador' : 'Lombada de Livros'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    editarLombada(index);
                  }} 
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: theme.accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    removerLombada(index);
                  }} 
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    backgroundColor: theme.error,
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const formWrapperStyle: React.CSSProperties = {
    backgroundColor: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '20px'
  };

  return (
    <BasePage
      title={tituloJanela}
      onClose={onClose}
      width="1200px"
      height="820px"
      resizable={false}
      headerColor={headerColor}
    >
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Abas */}
          <div style={tabContainerStyle}>
            <button 
              style={tabStyle(abaAtiva === 'cadastro')}
              onClick={() => setAbaAtiva('cadastro')}
            >
              📝 Cadastro
            </button>
            <button 
              style={tabStyle(abaAtiva === 'impressao')}
              onClick={() => setAbaAtiva('impressao')}
            >
              🖨️ Impressão
            </button>
          </div>

          {/* Conteúdo da aba Cadastro */}
          {abaAtiva === 'cadastro' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={cadastroSubmenuContainerStyle}>
                {submenuCadastroOptions.map((opcao) => (
                  <button
                    key={opcao.id}
                    style={cadastroSubmenuButtonStyle(submenuCadastro === opcao.id)}
                    onClick={() => selecionarSubmenu(opcao.id)}
                    onMouseEnter={(e) => {
                      if (submenuCadastro !== opcao.id) {
                        e.currentTarget.style.backgroundColor = currentTheme === 'dark' ? theme.background : '#f3f7f7';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (submenuCadastro !== opcao.id) {
                        e.currentTarget.style.backgroundColor = theme.surface;
                      }
                    }}
                  >
                    {opcao.icon} {opcao.label}
                  </button>
                ))}
              </div>
              <div style={formWrapperStyle}>
                <div style={formGridStyle}>
          {/* Código (Somente Leitura) */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 1' }}>
            <label style={labelStyle}>🔒 Código:</label>
            <input
              type="text"
              value={formData.codigo}
              readOnly
              disabled
              style={{
                ...inputStyle,
                backgroundColor: theme.surface,
                cursor: 'not-allowed',
                fontWeight: 'bold',
                color: theme.primary,
                border: `2px solid ${theme.primary}`
              }}
              title="Código gerado automaticamente - não editável"
            />
          </div>

          {/* Tipo de Livro */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 1' }}>
            <label style={labelStyle}>Tipo de Livro:</label>
            <select
              name="tipoLivro"
              value={formData.tipoLivro}
              onChange={handleInputChange}
              style={selectStyle}
            >
              <option value="">Selecione...</option>
              {tiposLivro.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Letra */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 1' }}>
            <label style={labelStyle}>Letra / Nomenclatura:</label>
            <select
              name="letra"
              value={formData.letra}
              onChange={handleInputChange}
              style={selectStyle}
              disabled={letrasDisponiveis.length === 0}
            >
              <option value="">Selecione...</option>
              {letrasDisponiveis.map((letraOpt) => (
                <option key={letraOpt} value={letraOpt}>{letraOpt}</option>
              ))}
            </select>
          </div>

          {/* Número */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 1' }}>
            <label style={labelStyle}>Número: *</label>
            <input
              type="text"
              name="numero"
              value={formData.numero}
              onChange={handleInputChange}
              style={inputStyle}
              placeholder="383, 607..."
            />
          </div>

          {/* Data Início */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Data Início: *</label>
            <input
              type="date"
              name="dataInicio"
              value={formData.dataInicio}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>

          {/* Data Fim */}
          <div style={{ ...fieldContainerStyle, gridColumn: 'span 2' }}>
            <label style={labelStyle}>Data Fim: *</label>
            <input
              type="date"
              name="dataFim"
              value={formData.dataFim}
              onChange={handleInputChange}
              style={inputStyle}
            />
          </div>
        </div>

            <div style={buttonContainerStyle}>
              <button onClick={adicionarLombada} style={buttonStyle(theme.success)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                {modoEdicao ? '💾 Salvar Alterações' : '📝 Gerar Lombada'}
              </button>
              <button onClick={() => {
                limparFormulario();
                setModoEdicao(false);
                setLombadaSelecionada(null);
              }} style={buttonStyle(theme.border)}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Limpar Formulário
              </button>
            </div>
            </div>
          </div>
        )}

        {/* Conteúdo da aba Impressão */}
          {abaAtiva === 'impressao' && (
            <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '20px', alignItems: 'stretch' }}>
              {lombadas.length > 0 ? (
                <>
                  <div style={{
                    flex: '0 0 360px',
                    minWidth: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    minHeight: 0
                  }}>
                    <div style={{
                      padding: '20px',
                      backgroundColor: theme.surface,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      flex: 1,
                      minHeight: 0
                    }}>
                      <h3 style={{ color: theme.text, marginBottom: '15px', textAlign: 'center' }}>
                        📋 Preview da Lombada{previewLabel}
                      </h3>
                      <div style={{ display: 'flex', justifyContent: 'center', flex: 1, minHeight: 0 }}>
                        {renderPreview()}
                      </div>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: '320px', minHeight: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {renderLista()}
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handlePrintClick();
                      }} 
                      style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: theme.accent,
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'opacity 0.2s',
                        boxShadow: cardShadow
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.85';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      🖨️ Imprimir Lombada
                    </button>
                  </div>
                </>
              ) : (
              <div style={{ 
                textAlign: 'center', 
                  margin: 'auto',
                color: theme.text,
                fontSize: '16px'
              }}>
                <p>📚 Nenhuma lombada cadastrada ainda.</p>
                <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
                  Vá para a aba "Cadastro" para gerar lombadas.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      </div>

      {/* Área de Impressão (oculta mas renderizada) */}
      <div style={{ 
        position: 'absolute',
        left: '-9999px',
        top: 0
      }}>
        <div ref={printRef}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: `${printGapPx * 2}px`,
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#f5f7f7'
          }}>
            {lombadasParaImpressao.map((lombada, index) => {
              const larguraPx = Math.max(larguraLombada, 0.1) * MM_TO_PX;
              const alturaPx = Math.max(alturaLombada, 0.1) * MM_TO_PX;
              const logoImpressao = lombada.logo || logo;
              const dataInicioFormatada = new Date(lombada.dataInicio).toLocaleDateString('pt-BR');
              const dataFimFormatada = new Date(lombada.dataFim).toLocaleDateString('pt-BR');
              const layoutConfig = obterLayoutParaLombada(lombada);
              const layoutDados = calcularLayoutDados(layoutConfig);

              return (
              <div
                key={index}
                style={{
                  width: `${larguraPx}px`,
                  height: `${alturaPx}px`,
                  borderRadius: layoutDados.bordaQuadrada ? '0px' : '18px',
                  backgroundColor: '#ffffff',
                  pageBreakInside: 'avoid',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: `${printGapPx}px`,
                  padding: '0',
                  boxShadow: layoutDados.bordaAtiva ? '0 10px 28px rgba(0,0,0,0.22)' : 'none',
                  border: layoutDados.bordaAtiva ? '2px solid #000' : 'none'
                }}
              >
                {/* Logo */}
                <div
                  style={{
                    height: `${layoutDados.printHeightsPx.logo}px`,
                    width: `${layoutDados.printWidthsPx.logo}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: `translateY(${layoutDados.printOffsets.logo}px)`
                  }}
                >
                  {logoImpressao ? (
                    <img src={logoImpressao} alt="Logo" style={{
                      width: `${layoutDados.printWidthsPx.logo}px`,
                      height: `${layoutDados.printHeightsPx.logo}px`,
                      objectFit: 'contain'
                    }} />
                  ) : null}
                </div>

                {/* Letra */}
                <div
                  style={{
                    height: `${layoutDados.printHeightsPx.letra}px`,
                    width: '100%',
                    maxWidth: `${layoutDados.printWidthsPx.letra}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontFamily: '"Arial Black", Arial, sans-serif',
                    color: '#000',
                    textTransform: 'uppercase',
                    transform: `translateY(${layoutDados.printOffsets.letra}px)`
                  }}
                >
                  {(() => {
                    const letra = lombada.letra || '—';
                    const parts =
                      letra === 'Livro de Transporte'
                        ? ['Livro de', 'Transporte']
                        : [letra];
                    const perLineFontPx =
                      layoutDados.printLetterFontPx / Math.max(parts.length, 1);

                    return (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          width: '100%',
                          textAlign: 'center',
                          gap: parts.length > 1 ? `${printGapPx * 0.2}px` : 0
                        }}
                      >
                        {parts.map((part, index) => (
                          <span
                            key={`print-letter-part-${index}`}
                            style={{
                              fontSize: `${perLineFontPx}px`,
                              lineHeight: 1,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {part}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Número */}
                {(() => {
                  const letraAtual = lombada.letra || '';
                  const numeroAtual = lombada.numero || '—';
                  const isLivroTransporte = letraAtual === 'Livro de Transporte';

                  return (
                    <div
                      style={{
                        height: `${layoutDados.printHeightsPx.numero}px`,
                        width: '100%',
                        maxWidth: `${layoutDados.printWidthsPx.numero}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isLivroTransporte ? `${printGapPx * 0.4}px` : 0,
                        fontSize: `${layoutDados.printNumberFontPx}px`,
                        fontWeight: 900,
                        fontFamily: '"Arial Black", Arial, sans-serif',
                        color: '#000',
                        lineHeight: 1,
                        transform: `translateY(${layoutDados.printOffsets.numero}px)`
                      }}
                    >
                      {isLivroTransporte ? (
                        <>
                          <span style={{ fontSize: `${layoutDados.printNumberFontPx * 0.75}px` }}>nº</span>
                          <span>{numeroAtual}</span>
                        </>
                      ) : (
                        numeroAtual
                      )}
                    </div>
                  );
                })()}

                {/* Datas */}
                <div
                  style={{
                    height: `${layoutDados.printHeightsPx.datas}px`,
                    width: '100%',
                    maxWidth: `${layoutDados.printWidthsPx.datas}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: `${printGapPx * 0.4}px`,
                    fontSize: `${layoutDados.printDatesFontPx}px`,
                    fontWeight: 700,
                    color: '#000',
                    textAlign: 'center',
                    lineHeight: 1.1,
                    transform: `translateY(${layoutDados.printOffsets.datas}px)`
                  }}
                >
                  <span>{dataInicioFormatada}</span>
                  <span style={{ fontSize: `${layoutDados.printDatesSeparatorFontPx}px` }}>a</span>
                  <span>{dataFimFormatada}</span>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </BasePage>
  );
}