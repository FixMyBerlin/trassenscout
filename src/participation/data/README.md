## How to generate type definitions from the json schema

1. Install [jq](https://stedolan.github.io/jq/)

        curl https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 -o ~/bin/jq
        chmod u+x ~/bin/jq

2. Install [json2ts](https://github.com/bcherny/json-schema-to-typescript)

        npm install -global json-schema-to-typescript

3. Generate type definitions

       DIR=src/participation/data
       cat $DIR/schema.json |
       jq 'delpaths([["properties", "pages", "items", "properties", "questions", "items", "allOf"]])' |
       json2ts > $DIR/types.ts
