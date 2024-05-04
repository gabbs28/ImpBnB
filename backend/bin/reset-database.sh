#!/usr/bin/env bash

# Drop schema (deletes everything)
./bin/drop-schema.js

# Create schema (creates database)
./bin/create-schema.js

# Use NPM to migrate (creates tables)
sequelize db:migrate

# Use NPM to seed (adds sample data)
sequelize db:seed:all