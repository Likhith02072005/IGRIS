name: Performance Issue
description: Report a latency drift, memory issue, or execution bottleneck.
title: "[PERF] "
labels: ["performance"]
assignees: []
body:
  - type: textarea
    id: description
    attributes:
      label: Performance Bottleneck Description
      description: Describe the execution lag, latency spike, or excessive CPU/memory utilization.
    validations:
      required: true
  - type: textarea
    id: environment
    attributes:
      label: System Environment
      description: OS version, browser, hardware, number of active strategy nodes.
    validations:
      required: true
  - type: textarea
    id: steps
    attributes:
      label: Steps to reproduce performance issue
      description: What setup or load triggers this behavior?
