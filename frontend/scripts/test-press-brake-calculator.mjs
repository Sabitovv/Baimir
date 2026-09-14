import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculatePressBrake, calculateMatrixVariants, matrixOpenings, CALCULATOR_PARAMS,
  DEFAULT_PRESS_BRAKE_DRAFT, MATERIAL_STRENGTH, readPressBrakeDraft, panelBenderRequest, bendingSelectionParams, bendingMethodParams,
} from '../src/utils/pressBrakeCalculator.ts';

const calculate = (changes = {}) => calculatePressBrake({ ...DEFAULT_PRESS_BRAKE_DRAFT, ...changes });
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-8, `${actual} != ${expected}`);

test('reference example: steel 2 mm, 1000 mm, recommended V16', () => {
  const { result } = calculate();
  close(result.forceTonnes, 15.975);
  close(result.forceKN, 156.66123375);
  assert.equal(result.requiredKN, 181);
  assert.equal(result.dieOpening, 16);
  close(result.minimumFlange, 11.36);
  close(result.innerRadius, 2.5);
});

test('five standard variants and unavailable thin-sheet slots match the reference', () => {
  assert.deepEqual(matrixOpenings(0.5), [null, null, 6, null, null]);
  assert.deepEqual(matrixOpenings(0.6), [null, null, 6, 8, null]);
  assert.deepEqual(matrixOpenings(0.8), [null, null, 6, 8, 10]);
  assert.deepEqual(matrixOpenings(1), [null, 6, 8, 10, 12]);
  assert.deepEqual(matrixOpenings(2), [10, 12, 16, 20, 25]);
  assert.deepEqual(matrixOpenings(2.5), [12, 16, 20, 25, 32]);
  assert.deepEqual(matrixOpenings(3), [16, 20, 25, 32, 40]);
  assert.deepEqual(matrixOpenings(4), [20, 25, 32, 40, 50]);
  assert.deepEqual(matrixOpenings(25), [125, 160, 200, 250, null]);
  assert.ok(calculateMatrixVariants({ ...DEFAULT_PRESS_BRAKE_DRAFT, thickness: '2.5' })[0]);
});

test('4 mm / 2500 mm: selecting a different column changes the real machine requirement', () => {
  const variants = calculateMatrixVariants({ ...DEFAULT_PRESS_BRAKE_DRAFT, thickness: '4', length: '2500' });
  close(variants[2].forceTonnes, 79.875);
  assert.deepEqual(variants.map(v => v.requiredKN), [1442, 1154, 901, 721, 577]);
  close(variants[2].minimumFlange, 22.72);
  close(variants[2].innerRadius, 5);
});

test('angle changes flange, while the reference force estimate is angle-independent', () => {
  const expected = [[30, 31.04], [45, 20.96], [60, 16], [90, 11.36], [120, 9.28], [135, 8.8], [165, 8.16]];
  for (const [angle, flange] of expected) {
    const { result } = calculate({ angle: String(angle) });
    close(result.minimumFlange, flange);
    close(result.forceTonnes, 15.975);
  }
  assert.equal(calculate({ angle: '88' }).error, 'angle');
});

test('material affects both force and radius; custom material does not invent a radius', () => {
  const stainless = calculate({ material: 'stainless', strength: String(MATERIAL_STRENGTH.stainless) }).result;
  close(stainless.forceTonnes, 28.4);
  close(stainless.innerRadius, 3);
  const aluminium = calculate({ material: 'aluminium', strength: String(MATERIAL_STRENGTH.aluminium) }).result;
  close(aluminium.forceTonnes, 7.1);
  close(aluminium.innerRadius, 2);
  assert.equal(calculate({ material: 'custom', strength: '500' }).result.innerRadius, null);
});

test('force scales with actual length and custom die, not rounded catalog options', () => {
  close(calculate({ length: '1357' }).result.forceTonnes, 21.678075);
  close(calculate({ dieOpening: '32' }).result.forceTonnes, 7.9875);
  assert.equal(calculate({ thickness: '4', dieOpening: '40' }).result.dieOpening, 40);
});

test('reserve applies once, and conversion/rounding never understates machine requirement', () => {
  const { result } = calculate({ margin: '0' });
  assert.equal(result.requiredKN, 157);
  close(result.requiredTonnes, 157 / 9.80665);
  assert.equal(calculate({ margin: '100' }).result.requiredKN, 314);
});

