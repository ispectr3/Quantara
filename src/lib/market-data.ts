export const ibovSeries = [
  { t: "09:30", v: 128450 }, { t: "10:00", v: 128720 }, { t: "10:30", v: 129100 },
  { t: "11:00", v: 128980 }, { t: "11:30", v: 129350 }, { t: "12:00", v: 129610 },
  { t: "13:00", v: 129420 }, { t: "13:30", v: 129880 }, { t: "14:00", v: 130120 },
  { t: "14:30", v: 130045 }, { t: "15:00", v: 130410 }, { t: "15:30", v: 130680 },
  { t: "16:00", v: 130520 }, { t: "16:30", v: 130910 }, { t: "17:00", v: 131240 },
];

export const indices = [
  { name: "IBOVESPA", value: "131.240", delta: 1.42, neg: false },
  { name: "S&P 500", value: "5.892", delta: 0.38, neg: false },
  { name: "DÓLAR", value: "R$ 5,18", delta: -0.62, neg: true },
  { name: "DI Jan/27", value: "10,82%", delta: -0.04, neg: true },
  { name: "BITCOIN", value: "US$ 71.4k", delta: 2.18, neg: false },
];

export const topStocks = [
  { ticker: "PETR4", name: "Petrobras PN", price: 38.42, delta: 2.14, score: 87 },
  { ticker: "VALE3", name: "Vale ON", price: 64.18, delta: -0.82, score: 72 },
  { ticker: "ITUB4", name: "Itaú Unibanco", price: 33.91, delta: 1.05, score: 91 },
  { ticker: "BBAS3", name: "Banco do Brasil", price: 28.74, delta: 0.92, score: 84 },
  { ticker: "WEGE3", name: "WEG ON", price: 52.30, delta: 1.68, score: 89 },
  { ticker: "MGLU3", name: "Magalu", price: 10.42, delta: -2.41, score: 48 },
  { ticker: "BBDC4", name: "Bradesco PN", price: 14.62, delta: 0.41, score: 76 },
  { ticker: "B3SA3", name: "B3 ON", price: 11.85, delta: 1.22, score: 82 },
  { ticker: "RENT3", name: "Localiza ON", price: 48.91, delta: -0.34, score: 78 },
  { ticker: "EQTL3", name: "Equatorial ON", price: 36.20, delta: 0.85, score: 85 },
  { ticker: "SUZB3", name: "Suzano ON", price: 58.10, delta: 1.92, score: 80 },
  { ticker: "ELET3", name: "Eletrobras ON", price: 42.55, delta: 0.62, score: 81 },
  { ticker: "PRIO3", name: "PetroRio ON", price: 44.18, delta: 2.84, score: 86 },
  { ticker: "RADL3", name: "RaiaDrogasil", price: 24.10, delta: -1.12, score: 70 },
  { ticker: "HAPV3", name: "Hapvida ON", price: 4.21, delta: -3.42, score: 42 },
  { ticker: "TAEE11", name: "Taesa UNT", price: 35.40, delta: 0.18, score: 83 },
];

export type AssetClass =
  | "Ações"
  | "Renda Fixa"
  | "Multimercado"
  | "Mundo"
  | "Alternativos"
  | "Previdência";

export type BankCategory =
  | "Equity Brasil"
  | "Dividendos"
  | "Multimercados"
  | "Previdência"
  | "Patrimônio Offshore"
  | "Alocação Global"
  | "Long Biased"
  | "ESG Europa"
  | "Alternativos";

export const focusCategories: BankCategory[] = [
  "Equity Brasil",
  "Dividendos",
  "Multimercados",
  "Previdência",
  "Patrimônio Offshore",
  "Alocação Global",
  "Long Biased",
  "ESG Europa",
  "Alternativos",
];

export type BankAllocation = {
  asset: string;
  weight: number; // %
  class: AssetClass;
  thesis: string;
};

export type BankPortfolio = {
  slug: string;
  bank: string;
  focus: string;
  category: BankCategory;
  score: number;
  picks: string[];
  note: string;
  minTicket: string;
  horizon: string;
  expectedReturn: string;
  riskLevel: "Conservador" | "Moderado" | "Arrojado" | "Agressivo";
  allocation: BankAllocation[];
};

