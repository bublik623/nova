# Maintenance Mode in NOVA

We can toggle the maintenance mode in a given NOVA environment by flipping the `MAINTENANCE_MODE` boolean in the .env files.
 
 ## Enable Maintanence
- git checkout master
- git checkout -b release/21-02-2024-enable
- change maintanence for prod to true
- git commit "chore: enable maintanence"
- git push

This will create a pipeline without needing to create a merge request. Once the prod build is ready you can click "deploy to prod".

## Disable the maintenance
- git checkout master
- git checkout -b release/21-02-2024-disable
- change maintanence for prod to false
- git commit "chore: disable maintanence"
- git push

When maintenance is done, click "deploy to prod".