name: Documentation Issue
description: Report a documentation error or suggest an addition.
title: "[DOCS] "
labels: ["documentation"]
assignees: []
body:
  - type: textarea
    id: problem
    attributes:
      label: Description of the documentation issue
      description: What is incorrect or missing in the current documentation?
    validations:
      required: true
  - type: textarea
    id: suggestions
    attributes:
      label: Suggested Improvements
      description: How should this documentation page be improved or expanded?
