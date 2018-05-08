'use strict';

define('cw2/tests/app.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | app');

  QUnit.test('app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'app.js should pass ESLint\n\n');
  });

  QUnit.test('components/connect-4.js', function (assert) {
    assert.expect(1);
    assert.ok(false, 'components/connect-4.js should pass ESLint\n\n103:7 - \'draw\' is assigned a value but never used. (no-unused-vars)\n295:5 - \'createjs\' is not defined. (no-undef)\n296:5 - \'createjs\' is not defined. (no-undef)\n297:5 - \'createjs\' is not defined. (no-undef)\n303:21 - \'createjs\' is not defined. (no-undef)\n305:21 - \'createjs\' is not defined. (no-undef)\n342:27 - \'createjs\' is not defined. (no-undef)\n354:30 - \'createjs\' is not defined. (no-undef)\n369:5 - \'createjs\' is not defined. (no-undef)\n398:11 - \'createjs\' is not defined. (no-undef)\n409:11 - \'createjs\' is not defined. (no-undef)\n443:15 - \'createjs\' is not defined. (no-undef)\n448:15 - \'createjs\' is not defined. (no-undef)\n481:9 - \'createjs\' is not defined. (no-undef)\n501:11 - \'createjs\' is not defined. (no-undef)\n502:11 - \'createjs\' is not defined. (no-undef)\n504:9 - \'createjs\' is not defined. (no-undef)\n505:9 - \'createjs\' is not defined. (no-undef)\n507:9 - \'createjs\' is not defined. (no-undef)');
  });

  QUnit.test('resolver.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'resolver.js should pass ESLint\n\n');
  });

  QUnit.test('router.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'router.js should pass ESLint\n\n');
  });

  QUnit.test('routes/game.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'routes/game.js should pass ESLint\n\n');
  });
});
define('cw2/tests/helpers/destroy-app', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = destroyApp;
  function destroyApp(application) {
    Ember.run(application, 'destroy');
  }
});
define('cw2/tests/helpers/module-for-acceptance', ['exports', 'qunit', 'cw2/tests/helpers/start-app', 'cw2/tests/helpers/destroy-app'], function (exports, _qunit, _startApp, _destroyApp) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (name) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    (0, _qunit.module)(name, {
      beforeEach: function beforeEach() {
        this.application = (0, _startApp.default)();

        if (options.beforeEach) {
          return options.beforeEach.apply(this, arguments);
        }
      },
      afterEach: function afterEach() {
        var _this = this;

        var afterEach = options.afterEach && options.afterEach.apply(this, arguments);
        return Ember.RSVP.resolve(afterEach).then(function () {
          return (0, _destroyApp.default)(_this.application);
        });
      }
    });
  };
});
define('cw2/tests/helpers/start-app', ['exports', 'cw2/app', 'cw2/config/environment'], function (exports, _app, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = startApp;
  function startApp(attrs) {
    var attributes = Ember.merge({}, _environment.default.APP);
    attributes.autoboot = true;
    attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

    return Ember.run(function () {
      var application = _app.default.create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
      return application;
    });
  }
});
define('cw2/tests/test-helper', ['cw2/app', 'cw2/config/environment', '@ember/test-helpers', 'ember-qunit'], function (_app, _environment, _testHelpers, _emberQunit) {
  'use strict';

  (0, _testHelpers.setApplication)(_app.default.create(_environment.default.APP));

  (0, _emberQunit.start)();
});
define('cw2/tests/tests.lint-test', [], function () {
  'use strict';

  QUnit.module('ESLint | tests');

  QUnit.test('helpers/destroy-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/destroy-app.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/module-for-acceptance.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/module-for-acceptance.js should pass ESLint\n\n');
  });

  QUnit.test('helpers/start-app.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'helpers/start-app.js should pass ESLint\n\n');
  });

  QUnit.test('test-helper.js', function (assert) {
    assert.expect(1);
    assert.ok(true, 'test-helper.js should pass ESLint\n\n');
  });
});
require('cw2/tests/test-helper');
EmberENV.TESTS_FILE_LOADED = true;
//# sourceMappingURL=tests.map
