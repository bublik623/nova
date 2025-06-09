# Architectural Decision Log

To make and record architectural decisions, we are using [MADR (Markdown Architectural Decision Records)](https://adr.github.io/).

This log lists all architectural decisions for this project:

<!-- adrlog -- Regenerate the content by using "adr-log -i". You can install it via "npm install -g adr-log" -->

* [ADR-0000](0000-use-markdown-architectural-decision-records.md) - Use Markdown Architectural Decision Records
* [ADR-0001](0001-integrations-testing-strategy.md) - Integration testing strategy
* [ADR-0002](0002-rich-text-editor-library.md) - Rich Text Editor library
* [ADR-0003](0003-usage-of-custom-directives.md) - Usage of custom directives

<!-- adrlogstop -->

## Create a new ADR

To create a new ADR:

1. Copy `docs/adr/template.md` to `docs/adr/NNNN-adr-title.md`, where NNNN indicates the next number in sequence. Please use **only lowercase characters**, upper characters could create problems with links from ADL.
2. Edit `docs/adr/NNNN-adr-title.md`
3. Update ADL (`docs/adr/index.md`) running 

    ```bash
    npm run adr
    ```

General information about Architectural Decision Records is available at <https://adr.github.io/>.

More information on MADR (Markdown ADR) is available at <https://adr.github.io/madr/>.

<!-- markdownlint-disable-file MD013 -->
