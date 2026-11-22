const CHEMICAL_TERMS =
  /\b(?:pesticides?|insecticides?|fungicides?|herbicides?|fertili[sz]ers?|urea|npk|imidacloprid|acetamiprid|chlorpyrifos|neem oil)\b|పురుగుమందు|శిలీంద్రనాశిని|ఎరువు|యూరియా|మందు/iu;

const NEGATION_TERMS =
  /\b(?:do not|don't|dont|avoid|never|shouldn't|should not|must not|refrain from|not recommended|delay)\b|వద్దు|చేయవద్దు|వాడకండి|వాడొద్దు|పిచికారి చేయకండి|ఆపండి/iu;

const MEASUREMENT_TERMS =
  /\b\d+(?:\.\d+)?\s*(?:kg|g|mg|ml|l|lit(?:er|re)s?|grams?|millilit(?:er|re)s?|quintals?|bags?)(?:\s*(?:\/|per)\s*(?:l|lit(?:er|re)s?|acre|hectare|plant|m2|sq\.?\s*m))?\b|(?:[0-9]+(?:\.[0-9]+)?|ఒక)\s*(?:కిలో|గ్రా\.?|మి\.?\s*లీ\.?|లీటరు)/iu;

const DIRECT_APPLICATION_TERMS =
  /\b(?:apply|spray|dust|drench|dose|treat with|mix with|mix together|blend|use)\b|పిచికారి|పిచికారీ|వాడాలి|వాడండి|కలపాలి|కలపండి|కొట్టాలి|మోతాదు/iu;

const DANGEROUS_MIX_TERMS =
  /\b(?:mix|mixture|blend|combine|tank mix|tank-mix|cocktail)\b|కలపడం|కలపాలి|కలపండి|మిశ్రమం/iu;

export function containsActionableChemicalInstruction(text) {
  if (typeof text !== 'string' || !text.trim()) return false;

  return text.split(/[\n.!?;।]+/u).some((clause) => {
    const hasChemical = CHEMICAL_TERMS.test(clause);
    if (!hasChemical || NEGATION_TERMS.test(clause)) return false;

    if (MEASUREMENT_TERMS.test(clause)) return true;

    if (
      DANGEROUS_MIX_TERMS.test(clause) &&
      (clause.match(CHEMICAL_TERMS) || clause.match(/\b(?:chemical|medicine|solution)\b/iu))
    ) {
      return true;
    }

    return DIRECT_APPLICATION_TERMS.test(clause);
  });
}