export const bankPortfolios: BankPortfolio[] = [
  // ===== Equity Brasil =====
  {
    slug: "equity-xp", bank: "XP Investimentos", focus: "Equity Brasil", category: "Equity Brasil", score: 8.6,
    picks: ["ITUB4", "PETR4", "EQTL3", "RENT3", "WEGE3"],
    note: "Carteira top picks Brasil, bancos e utilities com gatilhos de crescimento.",
    minTicket: "R$ 50.000", horizon: "3 a 5 anos", expectedReturn: "CDI + 6% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "ITUB4, Itaú Unibanco", weight: 22, class: "Ações", thesis: "ROE consistente acima de 20% e desconto vs. pares." },
      { asset: "PETR4, Petrobras", weight: 20, class: "Ações", thesis: "Dividend yield duplo dígito e disciplina de capex." },
      { asset: "EQTL3, Equatorial", weight: 18, class: "Ações", thesis: "Crescimento via M&A em saneamento e energia." },
      { asset: "RENT3, Localiza", weight: 15, class: "Ações", thesis: "Líder em mobilidade com poder de pricing." },
      { asset: "WEGE3, WEG", weight: 15, class: "Ações", thesis: "Exportadora industrial com tese de eletrificação global." },
      { asset: "Caixa / CDI", weight: 10, class: "Renda Fixa", thesis: "Liquidez para janelas de compra." },
    ],
  },
  {
    slug: "equity-btg", bank: "BTG Pactual", focus: "Equity Brasil", category: "Equity Brasil", score: 8.8,
    picks: ["PETR4", "ITUB4", "VALE3", "PRIO3", "SUZB3"],
    note: "Top picks BTG Research, banker driven, alta convicção e giro tático.",
    minTicket: "R$ 100.000", horizon: "3 a 5 anos", expectedReturn: "Ibov + 4% a.a.", riskLevel: "Arrojado",
    allocation: [
      { asset: "PETR4, Petrobras", weight: 22, class: "Ações", thesis: "Caixa alto e dividendos extraordinários." },
      { asset: "ITUB4, Itaú Unibanco", weight: 20, class: "Ações", thesis: "ROE líder e custo de risco controlado." },
      { asset: "VALE3, Vale", weight: 18, class: "Ações", thesis: "Preço de minério estável e disciplina de capex." },
      { asset: "PRIO3, PetroRio", weight: 15, class: "Ações", thesis: "Crescimento via aquisições e lifting cost baixo." },
      { asset: "SUZB3, Suzano", weight: 15, class: "Ações", thesis: "Exportadora dolarizada com ciclo de celulose." },
      { asset: "Caixa CDI", weight: 10, class: "Renda Fixa", thesis: "Pólvora tática." },
    ],
  },

  // ===== Dividendos =====
  {
    slug: "dividendos-inter", bank: "Inter Invest", focus: "Dividendos", category: "Dividendos", score: 8.0,
    picks: ["BBAS3", "TAEE11", "ISAE4", "CMIG4", "CPLE6"],
    note: "Carteira de yield consistente acima de 8% a.a.",
    minTicket: "R$ 10.000", horizon: "5+ anos", expectedReturn: "DY 8% + valorização", riskLevel: "Moderado",
    allocation: [
      { asset: "BBAS3, Banco do Brasil", weight: 22, class: "Ações", thesis: "Payout elevado e múltiplos descontados." },
      { asset: "TAEE11, Taesa", weight: 20, class: "Ações", thesis: "Transmissão regulada, fluxo previsível." },
      { asset: "ISAE4, ISA Energia", weight: 18, class: "Ações", thesis: "Yield estável em transmissão." },
      { asset: "CMIG4, Cemig", weight: 15, class: "Ações", thesis: "Reestruturação com dividendos extraordinários." },
      { asset: "CPLE6, Copel", weight: 15, class: "Ações", thesis: "Privatização destravando valor." },
      { asset: "Caixa", weight: 10, class: "Renda Fixa", thesis: "Liquidez tática." },
    ],
  },
  {
    slug: "dividendos-bb-private", bank: "BB Private", focus: "Dividendos", category: "Dividendos", score: 8.2,
    picks: ["BBSE3", "PETR4", "TAEE11", "VIVT3", "SAPR11"],
    note: "Seleção BB Private com foco em renda recorrente em reais.",
    minTicket: "R$ 50.000", horizon: "5+ anos", expectedReturn: "DY 9% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "BBSE3, BB Seguridade", weight: 22, class: "Ações", thesis: "Payout elevado e ROE alto." },
      { asset: "PETR4, Petrobras", weight: 20, class: "Ações", thesis: "Dividendos extraordinários e disciplina de capex." },
      { asset: "TAEE11, Taesa", weight: 18, class: "Ações", thesis: "Fluxo regulado em transmissão." },
      { asset: "VIVT3, Vivo", weight: 15, class: "Ações", thesis: "Geração de caixa em telecom." },
      { asset: "SAPR11, Sanepar", weight: 15, class: "Ações", thesis: "Saneamento regulado com yield consistente." },
      { asset: "LCI BB IPCA+", weight: 10, class: "Renda Fixa", thesis: "Renda isenta complementar." },
    ],
  },

  // ===== Multimercados =====
  {
    slug: "multimercado-itau", bank: "Itaú Private Bank", focus: "Multimercados", category: "Multimercados", score: 8.2,
    picks: ["Verde AM Master", "SPX Nimitz", "Kapitalo K10"],
    note: "Diversificação macro com gestores de primeira linha.",
    minTicket: "R$ 250.000", horizon: "3 a 5 anos", expectedReturn: "CDI + 4% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "Verde AM Master", weight: 30, class: "Multimercado", thesis: "Macro com viés global, baixa volatilidade." },
      { asset: "SPX Nimitz", weight: 25, class: "Multimercado", thesis: "Multi-estratégia consistente em ciclos." },
      { asset: "Kapitalo K10", weight: 20, class: "Multimercado", thesis: "Macro arrojado com hedge cambial." },
      { asset: "Tesouro Selic", weight: 15, class: "Renda Fixa", thesis: "Caixa estratégico." },
      { asset: "Fundo de inflação longo", weight: 10, class: "Renda Fixa", thesis: "Proteção real." },
    ],
  },
  {
    slug: "multimercado-btg", bank: "BTG Pactual", focus: "Multimercados", category: "Multimercados", score: 8.9,
    picks: ["Adam Macro", "Legacy Capital", "Vista Multiestratégia"],
    note: "Plataforma BTG com gestoras independentes referência em macro.",
    minTicket: "R$ 100.000", horizon: "3 a 5 anos", expectedReturn: "CDI + 5% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "Adam Macro", weight: 30, class: "Multimercado", thesis: "Macro global com histórico consistente." },
      { asset: "Legacy Capital", weight: 25, class: "Multimercado", thesis: "Risk parity ajustado ao Brasil." },
      { asset: "Vista Multiestratégia", weight: 20, class: "Multimercado", thesis: "Multi-book com book de juros forte." },
      { asset: "BTG Tesouro Selic FI", weight: 15, class: "Renda Fixa", thesis: "Caixa CDI." },
      { asset: "Fundo de inflação", weight: 10, class: "Renda Fixa", thesis: "Hedge real." },
    ],
  },

  // ===== Previdência =====
  {
    slug: "previdencia-safra", bank: "Safra Private", focus: "Previdência", category: "Previdência", score: 8.4,
    picks: ["VGBL Conservador", "PGBL Moderado", "VGBL Multimercado"],
    note: "Alocação eficiente para horizonte de longo prazo.",
    minTicket: "R$ 100.000", horizon: "10+ anos", expectedReturn: "CDI + 3% a.a.", riskLevel: "Conservador",
    allocation: [
      { asset: "VGBL Safra Conservador", weight: 40, class: "Previdência", thesis: "Tributação regressiva, base estável." },
      { asset: "PGBL Safra Moderado", weight: 25, class: "Previdência", thesis: "Dedução IR até 12% renda bruta." },
      { asset: "VGBL Multimercado", weight: 20, class: "Previdência", thesis: "Diversificação com gestores ativos." },
      { asset: "VGBL Ações", weight: 15, class: "Previdência", thesis: "Crescimento de longo prazo." },
    ],
  },
  {
    slug: "previdencia-bradesco-private", bank: "Bradesco Private Bank", focus: "Previdência", category: "Previdência", score: 8.5,
    picks: ["VGBL Multigestor", "PGBL Composto", "VGBL Ações Long Only"],
    note: "Bradesco Private estrutura previdência sucessória com gestão ativa.",
    minTicket: "R$ 200.000", horizon: "10+ anos", expectedReturn: "CDI + 3,5% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "VGBL Bradesco Multigestor", weight: 35, class: "Previdência", thesis: "Multiestratégia com gestores selecionados." },
      { asset: "PGBL Bradesco Composto", weight: 25, class: "Previdência", thesis: "Mix renda fixa e equities, eficiência tributária." },
      { asset: "VGBL Long Only Ações", weight: 25, class: "Previdência", thesis: "Equity Brasil para horizonte longo." },
      { asset: "VGBL Crédito Privado IPCA", weight: 15, class: "Previdência", thesis: "Carrego real isento." },
    ],
  },

  // ===== Patrimônio Offshore =====
  {
    slug: "offshore-julius-baer", bank: "Julius Baer", focus: "Patrimônio Offshore", category: "Patrimônio Offshore", score: 9.0,
    picks: ["Bonds IG USD", "Hedge Funds Multistrategy", "Private Equity FoF"],
    note: "Estrutura offshore suíça para preservação patrimonial.",
    minTicket: "US$ 1.000.000", horizon: "10+ anos", expectedReturn: "USD + 6% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "Bonds IG USD", weight: 35, class: "Renda Fixa", thesis: "Carrego em dólar com baixo risco de crédito." },
      { asset: "Hedge Funds Multistrategy", weight: 25, class: "Alternativos", thesis: "Retorno descorrelacionado." },
      { asset: "Private Equity FoF", weight: 20, class: "Alternativos", thesis: "Prêmio de iliquidez de longo prazo." },
      { asset: "Equities Global Quality", weight: 15, class: "Mundo", thesis: "Compounders globais." },
      { asset: "Gold / Commodities", weight: 5, class: "Alternativos", thesis: "Proteção contra inflação." },
    ],
  },
  {
    slug: "offshore-jpmorgan", bank: "J.P. Morgan Private Bank", focus: "Patrimônio Offshore", category: "Patrimônio Offshore", score: 9.3,
    picks: ["US Treasury 10Y", "ETF VTI", "Berkshire BRK.B", "Hedge Funds"],
    note: "Plataforma global referência em wealth para famílias UHNW.",
    minTicket: "US$ 5.000.000", horizon: "10+ anos", expectedReturn: "USD + 7% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "ETF VTI, US Total Market", weight: 28, class: "Mundo", thesis: "Beta amplo da economia americana." },
      { asset: "US Treasury 10Y", weight: 25, class: "Renda Fixa", thesis: "Núcleo soberano em USD." },
      { asset: "Hedge Funds JPM Access", weight: 18, class: "Alternativos", thesis: "Multi-manager curado." },
      { asset: "Berkshire BRK.B", weight: 14, class: "Mundo", thesis: "Compounder de qualidade." },
      { asset: "Private Credit Fund", weight: 10, class: "Alternativos", thesis: "Yield acima de IG público." },
      { asset: "Gold ETF (GLD)", weight: 5, class: "Alternativos", thesis: "Hedge geopolítico." },
    ],
  },

  // ===== Alocação Global =====
  {
    slug: "global-ubs", bank: "UBS Brasil", focus: "Alocação Global", category: "Alocação Global", score: 8.8,
    picks: ["UBS Global Allocation", "ETF MSCI World", "Bonds IG", "Gold ETF"],
    note: "Carteira balanceada multi-currency com ouro.",
    minTicket: "US$ 500.000", horizon: "5+ anos", expectedReturn: "USD + 6,5% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "UBS Global Allocation Fund", weight: 35, class: "Mundo", thesis: "Multiasset balanceado." },
      { asset: "ETF MSCI World (URTH)", weight: 25, class: "Mundo", thesis: "Beta global desenvolvido." },
      { asset: "Bonds Investment Grade", weight: 20, class: "Renda Fixa", thesis: "Renda em USD." },
      { asset: "Gold ETF (IAU)", weight: 10, class: "Alternativos", thesis: "Hedge inflacionário." },
      { asset: "Caixa USD", weight: 10, class: "Renda Fixa", thesis: "Liquidez em dólar." },
    ],
  },
  {
    slug: "global-santander", bank: "Santander Private", focus: "Alocação Global", category: "Alocação Global", score: 8.1,
    picks: ["IVVB11", "BDR AAPL34", "BDR MSFT34", "Bonds IG"],
    note: "Carteira global Santander com núcleo S&P 500 e BDRs de qualidade.",
    minTicket: "R$ 300.000", horizon: "5+ anos", expectedReturn: "USD + 8% a.a.", riskLevel: "Arrojado",
    allocation: [
      { asset: "IVVB11, S&P 500", weight: 35, class: "Mundo", thesis: "Núcleo passivo de equities EUA." },
      { asset: "AAPL34, Apple", weight: 18, class: "Mundo", thesis: "Caixa robusto, ecossistema premium." },
      { asset: "MSFT34, Microsoft", weight: 17, class: "Mundo", thesis: "Liderança em cloud e IA corporativa." },
      { asset: "NVDC34, NVIDIA", weight: 15, class: "Mundo", thesis: "Infraestrutura de IA." },
      { asset: "Bonds IG USD", weight: 15, class: "Renda Fixa", thesis: "Renda em dólar com baixo risco." },
    ],
  },
  {
    slug: "global-goldman", bank: "Goldman Sachs PWM", focus: "Alocação Global", category: "Alocação Global", score: 9.1,
    picks: ["ETF SPY", "Treasury 10Y", "Goldman Hedge Access", "Gold ETF"],
    note: "Plataforma Goldman Private Wealth, alocação global institucional para UHNW.",
    minTicket: "US$ 10.000.000", horizon: "10+ anos", expectedReturn: "USD + 7,5% a.a.", riskLevel: "Arrojado",
    allocation: [
      { asset: "ETF SPY, S&P 500", weight: 30, class: "Mundo", thesis: "Núcleo de equities EUA com custo mínimo." },
      { asset: "US Treasury 10Y", weight: 22, class: "Renda Fixa", thesis: "Soberano em USD para deslocamentos." },
      { asset: "Goldman Hedge Fund Access", weight: 20, class: "Alternativos", thesis: "Acesso a hedge funds top-tier com curadoria GS." },
      { asset: "Private Equity Vintage Fund", weight: 13, class: "Alternativos", thesis: "Prêmio de iliquidez em deals primários." },
      { asset: "Goldman Strategic Income", weight: 10, class: "Renda Fixa", thesis: "Crédito flexível global." },
      { asset: "Gold ETF (GLD)", weight: 5, class: "Alternativos", thesis: "Hedge macro e geopolítico." },
    ],
  },

  // ===== Long Biased =====
  {
    slug: "long-biased-hg", bank: "Credit Suisse Hedging-Griffo", focus: "Long Biased", category: "Long Biased", score: 8.5,
    picks: ["HG Brasil FIA", "Verde Scena", "Dynamo Cougar"],
    note: "Gestoras independentes de equities Brasil com book direcional.",
    minTicket: "R$ 100.000", horizon: "5+ anos", expectedReturn: "Ibov + 5% a.a.", riskLevel: "Arrojado",
    allocation: [
      { asset: "HG Brasil FIA", weight: 35, class: "Ações", thesis: "Stock picking de qualidade local." },
      { asset: "Verde Scena", weight: 25, class: "Ações", thesis: "Long-biased com hedge tático." },
      { asset: "Dynamo Cougar", weight: 25, class: "Ações", thesis: "Value investing referência." },
      { asset: "Caixa CDI", weight: 15, class: "Renda Fixa", thesis: "Pólvora para drawdowns." },
    ],
  },
  {
    slug: "long-biased-btg", bank: "BTG Pactual", focus: "Long Biased", category: "Long Biased", score: 8.6,
    picks: ["Absolute Pace LB", "Atmos Master", "Squadra Long Bias"],
    note: "Plataforma BTG com gestoras long biased premiadas em Brasil.",
    minTicket: "R$ 100.000", horizon: "5+ anos", expectedReturn: "Ibov + 6% a.a.", riskLevel: "Arrojado",
    allocation: [
      { asset: "Absolute Pace LB", weight: 30, class: "Ações", thesis: "Book direcional flexível Brasil." },
      { asset: "Atmos Master", weight: 25, class: "Ações", thesis: "Stock picking qualitativo." },
      { asset: "Squadra Long Bias", weight: 25, class: "Ações", thesis: "Concentração em alta convicção." },
      { asset: "BTG CDI", weight: 20, class: "Renda Fixa", thesis: "Caixa para janelas táticas." },
    ],
  },

  // ===== ESG Europa =====
  {
    slug: "esg-bnp", bank: "BNP Paribas Wealth", focus: "ESG Europa", category: "ESG Europa", score: 8.1,
    picks: ["ETF ESGV", "BDR ASML34", "BDR NESN34", "Green Bonds"],
    note: "Tese ESG europeia com large caps de alta qualidade.",
    minTicket: "EUR 250.000", horizon: "5+ anos", expectedReturn: "EUR + 5,5% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "ETF ESGV, US ESG", weight: 30, class: "Mundo", thesis: "Screen ESG sobre US equities." },
      { asset: "ASML34, ASML", weight: 20, class: "Mundo", thesis: "Monopólio em litografia EUV." },
      { asset: "NESN34, Nestlé", weight: 18, class: "Mundo", thesis: "Defensiva global, dividendos." },
      { asset: "ETF iShares Europe ESG", weight: 17, class: "Mundo", thesis: "Beta europeu sustentável." },
      { asset: "Green Bonds EUR", weight: 15, class: "Renda Fixa", thesis: "Dívida sustentável investment grade." },
    ],
  },
  {
    slug: "esg-julius-baer", bank: "Julius Baer", focus: "ESG Europa", category: "ESG Europa", score: 8.4,
    picks: ["JB Sustainable Equity", "MSCI Europe ESG", "Green Bonds EUR"],
    note: "Mandato ESG europeu Julius Baer com foco em transição energética.",
    minTicket: "EUR 500.000", horizon: "5+ anos", expectedReturn: "EUR + 6% a.a.", riskLevel: "Moderado",
    allocation: [
      { asset: "JB Sustainable Equity Europe", weight: 32, class: "Mundo", thesis: "Stock picking ESG europeu." },
      { asset: "MSCI Europe ESG Leaders", weight: 25, class: "Mundo", thesis: "Beta sustentável amplo." },
      { asset: "Green Bonds Sovereign EUR", weight: 20, class: "Renda Fixa", thesis: "Soberanos verdes core Europa." },
      { asset: "Clean Energy ETF", weight: 13, class: "Mundo", thesis: "Transição energética estrutural." },
      { asset: "Caixa EUR", weight: 10, class: "Renda Fixa", thesis: "Liquidez em euro." },
    ],
  },

  // ===== Alternativos =====
  {
    slug: "alt-blackstone", bank: "Blackstone", focus: "Alternativos", category: "Alternativos", score: 9.4,
    picks: ["BREIT, Real Estate Income", "BCRED, Private Credit", "BX Private Equity", "Infrastructure Fund"],
    note: "Maior gestora alternativa do mundo, referência em real estate, private credit e PE para UHNW.",
    minTicket: "US$ 1.000.000", horizon: "10+ anos", expectedReturn: "USD + 9% a.a.", riskLevel: "Arrojado",
    allocation: [
      { asset: "BREIT, Blackstone Real Estate Income", weight: 30, class: "Alternativos", thesis: "Núcleo de real estate income com cap rate atrativo." },
      { asset: "BCRED, Private Credit", weight: 25, class: "Alternativos", thesis: "Crédito privado sênior, yield acima de IG público." },
      { asset: "Blackstone Private Equity Fund", weight: 20, class: "Alternativos", thesis: "Buyouts em empresas líderes de mercado." },
      { asset: "Blackstone Infrastructure Partners", weight: 15, class: "Alternativos", thesis: "Ativos reais com fluxo indexado à inflação." },
      { asset: "Caixa USD", weight: 10, class: "Renda Fixa", thesis: "Liquidez para chamadas de capital." },
    ],
  },
  {
    slug: "alt-kkr", bank: "KKR", focus: "Alternativos", category: "Alternativos", score: 9.0,
    picks: ["KKR Private Equity", "KKR Infrastructure", "KKR Direct Lending", "Real Assets"],
    note: "Plataforma global de private markets com forte vertical de infraestrutura e crédito direto.",
    minTicket: "US$ 2.000.000", horizon: "10+ anos", expectedReturn: "USD + 8,5% a.a.", riskLevel: "Arrojado",
    allocation: [
      { asset: "KKR Americas Private Equity", weight: 30, class: "Alternativos", thesis: "Buyouts large-cap nos EUA." },
      { asset: "KKR Global Infrastructure", weight: 25, class: "Alternativos", thesis: "Infra estabilizada com hedge inflacionário." },
      { asset: "KKR Direct Lending", weight: 20, class: "Alternativos", thesis: "Senior secured loans a empresas middle-market." },
      { asset: "KKR Real Estate Partners", weight: 15, class: "Alternativos", thesis: "Real estate value-add global." },
      { asset: "Caixa USD", weight: 10, class: "Renda Fixa", thesis: "Reserva para capital calls." },
    ],
  },
];

