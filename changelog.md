# Changelog

##0.4.0 (2017-09-18)

Start using rollup to bundle library for distribution

##0.3.0 (2017-08-06)

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
 
##0.2.2 (2017-05-20)

- move rxjs and prop-types to peerDependencies
- update deps
- switch to loose compilation mode

##0.2.1  (2017-04-09)
         
- use RxJS in modular way(reducing resulting bundle size)
         
##0.2.0  (2016-12-20)

Upgrade to RxJS v5

##0.1.4  (2016-04-06)

Bugfix, performance improvements, documentation

##0.1.0  (2015-12-05)

Initial release
