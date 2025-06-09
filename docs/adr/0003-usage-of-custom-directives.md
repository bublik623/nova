# Usage of custom Directives

* Status: accepted
* Deciders: @tommaso.bartolucci @mesut.koca @nico.luisetto

## Context and Problem Statement

Are we considering custom Directives as a viable option or are we sticking with Components and Composables also for DOM manipulation?

## Decision Drivers

* Ease of use
* Flexibility
* Potential pitfalls
* Community sentiment

## Considered Options

* Allow usage of custom Directives only for simpler cases that do not require statefulness
* Allow usage of custom Directives regardless of the complexity
* Never

## Decision Outcome

Chosen option: "Never", because:

* anything that can be done with custom directives can be done with Components or Composables as demonstrated by many component libraries targeting Vue 3 (for example [chakra-ui](https://vue.chakra-ui.com/))
* Components and Composables are way more flexible than custom Directives
* it avoids completely the risk of having custom directives that fails to unregister from events or any other potential issue that comes with custom directives
* it doesn't impact the learning curve
