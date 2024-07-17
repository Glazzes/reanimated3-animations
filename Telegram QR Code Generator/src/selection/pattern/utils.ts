export const buildIcon = (
  color1: string,
  color2: string,
  color3: string,
  color4: string
) => {
  'worklet';

  return `
    <svg width="146" height="146" viewBox="0 0 146 146" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="58" height="58" rx="14" stroke="${color1}" stroke-width="14"/>
    <rect x="84" y="4" width="58" height="58" rx="14" stroke="${color2}" stroke-width="14"/>
    <rect x="4" y="84" width="58" height="58" rx="14" stroke="${color3}" stroke-width="14"/>
    <rect x="87" y="86" width="17" height="17" rx="4" fill="${color1}"/>
    <rect x="121" y="121" width="17" height="17" rx="4" fill="${color4}"/>
    <rect x="87" y="121" width="17" height="17" rx="4" fill="${color3}"/>
    <rect x="104" y="104" width="17" height="17" rx="4" fill="url(#paint0_linear_1_14)"/>
    <rect x="122" y="86" width="17" height="17" rx="4" fill="${color2}"/>
    <defs>
    <linearGradient id="paint0_linear_1_14" x1="104" y1="121" x2="121" y2="121" gradientUnits="userSpaceOnUse">
    <stop stop-color="${color3}"/>
    <stop offset="1" stop-color="${color2}"/>
    </linearGradient>
    </defs>
    </svg>
`;
};
