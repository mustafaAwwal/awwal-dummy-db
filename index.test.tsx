import {
  autoIncrementId,
  autoIncrementName,
  createDatabase,
  createDummyRecursive,
  createTable,
  oneOf,
  Schema,
} from ".";

type User = {
  id: string;
  name: string;
  birthday: string;
};

const UserSchema: Schema<User> = {
  id: "id",
  name: "name",
  birthday: "date",
};

type Parent = {
  id: string;
  name: string;
  childName: string;
};

const ParentSchema: Schema<Parent> = {
  id: "id",
  name: "name",
  childName: "name",
};

const tableSetup = () => createTable(UserSchema);

const databaseSetup = () => {
  const userTable = createTable(UserSchema);
  const parentTable = createTable(ParentSchema);
  const db = createDatabase(parentTable, userTable);
  return { userTable, parentTable, db };
};

describe("Table", () => {
  it("should be empty initially", () => {
    const table = tableSetup();
    expect(table.getAll()).toHaveLength(0);
  });

  it("should populate the table", () => {
    const table = tableSetup();

    table.populate();
    expect(table.getAll()).toHaveLength(10);
  });

  it("should clear the table", () => {
    const table = tableSetup();

    table.populate();
    expect(table.getAll()).toHaveLength(10);
    table.reset();
    expect(table.getAll()).toHaveLength(0);
  });

  it("should remove a specific entry", () => {
    const table = tableSetup();
    table.populate();
    const entryToBeRemoved = table.getAll()[5];
    expect(table.get({ id: entryToBeRemoved.id })).toBeTruthy();
    table.remove(entryToBeRemoved);
    expect(() => table.get({ id: entryToBeRemoved.id })).toThrowError();
  });

  it("should add dummy data to table", () => {
    const table = tableSetup();
    table.addDummy();
    expect(table.getAll()).toHaveLength(1);
  });

  it("should add data", () => {
    const table = tableSetup();
    table.add({
      id: "id",
      birthday: new Date().toLocaleDateString(),
      name: "Mustafa",
    });
    const addedUser = table.get({ id: "id", name: "Mustafa" });
    expect(addedUser).toBeTruthy();
  });

  it("should throw error if the user does not exist while updating", () => {
    const table = tableSetup();
    expect(() =>
      table.update({ id: "non-existent-id" }, { name: "hello" })
    ).toThrowError();
  });

  it("should update user value", () => {
    const table = tableSetup();
    table.add({
      id: "id",
      birthday: "birthday",
      name: "Mustafa",
    });
    const addedUser = table.get({ id: "id", name: "Mustafa" });
    expect(addedUser).toBeTruthy();

    const updatedUser = table.update({ name: "Mustafa" }, { name: "Sherry" });

    expect(updatedUser).toStrictEqual(
      expect.objectContaining({
        name: "Sherry",
        id: "id",
        birthday: "birthday",
      })
    );

    expect(() => table.get({ id: "id", name: "Mustafa" })).toThrowError();
    expect(() => table.get({ id: "id", name: "Sherry" })).toBeTruthy();
  });
});

describe("Database", () => {
  it("should show empty tables initially", () => {
    const { userTable, parentTable } = databaseSetup();
    expect(userTable.getAll()).toHaveLength(0);
    expect(parentTable.getAll()).toHaveLength(0);
  });

  it("should show populate tables", () => {
    const { db, userTable, parentTable } = databaseSetup();
    db.populate();
    expect(userTable.getAll()).toHaveLength(10);
    expect(parentTable.getAll()).toHaveLength(10);
  });

  it("should clear the tables", () => {
    const { db, userTable, parentTable } = databaseSetup();
    db.populate();
    expect(userTable.getAll()).toHaveLength(10);
    expect(parentTable.getAll()).toHaveLength(10);
    db.reset();
    expect(userTable.getAll()).toHaveLength(0);
    expect(parentTable.getAll()).toHaveLength(0);
  });

  it("should log tables without error", () => {
    const { db } = databaseSetup();
    db.log();
  });
});

type ComplexObject = {
  id: string;
  name: string;
  nested: {
    nestedId: string;
    nestedName: string;
  };
  arrayOfSimpleItems: string[];
  arrayOfComplexItems: { complexId: string }[];
  autoIncrementId: number;
  autoIncrementIdString: string;
  customValue: string;
  arrayCustomValue: string[];
};

describe("createDummyRecursive", () => {
  it("should create a complex data type successfully", () => {
    const result = createDummyRecursive<ComplexObject>({
      id: "id",
      name: "name",
      nested: {
        nestedId: "id",
        nestedName: "name",
      },
      arrayOfSimpleItems: ["string"],
      arrayOfComplexItems: [{ complexId: "id" }],
      autoIncrementId: "auto-increment-id",
      autoIncrementIdString: autoIncrementId("string"),
      customValue: () => "custom value",
      arrayCustomValue: [() => "custom value"],
    });

    expect(
      Object.keys(result).every((key) =>
        [
          "id",
          "name",
          "nested",
          "arrayOfSimpleItems",
          "arrayOfComplexItems",
          "autoIncrementId",
          "autoIncrementIdString",
          "customValue",
          "arrayCustomValue",
        ].includes(key)
      )
    ).toBeTruthy();

    expect(
      Object.keys(result.nested).every((key) =>
        ["nestedId", "nestedName"].includes(key)
      )
    ).toBeTruthy();

    expect(result.arrayOfSimpleItems).toHaveLength(1);
    expect(result.arrayOfComplexItems).toHaveLength(1);

    expect(result.arrayOfComplexItems[0].complexId).toBeTruthy();
    expect(result.customValue).toBe("custom value");
    expect(result.arrayCustomValue[0]).toBe("custom value");
  });

  it("should create all data types successfully", () => {
    const result = createDummyRecursive({
      name: "name",
      string: "string",
      number: "number",
      id: "id",
      age: "age",
      country: "country",
      boolean: "boolean",
      description: "description",
      date: "date",
      autoIncrementId: "auto-increment-id",
      autoIncrementName: autoIncrementName("hello"),
      email: "email",
    });

    expect(result.name).toBeTruthy();
    expect(result.string).toBeTruthy();
    expect(result.number).toBeTruthy();
    expect(result.id).toBeTruthy();
    expect(result.age).toBeTruthy();
    expect(result.country).toBeTruthy();
    expect(result.boolean === true || result.boolean === false).toBeTruthy();
    expect(result.description).toBeTruthy();
    expect(result.date).toBeTruthy();
    expect(result.autoIncrementId).toBe(2);
    expect(result.autoIncrementName).toBe("hello 1");
    expect(result.email).toBeTruthy();
  });

  it("should allow custom generator function as well", () => {
    const result = createDummyRecursive({ custom: () => "custom" });
    expect(result.custom).toBe("custom");
  });
});

describe("autoIncrementName", () => {
  it("should create auto increment name dummy data", () => {
    const nameGenerator = autoIncrementName("hello");
    expect(nameGenerator()).toBe(`hello 1`);
    expect(nameGenerator()).toBe(`hello 2`);
    expect(nameGenerator()).toBe(`hello 3`);
  });
});

describe("oneOf", () => {
  it("should go in a sequence and select one by one", () => {
    const selectOneOf = oneOf(["Pending", "Failure", "Success"]);
    expect(selectOneOf()).toBe("Pending");
    expect(selectOneOf()).toBe("Failure");
    expect(selectOneOf()).toBe("Success");
    expect(selectOneOf()).toBe("Pending");
    expect(selectOneOf()).toBe("Failure");
    expect(selectOneOf()).toBe("Success");
  });
});
