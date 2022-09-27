const NUM_RULES = 20000;
const NUM_ITERATIONS = 200;

function getAverageAfterRemovingOutliers(arr) {
  const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length;
  let avg = average(arr);
  let std = Math.sqrt(
    arr.map((v) => Math.pow(v - avg, 2)).reduce((p, c) => p + c, 0) /
      (arr.length - 1)
  );
  let max_limit = avg + 3 * std;
  let min_limit = avg - 3 * std;
  return average(arr.filter((v) => v <= max_limit && v >= min_limit));
}

function expectMatch(url, result) {
  if (result.matchedRules.length == 0) {
    console.error(url + ' : Unexpected: NO match');
  }
}

function expectNoMatch(url, result) {
  if (result.matchedRules.length != 0 && result.matchedRules.length[0] != undefined) {
    console.error(url + ' : Unexpected match: ' + result.matchedRules.length[0]);
  }
}

function checkTestMatchOutcomePerformance(resolve) {
  // domain-1.example will be disabled in the first round
  var start1 = performance.now();
  chrome.declarativeNetRequest.testMatchOutcome(
    { url: test_urls[0], type: 'main_frame', method: 'get' },
    (result) => {

      if (test_context.disabled_rules_count_list[test_context.index] == 0) {
        expectMatch(test_urls[0], result);
      } else {
        expectNoMatch(test_urls[0], result);
      }

      let perf = performance.now() - start1;
      test_context.results[0][test_context.index].push(perf);

      // always-match.example will always match (never disabled)
      var start2 = performance.now();
      chrome.declarativeNetRequest.testMatchOutcome(
        { url: test_urls[1], type: 'main_frame', method: 'get' },
        (result) => {
          let perf = performance.now() - start2;
          test_context.results[1][test_context.index].push(perf);

          expectMatch(test_urls[1], result);

          // do-not-match.example does not match any rules
          var start3 = performance.now();
          chrome.declarativeNetRequest.testMatchOutcome(
            { url: test_urls[2], type: 'main_frame', method: 'get' },
            (result) => {
              let perf = performance.now() - start3;
              test_context.results[2][test_context.index].push(perf);

              expectNoMatch(test_urls[2], result);

              if (test_context.iteration >= 200) {
                test_context.index += 1;
                new Promise(startTest);
              } else {
                test_context.iteration += 1;
                new Promise(checkTestMatchOutcomePerformance);
              }
            });
        });
    });
}

function startTest(resolve) {
  if (test_context.index >= test_context.disabled_rules_count_list.length) {
    console.error('Test finished');
    console.error('Results for a disabled rule match');
    for (const [i, perfs] of Object.entries(test_context.results[0])) {
      console.error("Result for " + test_context.disabled_rules_count_list[i] + " : " +
        getAverageAfterRemovingOutliers(perfs));
    }
    console.error('Results for always match');
    for (const [i, perfs] of Object.entries(test_context.results[1])) {
      console.error("Result for " + test_context.disabled_rules_count_list[i] + " : " +
        getAverageAfterRemovingOutliers(perfs));
    }
    console.error('Results for never match');
    for (const [i, perfs] of Object.entries(test_context.results[2])) {
      console.error("Result for " + test_context.disabled_rules_count_list[i] + " : " +
        getAverageAfterRemovingOutliers(perfs));
    }
  } else {
    let disabled_rules_count = test_context.disabled_rules_count_list[test_context.index];
    test_context.results[0][test_context.index] = [];
    test_context.results[1][test_context.index] = [];
    test_context.results[2][test_context.index] = [];
    test_context.iteration = 0;
    let option = {
      rulesetId: 'ruleset',
      disableRuleIds: [],
      enableRuleIds: []
    };

    if (disabled_rules_count == 0) {
      option.enableRuleIds = Array.from({ length: NUM_RULES }, (_, i) => i + 1);
      console.error('Enable all rules');
    } else {
      option.disableRuleIds = Array.from({ length: disabled_rules_count }, (_, i) => i + 2);
      console.error('Disable ' + disabled_rules_count + ' rules');
    }

    chrome.declarativeNetRequest.updateStaticRules(option, checkTestMatchOutcomePerformance);
  }
}

const STEP = 100;
var baseArray = Array.from({ length: Math.floor(NUM_RULES / 1000 + 1) }, (_, i) => i * STEP);

var test_context = {
  index: 0,
  iteration: 0,
  disabled_rules_count_list:
    [0, NUM_RULES / 2, 0, NUM_RULES / 2, 0].concat(baseArray),
  results: [[], [], []]
};

var test_urls = [
  'https://domain-1.example/',
  'https://always-match.example/',
  'https://do-not-match.example/'
]

console.error('Start test');

new Promise(startTest);