export const consolidatedPortfolio = [
  { name: "Ações Brasil", value: 28, color: "var(--color-chart-1)" },
  { name: "Renda Fixa Pós", value: 20, color: "var(--color-chart-2)" },
  { name: "Renda Fixa Inflação", value: 16, color: "var(--color-chart-3)" },
  { name: "Multimercado", value: 12, color: "var(--color-chart-4)" },
  { name: "Mundo EUA", value: 12, color: "var(--color-chart-5)" },
  { name: "Cripto", value: 6, color: "var(--color-accent)" },
  { name: "Alternativos", value: 6, color: "var(--color-chart-1)" },
];

export const news = [
  { tag: "Brasil", title: "Agenda fiscal segue no radar dos investidores", source: "Panorama Quantara", time: "Atualização do dia", hot: false },
  { tag: "Economia", title: "Mercado acompanha Selic, inflação e crédito privado", source: "Panorama Quantara", time: "Atualização do dia", hot: false },
  { tag: "Mercado", title: "Ibovespa, dólar e juros orientam o fluxo da sessão", source: "Panorama Quantara", time: "Atualização do dia", hot: false },
  { tag: "Câmbio", title: "Dólar reflete juros globais e entrada de capital estrangeiro", source: "Panorama Quantara", time: "Atualização do dia", hot: false },
  { tag: "Mundo", title: "Wall Street monitora dados de atividade e sinalizações do Fed", source: "Panorama Quantara", time: "Atualização do dia", hot: false },
];

