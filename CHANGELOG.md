## 3.0.0 (unreleased)

- Escape spreadsheet formula prefixes in values and column names by default,
  including leading whitespace, control characters and full-width Unicode variants.
  Thanks to Kai Aizen (SnailSploit) for reporting CSV formula injection in 1.3.6.
- Add `new ObjectsToCsv(data, { escapeFormulas: false })` for explicitly opting into
  raw output. Numeric values remain numeric; potentially dangerous strings gain a
  leading apostrophe. This changes the output for existing callers.
- Require Node.js 18 or newer. Replace `async-csv` and its CSV package bundle with
  `csv-stringify` 6.9, and replace Jest with Node's built-in test runner.
- Keep the stable 1.x `toString()` and `toDisk()` APIs. The experimental 2.0.0
  version was already published under the `next` tag.
- Use asynchronous filesystem operations, preserve the requested BOM on overwrite,
  and avoid the function argument limit when exporting large arrays.
- Reject null, array and sparse rows at construction; add regression tests and CI.
- Limit published files to the runtime, README, changelog, package metadata and license.

## 1.3.6

- Fix vulnerable package (handlebars) in dependency

## 1.3.5

- Fix vulnerable packages reported by GitHub and `npm audit`
