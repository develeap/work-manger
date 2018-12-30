Work Manager

What does this project solve?
If you need to partition a large batch job between several docker containers, this project gives you a simple solution.
Examples:
- Crunching a lot of data files with kubernetes
- Running many tests concurently with docker-compose up --scale

How does it work?
Work manager is a server that gives each working container a task at a time over http. All they need to do is ask.
Its advantages:
- Very simple to configure and execute
- Maintains list of work items done in transactional & persistent manner. You can stop and re-start your jobs safely.
- Support for multiple numeric and string work items
- Simple wrapper to push work items as parameters, if you rather not pull them over http
- Gathers job results in a folder
- Can function as the central compose process, in effect implementing a "fork-join" pattern

How do I use it?
- Configure it, depending on your use case
-- To just give out work item numbers
-- To also give string data, e.g. file names
- Start the docker container as part of your work cluster:
-- With docker-compose
-- With Kubernetes
- Use it from within your workers
-- By calling the REST API
-- By wrapping your app in our entry-point

Configuration
The work manager configuration is found in the file wm-config.
Option A: Assign a numeric range to the items
   numeric: <from>-<to>
for example:
   numeric: 0-999
Will assume 1000 work items numbered 0,1,...,999.

Option B: List of work items, one per line
   list:
   <item1>
   <item2>
   :
for example:
   list:
   ages_under_18.txt
   ages_18_25.txt
   ages_26_50.txt
   ages_over_50.txt
Will assume 4 work items numbered 1-4, each with a corresponding string (in this case, it looks like a file name)

Executing as a Docker container
The image is develeap/work-manager
You need to mount:
- The configuration file as /var/work-manager/config/wm-config
- A data volume on /var/work-manager/data
- An output volume for results on /var/work-manager/out

Use as part of a docker-compose.yml
A sample docker-compose.yml is found @here@
Since the work-manager shuts down once all work items are done, you can define it as the main docker container. 

Use as part of Kubernetes cluster
@@TBD@@

In any re-start event work manager will assume that work items that were in progress when it went down, are still under work.
If you want it to assume they need to be re-started, pass --wipe as a command line argument

REST API
  POST /job
    Get data for a work item - "start" work on it
  POST /job/{id}
    Mark job {id} as done and get data for a new work item.
    If request body is not empty, it will be stored in the out folder as a text file with the name {id}
    Any existing file with this name will be over-written
  Both return a json document:
    { "status": "up"
      "id": <numeric-job-id>,
      [optional]"data": <string-data>
    }
  If no work items are left to process, the document returned is
    { "status": "done"}
  
  GET /status
    returns server status. Mostly for progress indication.
    The status is a json document:
    {
      "configuration": {
        "type": "numerical"|"list",
        "from": <number>,
        "to": <number>
      }
      "totalItems":<number>,
      "itemsDone":<number>,
      "itemsPending":<number>,
      "itemsInProgress": [
        { "id": <id>, [optional] "data": <string> },
        :
      ]
    }