export const rendaFixa = [
  { emissor: "CDB Banco BTG", indexador: "118% CDI", prazo: "24 meses", liquidez: "Vencimento", aporte: "R$ 1.000" },
  { emissor: "LCI Bradesco", indexador: "IPCA + 6,20%", prazo: "36 meses", liquidez: "Vencimento", aporte: "R$ 5.000" },
  { emissor: "LCA BB", indexador: "97% CDI", prazo: "12 meses", liquidez: "Vencimento", aporte: "R$ 1.000" },
  { emissor: "Tesouro IPCA+ 2035", indexador: "IPCA + 6,08%", prazo: "Longo prazo", liquidez: "Diária", aporte: "R$ 100" },
  { emissor: "Debênture Eletrobras", indexador: "IPCA + 7,10%", prazo: "60 meses", liquidez: "Mercado", aporte: "R$ 1.000" },
];

// ===== Mundo EUA =====
export const usStocks = [
  { ticker: "AAPL", name: "Apple Inc.", price: 218.42, delta: 0.84, score: 92, sector: "Tech" },
  { ticker: "MSFT", name: "Microsoft", price: 442.18, delta: 1.21, score: 95, sector: "Tech" },
  { ticker: "NVDA", name: "NVIDIA", price: 1180.55, delta: 3.42, score: 97, sector: "Semis" },
  { ticker: "GOOGL", name: "Alphabet", price: 178.32, delta: 0.42, score: 90, sector: "Tech" },
  { ticker: "AMZN", name: "Amazon", price: 184.91, delta: -0.62, score: 88, sector: "Consumer" },
  { ticker: "META", name: "Meta Platforms", price: 478.20, delta: 1.84, score: 89, sector: "Tech" },
  { ticker: "TSLA", name: "Tesla", price: 178.42, delta: -2.18, score: 71, sector: "Auto" },
  { ticker: "BRK.B", name: "Berkshire Hathaway", price: 415.30, delta: 0.31, score: 93, sector: "Financial" },
  { ticker: "JPM", name: "JPMorgan Chase", price: 201.45, delta: 0.92, score: 87, sector: "Financial" },
  { ticker: "V", name: "Visa Inc.", price: 278.90, delta: 0.18, score: 91, sector: "Financial" },
  { ticker: "UNH", name: "UnitedHealth", price: 528.41, delta: -1.10, score: 82, sector: "Health" },
  { ticker: "XOM", name: "ExxonMobil", price: 116.20, delta: 1.42, score: 79, sector: "Energy" },
];

