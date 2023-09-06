[![Build Status](https://app.travis-ci.com/mustafaAwwal/awwal-dummy-db.svg?branch=main)](https://app.travis-ci.com/mustafaAwwal/awwal-dummy-db)

# Dummy DB(@awwal/dummy-db)

A simple dummy db. It is a simple javascript array based database which can help you a lot with mocking. It can do:

- Create mock data based on the schema provided.
- Has out of the box utilities to generate fake names, emails, age, auto increment id etc.
- Its easy to use and manipulate since it is all js arrays.
- You can create table, add, delete, update, get all, or query specific elements.
- Really easy to use.
- Much more easier to maintain. You have a new field just update the schema and it will generate mock data accordingly. No need to pollute your repo with mocks.

## Installation

```
// With npm
npm install --save-dev @awwal/dummy-db
// With yarn
yarn install --dev @awwal/dummy-db
```

## Usage

### Creating a table

So, lets say we want to mock a user table with structure as follows:

```javascript
const user = {
  name: "Mustafa Awwal",
  email: "mustafa_awwal@gmail.com",
  age: 25,
  birthday: "07/07/1998",
  birthPlace: "Pakistan",
};
```

To mock something like this we just need to call the create table function and create a schema accordingly

```javascript
import { createTable } from "@awwal/dummy-db";

const userTable = createTable({
  name: "name",
  email: "email",
  age: "age",
  birthday: "date",
  birthPlace: "country",
});
```

So, what we did here we created a table and told it that:

- The name field is a name
- The email field would be an email
- The age will be a number between 0-100
- The field birthday would be a date
- The birthPlace would be a country.

This way the createTable function knows how to generate mock data. The end result would be.

```javascript
userTable.getAll();
// output: []

// This would add a single dummy entry into the table
userTable.addDummy();

// So, lets see what the data looks like
userTable.getAll();
/**
 * output:
 * [
 * {
 *   name: 'Odette Kalindi',
 *   email: 'Leone@google.com',
 *   age: 19,
 *   birthday: '9/6/2023',
 *   birthPlace: 'Kuwait'
 * }
 * ]
 * */
```

### Other out of the box fields

There are a lot of out of the box fields to auto generate:

```javascript
import { createTable } from "@awwal/dummy-db";

createTable({
  // generates a name
  name: "name",
  // generates a random string
  string: "string",
  // generates a number between 0 - 100000
  number: "number",
  // generates a date
  date: "date",
  // generates a boolean value
  boolean: "boolean",
  // generates a unique id
  id: "id",
  // generates a country
  country: "country",
  // generates a number between 0 - 100
  age: "age",
  // generates a lorem ipsum description
  description: "description",
  //generates a random email for you
  email: "email",
  // generate an array of string (could be any of the types above instead of string example: name, email etc.)
  array: ["string"],
  // generate nested fields
  nested: {
    nestedName: "name",
    nestedEmail: "email",
    // you can go as deep as you want
    deeplyNested: {
      deeplyNestedName: "name",
    },
  },
  // generate array of objects
  complexArray: [
    {
      arrayName: "name",
      arrayEmail: "email",
    },
  ],
});
```

### Custom fields

So, you don't see a field you need. No worries we got you covered each field also accepts a function:

```javascript
import { createTable } from "@awwal/dummy-db";

createTable({
  // So, any time you generate dummy this field would have 'red lobster' as value
  lobster: () => "red lobster",
  // This works everywhere:
  // in arrays
  lobsters: [() => "red lobsters"],
  // in objects
  lobsterFamily: () => ({ father: "lobster john", son: "lobster john jr" }),
  // or even in nested fields
  nestedLobsters: {
    name: () => "nested lobster",
  },
});
```

### Advance out of the box dummy data generators

We even export some helper functions as well for complex types to generate:

```javascript
import {
  createTable,
  autoIncrementId,
  autoIncrementName,
} from "@awwal/dummy-db";

createTable({
  // Generates auto increment 1,2,3,4.....
  autoIncrementId: autoIncrementId(),
  // Generates auto increment name model 1,model 2,model 3,model 4.....
  autoIncrementName: autoIncrementName("model"),
  // Generates auto increment id with string type '1','2','3','4'.....
  autoIncrementId: autoIncrementId("string"),
});
```

### Manipulating a table

The table also has some awesome utility functions:

```javascript
import { createTable } from "@awwal/dummy-db";

const userTable = createTable({
  name: "name",
  email: "email",
  age: "age",
  birthday: "date",
  birthPlace: "country",
});

// Populates the table with dummy data. Default behavior is it adds 10 dummy entries
userTable.populate();

// Returns all of the dummy data: [{...},{...},{...},{...},{...},{...},{...},{...},{...},{...}]
userTable.getAll();

// Returns the first entry {...}
userTable.getFirst();

// Returns based on query. Throws an error if not found
userTable.get({ name: "some name" });

// Update user based on query. Throws error if user not found
userTable.update({ name: "some name" }, { name: "new name" });

// Remove entry based on query
userTable.remove({ name: "some name" });

// Logs table data
userTable.log();

// Reset table value. Resets to []
userTable.reset();

// Adds a single dummy entry
userTable.addDummy();
```

### One consolidated API

So, what if you have multiple tables and want one consolidated API. You can create a database:

```javascript
import { createTable, createDatabase } from '@awwal/dummy-db';

const firstTable = createTable({...});
const secondTable = createTable({...});
const thirdTable = createTable({...});

const db = createDatabase(firstTable, secondTable, thirdTable);

// Populate all tables
db.populate();

// Logs all tables
db.log();

// Reset all tables
db.reset()
```

### Excellent typescript support

The library has excellent typescript support

```javascript
import { User } from "your-types";
import { Schema } from "@awwal/dummy-db";

// It will auto complete the fields from your type and then you can assign what to generate.
const UserSchema: Schema<User> = {
  name: "string",
  email: "email",
};

// All of the table methods will have updated types
const userTable = createTable(UserSchema);
```
