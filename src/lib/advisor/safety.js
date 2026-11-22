const CHEMICAL_TERMS = /\b(?:pesticides?|insecticides?|fungicides?|herbicides?|fertili[sz]ers?|urea|imidacloprid|acetamiprid|chlorpyrifos|neem oil)\b|పురుగుమందు|శిలీంద్రనాశిని|ఎరువు|యూరియా/iu;
const APPLICATION_TERMS = /\b(?:spray|apply|mix|use|dose|dosage|treat with)\b|పిచికారీ|వాడండి|కలపండి|మోతాదు|మందు కొట్ట/iu;
const NEGATION_TERMS = /\b(?:do not|don't|avoid|never|shouldn't|must not)\b|వద్దు|చేయవద్దు|వాడకండి/iu;
const MEASUREMENT_TERMS = /\b\d+(?:\.\d+)?\s*(?:kg|g|mg|ml|l|lit(?:er|re)s?|grams?|millilit(?:er|re)s?)(?:\s*(?:\/|per)\s*(?:l|lit(?:er|re)s?|acre|hectare))?\b|కిలో|గ్రా\.?|మి\.?\s*లీ\.?/iu;

export function containsActionableChemicalInstruction(text) {
  if (typeof text !== 'string' || !text.trim()) return false;
  return text.split(/[\n.!?;।]+/u).some((clause) => {
    if (!CHEMICAL_TERMS.test(clause)) return false;
    if (MEASUREMENT_TERMS.test(clause)) return true;
    return APPLICATION_TERMS.test(clause) && !NEGATION_TERMS.test(clause);
  });
}
