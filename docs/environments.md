# Environments

Each environment has a different purpose and uses different api source:

| ENVIRONMENT \ TASK | URL                          | API_URL                                  | NEED VPN               |
| ------------------ | ---------------------------- | ---------------------------------------- | ---------------------- |
| LOCAL DEVELOPMENT  | https://localhost:3000       | https://nova-api-gateway.test.tui-mm.com | Yes                    |
| integration tests  | https://localhost:3000       | Mocked                                   | No                     |
| QA                 | https://nova.test.tui-mm.com | https://nova-api-gateway.test.tui-mm.com | Yes                    |
| PRE                | https://nova.pre.tui-mm.com  | https://nova-api-gateway.pre.tui-mm.com  | Yes                    |
| PRODUCTION         | https://nova.tui-mm.com      | https://nova-api-gateway.tui-mm.com      | No                     |
