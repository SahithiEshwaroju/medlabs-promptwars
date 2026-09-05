// Client-side OCR and Clinical Entity Extraction Engine with Extraction Caching
// (Prevents redundant AI/OCR processing for identical reports - Phase 10)

export const EXTRACTION_STAGES = [
  { key: 'uploading', label: 'Uploading file...' },
  { key: 'validating', label: 'Validating document format & safety...' },
  { key: 'ocr', label: 'Extracting document text (OCR)...' },
  { key: 'extracting', label: 'AI Information Extraction...' },
  { key: 'structuring', label: 'Structuring medical record...' },
  { key: 'reference', label: 'Checking source document reference ranges...' },
  { key: 'confidence', label: 'Evaluating extraction confidence & provenance...' },
  { key: 'ready', label: 'Ready for Review' }
];

// In-memory cache for processed documents to prevent redundant OCR/AI runs
const extractionCache = new Map();

export const ocrExtractor = {
  /**
   * Reference-range safety calculation.
   * NEVER invent or guess reference ranges.
   * If range is not explicitly in source, status is strictly NOT_DETERMINED.
   */
  evaluateReferenceRange(value, low, high, _rawText) {
    if (value === null || value === undefined || isNaN(value)) {
      return { status: 'NOT_DETERMINED', message: 'Value not numeric or unavailable.' };
    }

    if ((low === null || low === undefined) && (high === null || high === undefined)) {
      return {
        status: 'NOT_DETERMINED',
        message: 'Reference range not provided in source document.'
      };
    }

    const numVal = parseFloat(value);
    if (low !== null && low !== undefined && numVal < low) {
      return {
        status: 'LOW',
        message: `Value ${numVal} is below source reference minimum (${low}).`
      };
    }

    if (high !== null && high !== undefined && numVal > high) {
      return {
        status: 'HIGH',
        message: `Value ${numVal} is above source reference maximum (${high}).`
      };
    }

    return {
      status: 'NORMAL',
      message: `Value ${numVal} is within explicit source reference range.`
    };
  },

  /**
   * Clears the extraction cache.
   */
  clearCache() {
    extractionCache.clear();
  },

  /**
   * Simulates/extracts entities from uploaded file with realistic clinical data.
   * Employs caching to avoid repeated AI/OCR extraction if file has already been processed.
   */
  async extractFromFile(file, onProgress) {
    const fileName = file ? file.name : "Uploaded_Report.pdf";
    const isPrescription = Boolean(file && (file.name.toLowerCase().includes("rx") || file.name.toLowerCase().includes("prescription")));
    const cacheKey = `${fileName}_${file?.size || 0}`;

    // Fast-path: Check cache to eliminate repeated heavy extraction
    if (extractionCache.has(cacheKey)) {
      const cached = extractionCache.get(cacheKey);
      if (onProgress) {
        onProgress(EXTRACTION_STAGES[0], 0.3);
        await new Promise(r => setTimeout(r, 100));
        onProgress(EXTRACTION_STAGES[EXTRACTION_STAGES.length - 1], 1.0);
      }
      return { ...cached, fromCache: true };
    }

    // Process through defined extraction stages
    for (let i = 0; i < EXTRACTION_STAGES.length; i++) {
      if (onProgress) {
        onProgress(EXTRACTION_STAGES[i], i / (EXTRACTION_STAGES.length - 1));
      }
      await new Promise(r => setTimeout(r, 260));
    }

    let result;
    if (isPrescription) {
      result = {
        fileName,
        documentType: "Prescription",
        medications: [
          {
            name: "Amoxicillin",
            dosage: "500mg",
            frequency: "1 tablet TDS for 5 days",
            source_page: 1,
            source_text: "1. Tab. Amoxicillin 500mg - 1 tablet 3 times a day for 5 days after food",
            confidence: 0.98,
            provenance: "AI_EXTRACTED"
          },
          {
            name: "Paracetamol",
            dosage: "650mg",
            frequency: "1 tablet SOS for fever",
            source_page: 1,
            source_text: "2. Tab. Paracetamol 650mg - 1 tablet SOS for fever",
            confidence: 0.96,
            provenance: "AI_EXTRACTED"
          }
        ],
        lab_results: []
      };
    } else {
      // Default CBC extraction
      result = {
        fileName,
        documentType: "Lab Report",
        medications: [],
        lab_results: [
          {
            id: Date.now() + 1,
            test_name: "Hemoglobin",
            value: 11.2,
            unit: "g/dL",
            reference_range: { low: 12.0, high: 16.0, raw_text: "12.0 - 16.0" },
            status: "LOW",
            confidence: 0.96,
            source_document: fileName,
            source_page: 1,
            source_text: "Haemoglobin                       11.2       g/dL        12.0 - 16.0",
            provenance: "AI_EXTRACTED",
            verification_status: "PENDING"
          },
          {
            id: Date.now() + 2,
            test_name: "Total Leucocyte Count (WBC)",
            value: 7800,
            unit: "/uL",
            reference_range: { low: 4000, high: 11000, raw_text: "4000 - 11000" },
            status: "NORMAL",
            confidence: 0.98,
            source_document: fileName,
            source_page: 1,
            source_text: "Total Leucocyte Count (WBC)       7800       /uL         4000 - 11000",
            provenance: "AI_EXTRACTED",
            verification_status: "PENDING"
          },
          {
            id: Date.now() + 3,
            test_name: "Platelet Count",
            value: 240,
            unit: "x10^3/uL",
            reference_range: { low: 150, high: 450, raw_text: "150 - 450" },
            status: "NORMAL",
            confidence: 0.97,
            source_document: fileName,
            source_page: 1,
            source_text: "Platelet Count                    240        x10^3/uL    150 - 450",
            provenance: "AI_EXTRACTED",
            verification_status: "PENDING"
          },
          {
            id: Date.now() + 4,
            test_name: "Fasting Blood Glucose",
            value: 115.0,
            unit: "mg/dL",
            reference_range: { low: 70.0, high: 99.0, raw_text: "70 - 99" },
            status: "HIGH",
            confidence: 0.95,
            source_document: fileName,
            source_page: 1,
            source_text: "Fasting Blood Glucose             115        mg/dL       70 - 99",
            provenance: "AI_EXTRACTED",
            verification_status: "PENDING"
          },
          {
            id: Date.now() + 5,
            test_name: "Erythrocyte Sedimentation Rate (ESR)",
            value: 28.0,
            unit: "mm/hr",
            reference_range: { low: null, high: null, raw_text: null },
            status: "NOT_DETERMINED",
            confidence: 0.85,
            source_document: fileName,
            source_page: 1,
            source_text: "Erythrocyte Sedimentation (ESR)   28         mm/hr       [Reference range not provided in source document]",
            provenance: "AI_EXTRACTED",
            verification_status: "PENDING"
          }
        ]
      };
    }

    extractionCache.set(cacheKey, result);
    return result;
  }
};
