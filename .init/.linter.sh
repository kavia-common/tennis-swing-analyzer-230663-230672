#!/bin/bash
cd /home/kavia/workspace/code-generation/tennis-swing-analyzer-230663-230672/tennis_swing_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

