# CI Pipeline

## Diagram legend

```text
yellow block - automatic action
grey block - manual actions
```

## Pipeline for commit on any branch

```plantuml
@startuml
title
Pipeline for commit on any branch
end title

|Build|
start
split
:Build app;
split again
:Build docker image;
end split
|Test|
split
:Unit test;
split again
:Integration test;
end split
stop
@enduml
```

## Pipeline on merge request creation/update

```plantuml
@startuml
title
Pipeline on merge request creation/update
end title

|Build|
start
split
:Build app;
split again
:Build docker image;
end split
|Test|
split
:Unit test;
split again
:Integration test;
end split
|Sonar|
:Run Sonar analysis;
|Docker|
:Publish docker image;
|QA|
#lightgrey:Trigger QA pipeline;
stop
@enduml
```

## Pipeline for commit on master branch

```plantuml
@startuml
title
Pipeline for commit on master branch
end title

|Build|
start
split
:Build app;
split again
:Build docker image;
end split
|Test|
split
:Unit test;
split again
:Integration test;
end split
|Deploy|
split
:Deploy (test);
end split
|Docker|
:Publish docker image;
stop
@enduml
```
