# Declarative Net Request: disable individual static rules (Extension to check testMatchOutcome performance with disabled rules)

The extension checks the testMatchOutcome() performance by changing the number of disabled rules in a static ruleset.

The static ruleset contains 20000 rules, The half of the rules (10000 rules) can be collected as the candidate rules for the test url. And all the candidate rules will not be matched.

This extension checks the testMatchOutcome() performance with different disabled rules
- No disabled rule
- 10 disabled rules
- 100 disabled rules
- 1000 disabled rules
- 10000 disabled rules

It checks the method call performance 30 times for each cases, and print the average result to the console.error

## How to use this extension

- Launch Chromium.
- Go to `More tools > Extensions`
- Click on `Load unpacked`
- Select the `extension` folder on this project.
- The output of the extension will be shown as log messages in the extension's `Errors` section.