export const usEtfs = [
  { ticker: "VOO", name: "Vanguard S&P 500", expense: "0,03%", yield: "1,32%", aum: "US$ 1,1T" },
  { ticker: "QQQ", name: "Invesco Nasdaq 100", expense: "0,20%", yield: "0,55%", aum: "US$ 320B" },
  { ticker: "VTI", name: "Vanguard Total Market", expense: "0,03%", yield: "1,38%", aum: "US$ 1,7T" },
  { ticker: "VXUS", name: "Vanguard Ex-US", expense: "0,07%", yield: "3,12%", aum: "US$ 78B" },
  { ticker: "SCHD", name: "Schwab Dividend", expense: "0,06%", yield: "3,55%", aum: "US$ 65B" },
  { ticker: "TLT", name: "iShares 20+ Treasury", expense: "0,15%", yield: "4,28%", aum: "US$ 55B" },
];

export const sp500Series = [
  { t: "Jan", v: 4780 }, { t: "Fev", v: 4920 }, { t: "Mar", v: 5180 },
  { t: "Abr", v: 5060 }, { t: "Mai", v: 5310 }, { t: "Jun", v: 5460 },
  { t: "Jul", v: 5520 }, { t: "Ago", v: 5610 }, { t: "Set", v: 5740 },
  { t: "Out", v: 5790 }, { t: "Nov", v: 5840 }, { t: "Dez", v: 5892 },
];

