# Changelog

## 0.10.0 (2022-09-08)

- upgrade react to version 17, and rxjs to version 7

## 0.9.0 (2019-08-28)

- `useRxContainer` hook, as alternative to `connect` function
- *breaking* restricting what can be accessed from `controller`, limiting it to only `props` (instead of wrapper component instance)

## 0.8.0 (2019-08-27)

- better type coverage
- *breaking* removed `combineProps` feature automatically removing `$` at end of variable, in exchange - now result type is correctly inferred from argument types

## 0.7.0 (2018-01-28)

- TypeScript
- *breaking* remove deprecated `createContainer`

## 0.6.2 (2018-09-04)

- Babel 7

## 0.6.1 (2018-06-21)

- hoist-non-react-statics (#8) (Pavlos Vinieratos)
- deps updates

## 0.6.0 (2018-04-26)

- Remove usage of lifecycle hooks deprecated in react v 16.3 (https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#adding-event-listeners-or-subscriptions)
- rxjs v6

## 0.5.0 (2017-10-28)

Start using RxJS pipeable operators.

## 0.4.1 (2017-10-07)

Update react peer dependency. Dev tooling updates

## 0.4.0 (2017-09-18)

Start using rollup to bundle library for distribution

## 0.3.0 (2017-08-06)

Introduce HoC connecting RxJS logic to React Component.
In comparison `createContainer` in previous versions this should provide:
  - better testing possibilities for logic by allowing to separate it from view
  - React Components are easier to compose

As a drawback comparing to previous approach - it will not wait for data before render,
 but I think it is better to handle this kind of logic separately. 

### Features
 
- `connect` function for creating HoC component from react component and function Observable with properties  
- `combineProps` helper function to create properties observable from observables, observers and static props 
- refactor `createContainer` to use `combineProps` internally
- deprecate `createContainer` in favor of creating HoC using newly introduced functions
  
### Bugfix
 
- fix possible memory leak when rendering server-side
 
## 0.2.2 (2017-05-20)

- move rxjs and prop-types to peerDependencies
- update deps
- switch to loose compilation mode

## 0.2.1  (2017-04-09)
         
- use RxJS in modular way(reducing resulting bundle size)
         
## 0.2.0  (2016-12-20)

Upgrade to RxJS v5

## 0.1.4  (2016-04-06)

Bugfix, performance improvements, documentation

## 0.1.0  (2015-12-05)

Initial release
