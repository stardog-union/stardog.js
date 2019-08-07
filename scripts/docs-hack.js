const fs = require('fs');
const path = require('path');

const docsIndexPath = path.join(__dirname, '..', 'docs', 'index.html');
const docsIndexHtml = fs.readFileSync(docsIndexPath, 'utf8');
// We want the docs index page to always load with "Only Exported" checked, so
// that non-exported (superfluous) API docs don't show by default. Our doc
// generator, typedoc, has a `--excludeNotExported` flag that _should_ do this
// for us, but unfortunately it doesn't work correctly with destructured
// function arguments, so it makes the docs much less useful. This is a hack to
// work around that deficiency.
const scriptToInject = `
<script>
(function() {
  var onlyExportedCheckbox = document.getElementById('tsd-filter-only-exported');
  if (onlyExportedCheckbox && !onlyExportedCheckbox.checked) {
    onlyExportedCheckbox.click();
  }
}())
</script>
`;
fs.writeFileSync(docsIndexPath, docsIndexHtml.replace('</body>', `${scriptToInject}\n</body>`));
