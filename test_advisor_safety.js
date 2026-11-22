const assert = require('node:assert/strict');

async function run() {
  const { containsActionableChemicalInstruction } =
    await import('./src/lib/advisor/safety.js');

  const unsafe = [
    'Apply imidacloprid at 0.3 ml per litre.',
    'Mix pesticide A with fungicide B in the spray tank.',
    'Use 25 kg of urea per acre immediately.',
    'పిచికారి కోసం 2 ml మందును లీటరుకు కలపండి.',
  ];
  for (const text of unsafe) {
    assert.equal(
      containsActionableChemicalInstruction(text),
      true,
      `Unsafe instruction was not detected: ${text}`
    );
  }

  const safe = [
    'Urea is a nitrogen fertilizer that supports crop growth.',
    'Do not spray pesticides; ask an Agriculture Officer.',
    'Avoid mixing chemicals and consult the registered product label.',
    'Tomorrow rain may wash off a recently applied pesticide, so delay spraying.',
    'Neem oil can be considered under local guidance, but follow the registered label.',
  ];
  for (const text of safe) {
    assert.equal(
      containsActionableChemicalInstruction(text),
      false,
      `Safe or negated guidance was incorrectly rejected: ${text}`
    );
  }

  console.log('PASS Advisor safety detection distinguishes safe guidance and unsafe instructions');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
