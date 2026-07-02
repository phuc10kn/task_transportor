function hasMatch(pattern, text) {
  return pattern.test(text || "");
}

function detectRawSignals(sourceText) {
  const text = String(sourceText || "");

  return {
    contains_vietnamese: hasMatch(
      /[\u00c0-\u00c3\u00c8-\u00ca\u00cc-\u00cd\u00d2-\u00d5\u00d9-\u00da\u00dd\u00e0-\u00e3\u00e8-\u00ea\u00ec-\u00ed\u00f2-\u00f5\u00f9-\u00fa\u00fd\u0102-\u0103\u0110-\u0111\u0128-\u0129\u0168-\u0169\u01a0-\u01a1\u01af-\u01b0\u1ea0-\u1ef9]/,
      text
    ),
    contains_japanese: hasMatch(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/, text),
    contains_english: hasMatch(/[A-Za-z]/, text),
    contains_code_block: text.includes("```"),
    contains_stack_trace: hasMatch(/\bat\s+.+\(.+\)|Exception|Traceback|Error:/, text),
    contains_many_identifiers: (text.match(/[A-Z]{2,}-\d+|[A-Za-z0-9_./:-]{8,}/g) || []).length >= 3,
    is_short_ack_comment: text.trim().length > 0 && text.trim().length <= 40,
    is_mixed_language: false,
  };
}

function finalizeSignals(signals) {
  return {
    ...signals,
    is_mixed_language: Boolean(
      (signals.contains_japanese && signals.contains_vietnamese) ||
      (signals.contains_japanese && signals.contains_english)
    ),
  };
}

module.exports = {
  detectTextSignals(sourceText) {
    return finalizeSignals(detectRawSignals(sourceText));
  },
};
