# Integration testing strategy

* Status: Accepted
* Deciders: @tommaso.bartolucci @dario.castiglione @gabriele.fazio
* Date: 2022-06-24

## Context and Problem Statement

We want to test the pages of our application with integrations/e2e tests, by running the full application, mocking only the BE apis and testing the user interactions. We should decide which framework is the best for this purpose.

## Decision Drivers 

* We should be able to run these tests frequently, ideally every commit/push, so the solution needs to be as fast as possible
* We should be able to run the test suite in the CI pipeline

## Considered Options

* [@nuxt/test-utils](https://v3.nuxtjs.org/guide/going-further/testing/)
* [Playwright](https://playwright.dev/docs/intro)
* [TestCafe](https://testcafe.io/documentation/402635/getting-started)

## Decision Outcome

Chosen option: `@nuxt/test-utils`, because it provides the tools needed to test pages as if we're running the whole application in the browser. Under the hood, Nuxt test utils uses Playwright to carry out browser testing, so we will have the capability of an e2e framework, without having to develop a full e2e test suite.

## Pros and Cons of the other Options

### Playwright

Since, at the time of writing, `@nuxt/test-utils` fot Nuxt 3 is not yet fully implemented, we've considered to use Playwright as our testing framework, to be able, at a later stage, to move to `@nuxt/test-utils` without much effort.

### TestCafe

We've also considered TestCafe, since it's used in other TUI MM projects.

* Good, because the QA team is using it in some projects for e2e tests, so in the future if we need to move to TestCafe as the e2e framework, we can easily migrate these tests
* Good, because it has a good documentation
* Bad, because it requires to run the application server in a separate shell
* Bad, because mocking the API requests it's not very straight-forward
* Bad, because test execution is quite slow
