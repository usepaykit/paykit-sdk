#!/bin/bash

npm run build

if [ "$1" = "--tag" ] && [ "$2" = "beta" ]; then
  npm publish --tag beta
else
  npm version patch
  npm publish
fi