---
name: add-new-section
description: "Use when adding a new homepage section in this website, including HTML section block, markdown content file, JS loader update, and nav anchor wiring. Trigger words: add section, new section, add module, 新增章节, 新增模块, 添加版块"
---

# Add New Section Skill

## Goal
Add a new content section to this static academic site so it renders from Markdown automatically.

## Project Pattern
This site loads section content files from contents/ and injects rendered HTML through static/js/scripts.js.

The loader supports two content formats for each section name X:
- Preferred for complex layouts: contents/X.html
- Fallback for text-first sections: contents/X.md

The loader tries X.html first, then falls back to X.md.

Current loading list example:
- home
- publications
- researchexperience
- awards

For each section name X:
- Content source file: contents/X.html or contents/X.md
- Target container id: X-md
- HTML section id: X
- Nav anchor href: #X

## Standard Steps
1. Choose a section id
- Use lowercase and no spaces.
- Keep the same id in all files (HTML, JS, nav, and content filename).

2. Create content file
- For text-first content, add contents/<section-id>.md.
- For custom card layouts, timelines, or richer HTML structures, add contents/<section-id>.html.
- Keep the filename exactly aligned with the section id.

3. Add section block in index.html
- Add a section with id=<section-id>.
- Add content container div with id=<section-id>-md.
- Optional subtitle id follows pattern: <section-id>-subtitle.

Template:
```html
<section class="bg-gradient-primary-to-secondary-light mt5 md5" id="<section-id>">
  <div class="container px-5">
    <header>
      <h2 id="<section-id>-subtitle"><i class="bi bi-file-text-fill"></i>&nbsp;SECTION TITLE</h2>
    </header>
    <div class="main-body" id="<section-id>-md"></div>
  </div>
</section>
```

4. Add nav item in index.html
- Add href="#<section-id>".
- Make sure it exactly matches the section id.

Template:
```html
<li class="nav-item">
  <a class="nav-link me-lg-3" href="#<section-id>">SECTION TITLE</a>
</li>
```

5. Register section in static/js/scripts.js
- Add <section-id> to section_names array.
- Keep missing-target guard so commented sections do not break loading.
- The loader should try .html before .md so complex sections can use raw HTML safely.

Template:
```javascript
const section_names = ['home', 'publications', '<section-id>', 'awards'];
const content_extensions = ['html', 'md'];

function fetchSectionContent(name) {
  const tryExtension = (index) => {
    if (index >= content_extensions.length) {
      throw new Error('Unable to load content for section: ' + name);
    }

    const extension = content_extensions[index];
    return fetch(content_dir + name + '.' + extension).then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          return tryExtension(index + 1);
        }

        throw new Error('Failed to load ' + name + '.' + extension + ': ' + response.status);
      }

      return response.text().then((content) => ({ extension, content }));
    });
  };

  return tryExtension(0);
}

section_names.forEach((name) => {
  const target = document.getElementById(name + '-md');
  if (!target) {
    return;
  }

  fetchSectionContent(name)
    .then(({ extension, content }) => {
      target.innerHTML = extension === 'html' ? content : marked.parse(content);
    })
    .then(() => {
      MathJax.typeset();
    })
    .catch((error) => console.log(error));
});
```

## Validation Checklist
- The new section exists in DOM: document.querySelector('#<section-id>-md') is not null.
- The section container receives rendered HTML after load.
- Clicking nav item scrolls to the section.
- Browser console has no 404 for the expected content file.
- Browser console has no id mismatch errors.

## Common Pitfalls
- Nav href mismatch (for example #research-experience vs #researchexperience).
- Markdown filename and section id mismatch.
- Section block commented out in HTML while still listed in JS.
- Forgetting to add section id to section_names array.
- Putting complex raw HTML into a .md file when it should be a .html file.

## Quick Add Recipe
1. Add contents/<section-id>.md for simple content, or contents/<section-id>.html for custom layouts.
2. Add section block in index.html with id and <section-id>-md.
3. Add nav link with href="#<section-id>".
4. Add <section-id> to section_names in static/js/scripts.js.
5. Refresh page and verify in DevTools.
