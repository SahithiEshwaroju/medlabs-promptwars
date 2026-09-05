// Client-side Safe AI Summary and Clinical Assistant Service

export const aiService = {
  SAFETY_DISCLAIMER: "AI-generated organizational summary. Not a diagnosis or treatment recommendation.",

  generateSafeSummary(patient, labResults = [], conflicts = []) {
    const pName = patient ? patient.name : "Patient";
    const testedNames = labResults.map(r => r.test_name);
    const testsStr = testedNames.length > 0 ? testedNames.slice(0, 4).join(", ") : "routine lab panels";

    const lowTests = labResults.filter(r => r.status === "LOW").map(r => r.test_name);
    const highTests = labResults.filter(r => r.status === "HIGH").map(r => r.test_name);
    const notDeterminedTests = labResults.filter(r => r.status === "NOT_DETERMINED").map(r => r.test_name);

    let narrative = `${pName}'s latest uploaded medical report contains results for ${testsStr}. `;
    if (lowTests.length > 0) {
      narrative += `${lowTests.join(", ")} is marked LOW according to the explicit reference range provided in the source report. `;
    }
    if (highTests.length > 0) {
      narrative += `${highTests.join(", ")} is marked HIGH according to the reference range in the source document. `;
    }
    if (notDeterminedTests.length > 0) {
      narrative += `${notDeterminedTests.join(", ")} is marked NOT DETERMINED as no reference range was provided in the source document. `;
    }
    narrative += "Other displayed results are presented strictly according to the reference ranges available in the source document.";

    const reviewItems = [];
    const lowConf = labResults.filter(r => r.confidence < 0.90);
    if (lowConf.length > 0) {
      reviewItems.push(`${lowConf.length} low-confidence extraction (${lowConf.map(r => r.test_name).join(", ")})`);
    }
    const unverified = labResults.filter(r => r.verification_status === "PENDING");
    if (unverified.length > 0) {
      reviewItems.push(`${unverified.length} unverified clinical field(s)`);
    }
    if (conflicts.length > 0) {
      reviewItems.push(`${conflicts.length} potential record conflict(s) requiring professional review`);
    }

    return {
      summary_text: narrative,
      review_items: reviewItems,
      disclaimer: this.SAFETY_DISCLAIMER
    };
  }
};
