export type GeneratorConfig = {
  name: string;
  script: string;
  cadence: ('ci' | 'daily' | 'weekly')[];
  expected: {
    framework: string;
    renderer: string;
    builder: string;
  };
};
