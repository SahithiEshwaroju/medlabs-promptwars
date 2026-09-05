import test from 'node:test';
import assert from 'node:assert/strict';
import { ocrExtractor } from '../src/services/ocrExtractor.js';
import { conflictDetector } from '../src/services/conflictDetector.js';
import { DEMO_ROLES, DEMO_TEST_REQUESTS, DEMO_PATIENTS } from '../src/services/demoData.js';

test('1. Reference Range Safety: Strict compliance and NOT_DETERMINED handling', async (t) => {
  await t.test('Normal value within bounds returns NORMAL', () => {
    const res = ocrExtractor.evaluateReferenceRange(14.2, 12.0, 16.0);
    assert.equal(res.status, 'NORMAL');
    assert.match(res.message, /within explicit source reference range/);
  });

  await t.test('Value below range returns LOW', () => {
    const res = ocrExtractor.evaluateReferenceRange(11.2, 12.0, 16.0);
    assert.equal(res.status, 'LOW');
    assert.match(res.message, /below source reference minimum/);
  });

  await t.test('Value above range returns HIGH', () => {
    const res = ocrExtractor.evaluateReferenceRange(18.5, 12.0, 16.0);
    assert.equal(res.status, 'HIGH');
    assert.match(res.message, /above source reference maximum/);
  });

  await t.test('MISSING RANGE NEVER GUESSES: returns NOT_DETERMINED', () => {
    const res1 = ocrExtractor.evaluateReferenceRange(14.0, null, null);
    assert.equal(res1.status, 'NOT_DETERMINED');
    assert.match(res1.message, /not provided in source document/);

    const res2 = ocrExtractor.evaluateReferenceRange(14.0, undefined, undefined);
    assert.equal(res2.status, 'NOT_DETERMINED');
  });

  await t.test('Non-numeric or missing value returns NOT_DETERMINED', () => {
    const res1 = ocrExtractor.evaluateReferenceRange(null, 12.0, 16.0);
    assert.equal(res1.status, 'NOT_DETERMINED');

    const res2 = ocrExtractor.evaluateReferenceRange("invalid", 12.0, 16.0);
    assert.equal(res2.status, 'NOT_DETERMINED');
  });

  await t.test('Boundary values return NORMAL', () => {
    const atMin = ocrExtractor.evaluateReferenceRange(12.0, 12.0, 16.0);
    assert.equal(atMin.status, 'NORMAL');

    const atMax = ocrExtractor.evaluateReferenceRange(16.0, 12.0, 16.0);
    assert.equal(atMax.status, 'NORMAL');
  });
});

test('2. Conflict Intelligence Rules Engine', async (t) => {
  const patientWithPenicillinAllergy = {
    id: 1,
    name: "Rahul Kumar",
    allergies: "Penicillin"
  };

  const patientWithSulfaAllergy = {
    id: 2,
    name: "Priya Sharma",
    allergies: "Sulfa drugs"
  };

  const patientWithNoAllergies = {
    id: 3,
    name: "Vikram Patel",
    allergies: "No known drug allergies (NKDA)"
  };

  await t.test('Flags Penicillin allergy conflict against Amoxicillin prescription', () => {
    const medications = [
      { name: "Amoxicillin", dosage: "500mg", source_page: 1 },
      { name: "Paracetamol", dosage: "650mg", source_page: 1 }
    ];

    const conflicts = conflictDetector.detectConflicts(patientWithPenicillinAllergy, medications, "Rx_Doc.pdf");
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].conflict_type, "ALLERGY_MEDICATION");
    assert.equal(conflicts[0].severity, "WARNING");
    assert.equal(conflicts[0].status, "Needs Professional Review");
    assert.match(conflicts[0].document_statement, /Amoxicillin 500mg/);
    assert.match(conflicts[0].disclaimer, /Please verify with a qualified healthcare professional/);
  });

  await t.test('Flags Sulfa allergy conflict against Bactrim prescription', () => {
    const medications = [
      { name: "Bactrim DS", dosage: "800/160mg", source_page: 1 }
    ];

    const conflicts = conflictDetector.detectConflicts(patientWithSulfaAllergy, medications, "Rx_Sulfa.pdf");
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].conflict_type, "ALLERGY_MEDICATION");
  });

  await t.test('Zero conflicts when patient has no allergy or medications are unrelated', () => {
    const medications = [
      { name: "Paracetamol", dosage: "650mg", source_page: 1 },
      { name: "Vitamin C", dosage: "500mg", source_page: 1 }
    ];

    const conflictsAllergic = conflictDetector.detectConflicts(patientWithPenicillinAllergy, medications);
    assert.equal(conflictsAllergic.length, 0);

    const conflictsNonAllergic = conflictDetector.detectConflicts(patientWithNoAllergies, [
      { name: "Amoxicillin", dosage: "500mg" }
    ]);
    assert.equal(conflictsNonAllergic.length, 0);
  });

  await t.test('Zero conflicts when patient is undefined or has no allergies field', () => {
    const conflictsNull = conflictDetector.detectConflicts(null, [{ name: "Amoxicillin" }]);
    assert.deepEqual(conflictsNull, []);

    const conflictsEmpty = conflictDetector.detectConflicts({}, [{ name: "Amoxicillin" }]);
    assert.deepEqual(conflictsEmpty, []);
  });
});

test('3. Role System & Demo Configuration Integrity', async (t) => {
  await t.test('All 4 core roles are properly configured with permissions', () => {
    const roleKeys = Object.keys(DEMO_ROLES);
    assert.deepEqual(roleKeys, ['patient', 'doctor', 'lab_tech', 'admin']);

    for (const [key, roleData] of Object.entries(DEMO_ROLES)) {
      assert.ok(roleData.id, `Role ${key} has an id`);
      assert.ok(roleData.name, `Role ${key} has a human name`);
      assert.ok(roleData.role, `Role ${key} has a role code`);
      assert.ok(roleData.desc, `Role ${key} has a plain-language description`);
    }
  });

  await t.test('Demo test requests have valid lifecycle states', () => {
    assert.ok(DEMO_TEST_REQUESTS.length > 0);
    const validStatuses = ['PENDING', 'ACCEPTED', 'SCHEDULED', 'SAMPLE_COLLECTED', 'COMPLETED'];
    for (const req of DEMO_TEST_REQUESTS) {
      assert.ok(validStatuses.includes(req.status), `Status ${req.status} is valid`);
      assert.ok(req.id, 'Request has an ID');
      assert.ok(req.patient_name, 'Request has a patient name');
      assert.ok(req.test_type, 'Request has a test_type');
    }
  });

  await t.test('Demo patient Rahul Kumar has documented Penicillin allergy', () => {
    const rahul = DEMO_PATIENTS.find(p => p.name === "Rahul Kumar");
    assert.ok(rahul, 'Rahul Kumar exists in demo patients');
    assert.equal(rahul.allergies, "Penicillin");
  });
});