// ===== Cripto =====
export const cryptoAssets = [
  { ticker: "BTC", name: "Bitcoin", price: 71420, delta: 2.18, score: 94, dominance: "52,4%" },
  { ticker: "ETH", name: "Ethereum", price: 3820, delta: 1.42, score: 90, dominance: "17,8%" },
  { ticker: "SOL", name: "Solana", price: 168.40, delta: 4.21, score: 87, dominance: "3,2%" },
  { ticker: "BNB", name: "BNB", price: 612.10, delta: 0.85, score: 81, dominance: "5,1%" },
  { ticker: "XRP", name: "Ripple", price: 0.58, delta: -1.20, score: 68, dominance: "2,4%" },
  { ticker: "ADA", name: "Cardano", price: 0.48, delta: -0.42, score: 65, dominance: "1,1%" },
  { ticker: "AVAX", name: "Avalanche", price: 38.20, delta: 3.10, score: 78, dominance: "0,9%" },
  { ticker: "LINK", name: "Chainlink", price: 18.42, delta: 2.84, score: 82, dominance: "0,6%" },
];

export const cryptoAllocation = [
  { name: "Bitcoin (BTC)", value: 55, color: "var(--color-chart-1)" },
  { name: "Ethereum (ETH)", value: 25, color: "var(--color-chart-2)" },
  { name: "Large Caps (SOL, BNB)", value: 12, color: "var(--color-chart-3)" },
  { name: "DeFi & Infra", value: 5, color: "var(--color-chart-4)" },
  { name: "Stablecoins (yield)", value: 3, color: "var(--color-chart-5)" },
];

