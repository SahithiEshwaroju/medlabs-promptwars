// Conflict Intelligence Rules Engine

const ALLERGY_MAP = {
  penicillin: ['amoxicillin', 'ampicillin', 'augmentin', 'piperacillin', 'oxacillin', 'cloxacillin'],
  sulfa: ['bactrim', 'septra', 'sulfamethoxazole', 'sulfadiazine'],
  aspirin: ['ibuprofen', 'naproxen', 'diclofenac', 'ketorolac'],
  codeine: ['morphine', 'oxycodone', 'hydrocodone', 'tramadol']
};

export const conflictDetector = {
  /**
   * Evaluates patient profile allergies against extracted medications.
   * STRICT SAFETY RULE:
   * - Never state "This medication is dangerous."
   * - Never provide treatment or prescription advice.
   * - Flag purely as documentation inconsistency requiring professional review.
   */
  detectConflicts(patient, medications = [], sourceDocName = "Uploaded_Prescription.pdf") {
    const conflicts = [];
    if (!patient || !patient.allergies) return conflicts;

    const patientAllergy = patient.allergies.toLowerCase();

    medications.forEach(med => {
      const medName = med.name.toLowerCase();

      for (const [allergenKey, crossReactiveList] of Object.entries(ALLERGY_MAP)) {
        if (patientAllergy.includes(allergenKey)) {
          if (medName.includes(allergenKey) || crossReactiveList.some(cr => medName.includes(cr))) {
            conflicts.push({
              id: Date.now() + Math.random(),
              patient_id: patient.id,
              conflict_type: "ALLERGY_MEDICATION",
              severity: "WARNING",
              title: "Potential Record Conflict: Documented Allergy vs Prescribed Medication",
              user_statement: patient.allergies,
              user_source: "Patient Profile (USER PROVIDED)",
              document_statement: `${med.name} ${med.dosage || ''}`.trim(),
              document_source: `${sourceDocName} (Page ${med.source_page || 1})`,
              status: "Needs Professional Review",
              resolved: false,
              disclaimer: "These records contain potentially inconsistent information. Please verify with a qualified healthcare professional."
            });
          }
        }
      }
    });

    return conflicts;
  }
};
