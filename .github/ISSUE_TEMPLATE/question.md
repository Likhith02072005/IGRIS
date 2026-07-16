name: Question / Discussion
description: Ask a usage question or start a platform discussion.
title: "[QUESTION] "
labels: ["question"]
assignees: []
body:
  - type: textarea
    id: question
    attributes:
      label: What is your question?
      description: Explain what you are trying to understand or configure.
    validations:
      required: true
  - type: textarea
    id: context
    attributes:
      label: Platform Context
      description: Share any config settings, strategy details, or logs that help explain.