export const btcSeries = [
  { t: "Jan", v: 42100 }, { t: "Fev", v: 51200 }, { t: "Mar", v: 68400 },
  { t: "Abr", v: 64100 }, { t: "Mai", v: 71420 }, { t: "Jun", v: 67800 },
  { t: "Jul", v: 69200 }, { t: "Ago", v: 65800 }, { t: "Set", v: 72400 },
  { t: "Out", v: 78900 }, { t: "Nov", v: 82100 }, { t: "Dez", v: 71420 },
];

// ===== Seguros =====
export const insurance = [
  { tipo: "Vida", produto: "Prudential PrevLife", cobertura: "R$ 2.000.000", premio: "R$ 380/mês", score: 92, destaque: "Cobertura ampla com invalidez e doenças graves." },
  { tipo: "Vida", produto: "Icatu Vida Resgatável", cobertura: "R$ 1.000.000", premio: "R$ 210/mês", score: 86, destaque: "Possibilidade de resgate parcial após 10 anos." },
  { tipo: "Vida", produto: "MetLife Private Legacy USD", cobertura: "US$ 5.000.000", premio: "US$ 1.200/mês", score: 95, destaque: "Apólice em dólar para sucessão patrimonial internacional." },
  { tipo: "Vida", produto: "Zurich Private Wealth VGBL", cobertura: "R$ 8.000.000", premio: "R$ 2.400/mês", score: 93, destaque: "Vida + acumulação previdenciária com gestão exclusiva." },
  { tipo: "Vida", produto: "Mongeral Aegon Estate", cobertura: "R$ 15.000.000", premio: "R$ 4.800/mês", score: 91, destaque: "Planejamento sucessório com liquidez imediata para herdeiros." },
  { tipo: "Residencial", produto: "Porto Seguro Casa", cobertura: "R$ 800.000", premio: "R$ 92/mês", score: 88, destaque: "Inclui assistência 24h e danos elétricos." },
  { tipo: "Residencial", produto: "AIG Private Client Group", cobertura: "R$ 25.000.000", premio: "R$ 1.850/mês", score: 96, destaque: "Cobertura para residências de alto valor, arte e coleções." },
  { tipo: "Residencial", produto: "Chubb Masterpiece Estate", cobertura: "R$ 40.000.000", premio: "R$ 3.200/mês", score: 97, destaque: "Linha global premium para mansões, iates e jets compartilhados." },
  { tipo: "Auto", produto: "Allianz Auto Premium", cobertura: "100% Tabela FIPE", premio: "R$ 320/mês", score: 84, destaque: "Carro reserva premium e cobertura internacional Mercosul." },
  { tipo: "Auto", produto: "HDI Prestige Collection", cobertura: "Veículos de coleção e exóticos", premio: "R$ 980/mês", score: 92, destaque: "Apólice para Ferrari, Porsche, clássicos e garagens privadas." },
  { tipo: "Saúde", produto: "Bradesco Saúde Top Nacional", cobertura: "Rede completa", premio: "R$ 1.840/mês", score: 90, destaque: "Hospitais Albert Einstein, Sírio e Oswaldo Cruz." },
  { tipo: "Saúde", produto: "Omint Platinum Global", cobertura: "Mundo ilimitada", premio: "R$ 6.200/mês", score: 95, destaque: "Atendimento em Mayo Clinic, Cleveland Clinic e MD Anderson." },
  { tipo: "Saúde", produto: "SulAmérica Prestige Premium", cobertura: "Rede premium + reembolso 100%", premio: "R$ 4.800/mês", score: 93, destaque: "Reembolso integral em consultas e cirurgias eletivas." },
  { tipo: "Viagem", produto: "Assist Card Diamond", cobertura: "US$ 500.000", premio: "R$ 18/dia", score: 87, destaque: "Cobertura para esportes e pré-existências." },
  { tipo: "Viagem", produto: "AXA Assistance Black", cobertura: "US$ 2.000.000", premio: "R$ 64/dia", score: 92, destaque: "Concierge médico global, evacuação aérea e jato sanitário." },
  { tipo: "Patrimonial", produto: "Chubb Wealth Protection", cobertura: "R$ 10.000.000", premio: "R$ 1.250/mês", score: 94, destaque: "Apólice consolidada para alto patrimônio (HNW)." },
  { tipo: "Patrimonial", produto: "Berkshire Hathaway Excess Liability", cobertura: "US$ 100M (umbrella)", premio: "US$ 28.000/ano", score: 98, destaque: "Umbrella policy para famílias UHNW , responsabilidade civil global." },
  { tipo: "Patrimonial", produto: "Tokio Marine Yacht & Jet", cobertura: "R$ 80.000.000", premio: "R$ 9.400/mês", score: 95, destaque: "Cobertura para iates, jatos executivos e tripulação." },
  { tipo: "Patrimonial", produto: "Liberty Specialty Art & Wine", cobertura: "R$ 30.000.000", premio: "R$ 2.100/mês", score: 93, destaque: "Coleções de arte, vinhos finos e relógios de alto valor." },
  { tipo: "Cyber", produto: "Marsh Private Cyber Shield", cobertura: "R$ 15.000.000", premio: "R$ 1.600/mês", score: 91, destaque: "Proteção contra extorsão digital, fraudes bancárias e roubo de identidade." },
  { tipo: "D&O", produto: "AIG Executive Edge D&O", cobertura: "R$ 50.000.000", premio: "R$ 5.800/mês", score: 94, destaque: "Responsabilidade civil de administradores e conselheiros." },
  { tipo: "Kidnap", produto: "Hiscox K&R Special Risks", cobertura: "US$ 25.000.000", premio: "US$ 18.000/ano", score: 96, destaque: "Sequestro, extorsão e resgate , equipe Control Risks 24/7." },
];

