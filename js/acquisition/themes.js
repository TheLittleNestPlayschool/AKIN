/*   acquisition visual themes*/
const acquisitionThemes={
  mia_4800:{
    key:"mia",
    accent:"warm",
    assets:{
      intro:"assets/acquisition/mia/intro.svg",
      choice:"assets/acquisition/mia/choice.svg",
      reflection:"assets/acquisition/mia/reflection.svg",
      value:"assets/acquisition/mia/value.svg",
      cta:"assets/acquisition/mia/cta.svg",
      login:"assets/acquisition/mia/login.svg"
    }
  }
};

const fallbackTheme={
  key:"default",
  accent:"soft",
  assets:{}
};

export function getAcquisitionTheme(slug){
  return acquisitionThemes[slug]||fallbackTheme;
}

export function getAcquisitionAsset(theme,stepType){
  return theme?.assets?.[stepType]||theme?.assets?.intro||"";
}
