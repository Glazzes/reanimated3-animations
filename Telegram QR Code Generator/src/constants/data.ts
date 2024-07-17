type ShaderColors = [string, string, string, string];

export type PatternOptions = {
  emoji: string;
  pattern: any;
  accentColor: string;
  backgroundColors: ShaderColors;
  qrCodeLightColors: ShaderColors;
  qrCodeDarkColors: ShaderColors;
};

export const patterns: PatternOptions[] = [
  {
    emoji: '🏡',
    accentColor: '#52A9EB',
    pattern: require('@assets/images/patterns/home.png'),
    backgroundColors: ['#D1D78C', '#89B884', '#6CA586', '#D5DBB9'],
    qrCodeDarkColors: ['#2699CD', '#1B84D1', '#1D79D0', '#3174E2'],
    qrCodeLightColors: ['#8AB546', '#6BB45B', '#37936E', '#6CB457'],
  },
  {
    emoji: '🐥',
    accentColor: '#3EC386',
    pattern: require('@assets/images/patterns/nature.png'),
    backgroundColors: ['#D2D78C', '#A4C885', '#BADD84', '#8ABDA0'],
    qrCodeDarkColors: ['#639920', '#3FA750', '#23794B', '#4EA327'],
    qrCodeLightColors: ['#88BB4C', '#9BB13A', '#49A46D', '#83B650'],
  },
  {
    emoji: '☃️',
    accentColor: '#54A8D2',
    pattern: require('@assets/images/patterns/winter.png'),
    backgroundColors: ['#AFDDD3', '#BCC3EC', '#9FD3F3', '#82ABEC'],
    qrCodeDarkColors: ['#20A3CA', '#677CFC', '#2E7FB9', '#3070DB'],
    qrCodeLightColors: ['#65A2FD', '#58B4ED', '#8698FE', '#48B6D6'],
  },
  {
    emoji: '💎',
    accentColor: '#C383E6',
    pattern: require('@assets/images/patterns/jewerly.png'),
    backgroundColors: ['#C9B1ED', '#EDB8DC', '#B3E8EA', '#99C0EA'],
    qrCodeDarkColors: ['#AB56BB', '#6C54FC', '#4175D2', '#2A92C7'],
    qrCodeLightColors: ['#D085CE', '#AB7AF8', '#5399F1', '#4EB3D4'],
  },
  {
    emoji: '🧑‍🏫',
    accentColor: '#37C5B5',
    pattern: require('@assets/images/patterns/teacher.png'),
    backgroundColors: ['#77B9E0', '#93D79A', '#CEE298', '#91D2CC'],
    qrCodeDarkColors: ['#278C68', '#6FA063', '#118C91', '#19A87F'],
    qrCodeLightColors: ['#51B897', '#88B862', '#3DA0CA', '#76B171'],
  },
  {
    emoji: '🌷',
    accentColor: '#F26FA2',
    pattern: require('@assets/images/patterns/fantasy.png'),
    backgroundColors: ['#EAA0C2', '#C7B0EA', '#E8C584', '#ECB08D'],
    qrCodeDarkColors: ['#D75651', '#AF5EBD', '#D17414', '#CC4B60'],
    qrCodeLightColors: ['#DF7B7D', '#D174BD', '#E39034', '#E27E55'],
  },
  {
    emoji: '💜',
    accentColor: '#AD7BE9',
    pattern: require('@assets/images/patterns/love.png'),
    backgroundColors: ['#B8A0E3', '#EAAF76', '#E7A4D6', '#E999C4'],
    qrCodeDarkColors: ['#AE64BD', '#DE7145', '#D6566A', '#D05AA0'],
    qrCodeLightColors: ['#B56BE2', '#F78D64', '#EC5B80', '#E35EA9'],
  },
  {
    emoji: '🎄',
    accentColor: '#3FB046',
    pattern: require('@assets/images/patterns/christmas.png'),
    backgroundColors: ['#ED9F68', '#E0D07F', '#ECD172', '#E9A059'],
    qrCodeDarkColors: ['#C9871D', '#D5691F', '#CD6F2D', '#CE8225'],
    qrCodeLightColors: ['#EC9324', '#F38B2E', '#E67C1E', '#ED7640'],
  },
  {
    emoji: '🎮',
    accentColor: '#769AFF',
    pattern: require('@assets/images/patterns/gaming.png'),
    backgroundColors: ['#E988D2', '#EDD35C', '#A783E1', '#46C9DF'],
    qrCodeDarkColors: ['#BE4674', '#DB7F46', '#9F4BF6', '#1AA9EA'],
    qrCodeLightColors: ['#E4518B', '#E19A34', '#D663E1', '#67A997'],
  },
];
