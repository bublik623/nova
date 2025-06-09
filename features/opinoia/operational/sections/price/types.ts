export type Price = {
  id: string;
  option_id: string;
  dateFrom: string;
  dateTo: string;
  currency: string;
  languages: string[] | "all";
  days: string[] | "all";
  paxPrices: {
    paxType: string;
    cost: number | undefined;
    initialPrice: number | undefined;
    suggestedPrice: number | undefined;
  }[];
};

export type PriceSectionData = {
  prices: Price[];
};