test('invalid numbers and custom die geometry do not produce Infinity or NaN results', () => {
  for (const field of ['thickness', 'length', 'strength']) {
    for (const value of ['', ' ', '0', '-1', 'NaN', 'Infinity', 'abc']) assert.equal(calculate({ [field]: value }).error, 'positiveNumbers');
  }
  for (const value of ['0', '-1', 'NaN', ' ', 'Infinity']) assert.equal(calculate({ dieOpening: value }).error, 'positiveNumbers');
  for (const value of ['', '-1', '101', 'NaN', 'Infinity']) assert.equal(calculate({ margin: value }).error, 'margin');
  assert.equal(calculate({ length: '1e300' }).error, 'overflow');
  assert.equal(calculate({ dieOpening: '9.99' }).error, 'narrowDie');
  assert.ok(calculate({ dieOpening: '10' }).result);
});

test('draft preserves angle, selected matrix and exact material strength in the URL', () => {
  const draft = { ...DEFAULT_PRESS_BRAKE_DRAFT, material: 'custom', thickness: '4', angle: '60', length: '2500', strength: '550', dieOpening: '40', margin: '20' };
  const params = new URLSearchParams();
  for (const [field, key] of Object.entries(CALCULATOR_PARAMS)) params.set(key, draft[field]);
  assert.deepEqual(readPressBrakeDraft(new URLSearchParams(params.toString())), draft);
  assert.deepEqual(readPressBrakeDraft(new URLSearchParams()), DEFAULT_PRESS_BRAKE_DRAFT);
});

test('panel selection uses material limits and never depends on hidden press inputs', () => {
  const draft = { ...DEFAULT_PRESS_BRAKE_DRAFT, method: 'panel', material: 'stainless', thickness: '1,5', angle: '', strength: '', dieOpening: '0', margin: '-5' };
  assert.deepEqual(panelBenderRequest(draft), { panel_bender: 'true', panel_material: 'stainless', panel_thickness: '1.5', bending_length: '1000,' });
  for (const field of ['thickness', 'length']) {
    for (const value of ['', ' ', '0', '-1', 'NaN', 'Infinity', '1e300']) assert.equal(panelBenderRequest({ ...draft, [field]: value }), null);
  }
  assert.equal(panelBenderRequest({ ...draft, material: 'custom' }), null);
});

test('switching methods clears incompatible filters, preserves catalog filters and resets pagination', () => {
  const press = bendingSelectionParams(new URLSearchParams('page=3&sort=price,DESC&is_stock=true'), DEFAULT_PRESS_BRAKE_DRAFT);
  const panelDraft = { ...DEFAULT_PRESS_BRAKE_DRAFT, method: 'panel' };
  const panel = bendingSelectionParams(press, panelDraft);
  assert.equal(panel.get('page'), '1');
  assert.equal(panel.get('sort'), 'price,DESC');
  assert.equal(panel.get('is_stock'), 'true');
  assert.ok(!panel.has('press_brake') && !panel.has('bending_force'));
  assert.deepEqual(readPressBrakeDraft(new URLSearchParams(panel.toString())), panelDraft);
  const returned = bendingSelectionParams(panel, DEFAULT_PRESS_BRAKE_DRAFT);
  assert.equal(returned.get('bending_force'), '181,');
  for (const key of ['panel_bender', 'panel_material', 'panel_thickness']) assert.ok(!returned.has(key));
  assert.equal(bendingSelectionParams(panel, { ...panelDraft, thickness: '' }), null);
});

test('method changes immediately filter machine type without applying unfinished parameters', () => {
  const current = bendingSelectionParams(new URLSearchParams('page=3&sort=price,DESC&is_stock=true'), DEFAULT_PRESS_BRAKE_DRAFT);
  current.set('page', '2');
  const draft = { ...DEFAULT_PRESS_BRAKE_DRAFT, method: 'panel', thickness: '', length: '0' };
  const params = bendingMethodParams(current, draft);
  assert.equal(params.get('bending_machine_type'), 'Панелегиб');
  assert.equal(params.get('page'), '1');
  assert.equal(params.get('sort'), 'price,DESC');
  assert.equal(params.get('is_stock'), 'true');
  for (const key of ['press_brake', 'panel_bender', 'bending_force', 'bending_length', 'panel_material', 'panel_thickness']) assert.ok(!params.has(key));
  assert.deepEqual(readPressBrakeDraft(new URLSearchParams(params.toString())), draft);
  const applied = bendingSelectionParams(params, { ...draft, thickness: '1', length: '1000' });
  assert.equal(applied.get('panel_bender'), 'true');
  assert.ok(!applied.has('bending_machine_type'));
  const presses = bendingMethodParams(applied, { ...draft, method: 'press' });
  assert.equal(presses.get('bending_machine_type'), 'Листогибочный пресс');
  assert.ok(!presses.has('panel_bender'));
});
