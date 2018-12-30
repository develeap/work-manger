'use strict';
// Terminology:
// Job - a set of tasks that need to be done
// Task - a single thing to do
// Id - a numerical task identifier
// A job is consisted of tasks. Each task has an id

const NO_MORE_WORK=-1;

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// to be loaded
var config={
  "myjob": {
  "from":1, // lowest task id
  "to":10, // highest task id
  data:[ // data piggybacked with ids (optional)
    "one","two","three","four","five",
    "six","seven","eight","nine","ten"
  ]}
};

// to be replaced by state driver
var state={
  "myjob": {
    "nextId":1, // the task id that is free to be taken
    "wip":[] // list of tasks that are still wip
  }
}

function isWip(jobName,taskId) {
  return state[jobName]["wip"][taskId];
}

function markAsWip(jobName,taskId) {
  state[jobName]["wip"][taskId]=true;
}

function markComplete(jobName,taskId) {
  delete state[jobName]["wip"][taskId];
}

function getNextTaskId(jobName) {
  var ret = state[jobName].nextId;
  state[jobName].nextId++;

  if (ret>config[name].to) return NO_MORE_WORK;
  markAsWip(jobName,ret);
  if (config[name].data) {
    return {
    "status": "up",
    "id": ret,
    "data": config[name].data[ret] };
  } else {
    return {
    "status": "up",
    "id": ret };
  }
}

// App
const app = express();

// Request for a task id
app.post('/job/:name', (req, res) => {
  var jobName = req.params["name"];
  return getNextTaskId(jobName);
});

// Request for a task id + mark previous task as done
app.post('/job/:name/:id', (req, res) => {
  var jobName = req.params["name"];
  var taskId = req.params["id"];
  var taskSummary = req.body;
  if (taskSummary!="") { save(jobName,taskId,taskSummary); }
  markComplete(jobName,taskId);
  return getNextTaskId(jobName);
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);