# Rich Text Editor library

* Status: Accepted
* Deciders: @tommaso.bartolucci @dario.castiglione @gabriele.fazio
* Date: 2022-08-03

Technical Story: [OFF-118](https://jira.tuigroup.com/browse/OFF-118)

## Context and Problem Statement

We need to choose a Rich Text Editor library that will allow us to create a text editor component to be used in Nova.
We are referencing to this [Figma file](https://www.figma.com/file/2Bwsy4uf5JJYhT78M84Olq/NOVA-Library?node-id=47%3A319) for the final design, keeping in consideration that in the future we could need to implement additional features like Glossary, Autosuggestion, etc...

## Decision Drivers

* Open Source
* Fully customizable
* Extendable with additional features
* Easy integration with Vue 3
* Typescript support
* Good documentation and support

## Considered Options

* [TipTap](https://tiptap.dev/)
* [ProseMirror](https://prosemirror.net/)
* [Quill](https://quilljs.com/)

## Decision Outcome

TipTap, because it's built on top of ProseMirror and provides its powerful API, it's fully customizable and it can be easily integrated with Vue 3. 

## Pros and Cons of the Options

### TipTap

* Good, because it's fully customizable and extendable
* Good, because it has good support and documentation
* Good, because supports multiple output formats (HTML, JSON, Y.js)
* Good, because it provides Typescript and Vue 3 support out-of-the-box
* Good, because it supports collaborative editing
* Bad, because some of the extensions and resources are available only for paid plans
* Bad, because it's still in Beta

### ProseMirror

* Good, because it's fully customizable and extendable
* Good, because it has good support and documentation
* Good, because it supports collaborative editing
* Bad, because it requires a lot of code to just implement a simple text editor

### Quill

* Good, because it's fully customizable and extendable
* Good, because it has good support and documentation
* Good, because it supports collaborative editing
* Bad, because it doesn't provide Vue 3 support out-of-the-box (there are some wrapper libraries in Beta)
* Bad, because TS support is not really good 
* Bad, because last update was over 2 years ago 

<!-- markdownlint-disable-file MD013 -->