// ===== Patrimônio =====
export const patrimonyBreakdown = [
  { categoria: "Investimentos Líquidos", valor: 2840000, color: "var(--color-chart-1)" },
  { categoria: "Imóveis", valor: 1820000, color: "var(--color-chart-2)" },
  { categoria: "Previdência", valor: 640000, color: "var(--color-chart-3)" },
  { categoria: "Offshore", valor: 920000, color: "var(--color-chart-4)" },
  { categoria: "Cripto", valor: 180000, color: "var(--color-chart-5)" },
  { categoria: "Alternativos", valor: 240000, color: "var(--color-accent)" },
];

export const patrimonyEvolution = [
  { t: "2021", v: 3200000 }, { t: "2022", v: 3680000 }, { t: "2023", v: 4420000 },
  { t: "2024", v: 5180000 }, { t: "2025", v: 5940000 }, { t: "2026", v: 6640000 },
];

// ===== Perfil , pool de perguntas =====
export type Question = {
  q: string;
  opts: { label: string; score: number }[];
};

export const questionPool: Question[] = [
  { q: "Qual o seu horizonte de investimento?", opts: [
    { label: "Até 1 ano", score: 1 }, { label: "1 a 3 anos", score: 2 },
    { label: "3 a 5 anos", score: 3 }, { label: "Acima de 5 anos", score: 4 } ] },
  { q: "Como você reage a uma queda de 15% na carteira?", opts: [
    { label: "Vendo tudo imediatamente", score: 1 }, { label: "Resgato uma parte", score: 2 },
    { label: "Mantenho a posição", score: 3 }, { label: "Aproveito para comprar mais", score: 4 } ] },
  { q: "Qual sua experiência com investimentos?", opts: [
    { label: "Nenhuma", score: 1 }, { label: "Poupança e CDB", score: 2 },
    { label: "Ações e fundos", score: 3 }, { label: "Derivativos e cripto", score: 4 } ] },
  { q: "Qual a finalidade principal do investimento?", opts: [
    { label: "Reserva de emergência", score: 1 }, { label: "Aposentadoria", score: 2 },
    { label: "Crescimento patrimonial", score: 3 }, { label: "Especulação ativa", score: 4 } ] },
  { q: "Qual percentual do seu patrimônio você investe em renda variável?", opts: [
    { label: "0 a 10%", score: 1 }, { label: "10 a 30%", score: 2 },
    { label: "30 a 60%", score: 3 }, { label: "Mais de 60%", score: 4 } ] },
  { q: "Quanto tempo você dedica para acompanhar o mercado?", opts: [
    { label: "Quase nada", score: 1 }, { label: "Algumas vezes no mês", score: 2 },
    { label: "Semanalmente", score: 3 }, { label: "Diariamente", score: 4 } ] },
  { q: "Qual destas afirmações combina mais com você?", opts: [
    { label: "Prefiro dormir tranquilo", score: 1 }, { label: "Aceito pequenas oscilações", score: 2 },
    { label: "Aceito perdas em troca de retorno", score: 3 }, { label: "Risco é parte do jogo", score: 4 } ] },
  { q: "Você tem reserva de emergência separada?", opts: [
    { label: "Não tenho", score: 1 }, { label: "Parcial (até 3 meses)", score: 2 },
    { label: "6 meses cobertos", score: 3 }, { label: "Mais de 12 meses", score: 4 } ] },
  { q: "Qual seu interesse em investimentos internacionais?", opts: [
    { label: "Nenhum", score: 1 }, { label: "Curioso, sem posições", score: 2 },
    { label: "Tenho parte alocada", score: 3 }, { label: "Estratégia consolidada offshore", score: 4 } ] },
  { q: "E quanto a cripto ativos?", opts: [
    { label: "Não confio", score: 1 }, { label: "Estudando", score: 2 },
    { label: "Posição pequena", score: 3 }, { label: "Parte estratégica da carteira", score: 4 } ] },
  { q: "Se o Ibovespa caísse 25% amanhã, você…", opts: [
    { label: "Sairia totalmente", score: 1 }, { label: "Diminuiria exposição", score: 2 },
    { label: "Manteria firme", score: 3 }, { label: "Compraria agressivamente", score: 4 } ] },
  { q: "Qual seu objetivo de retorno anual?", opts: [
    { label: "Próximo do CDI", score: 1 }, { label: "CDI + 2%", score: 2 },
    { label: "CDI + 5%", score: 3 }, { label: "Acima de CDI + 8%", score: 4 } ] },
];
