# Types of test

| Test Type   | Status | API Source    | CI           | Environment | Tools                        |
| ----------- | ------ | ------------- | ------------ | ----------- | ---------------------------- |
| Unit        | Active | -             | Every commit | -           | Vitest + Vue Testing Library |
| Integration | Active | Mocked API    | Every commit | -           | Playwright                   |
| Performance | _TBD_  | _TBD_         | _TBD_        | Local       | Lighthouse CI                |
| E2E         | _TBD_  | Back-end Qual | _TBD_        | Qual        | _TBD_                        |

## How to run these test?

You can read [Environment setup and commands](commands-scripts.md#run-tests).

## How to write tests?

Please, read our [Standards for testing](https://confluence.tuigroup.com/display/PROD/Testing).

## How to test manually on qual?

You can test Nova in a test environment here: https://nova-test.tui-mm.com/

> Note: make sure you have Tui's VPN enabled
