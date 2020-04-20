const entityType = {
  SUITE: 'suite',
  STEP: 'step',
  TEST: 'test',
  BEFORE_METHOD: 'BEFORE_METHOD',
  BEFORE_SUITE: 'BEFORE_SUITE',
  AFTER_SUITE: 'AFTER_SUITE',
  AFTER_METHOD: 'AFTER_METHOD',
};
const hookTypes = {
  BEFORE_ALL: 'beforeAll',
  BEFORE_EACH: 'beforeEach',
  AFTER_ALL: 'afterAll',
  AFTER_EACH: 'afterEach',
};
const hookTypesMap = {
  [hookTypes.BEFORE_EACH]: entityType.BEFORE_METHOD,
  [hookTypes.BEFORE_ALL]: entityType.BEFORE_SUITE,
  [hookTypes.AFTER_EACH]: entityType.AFTER_METHOD,
  [hookTypes.AFTER_ALL]: entityType.AFTER_SUITE,
};

module.exports = { entityType, hookTypes, hookTypesMap };
