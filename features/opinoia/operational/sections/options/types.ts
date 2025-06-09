export type Option = {
  id: string;
  title: string;
  code: string;
  duration?: number;
  subchannels: string[] | "all";
  paxTypes: string[] | "all";
};

export type OptionsSectionData = {
  options: Option[];
};
