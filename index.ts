import {
  uniqueNamesGenerator,
  names,
  countries,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import { v4 as uuid } from "uuid";
import { loremIpsum } from "lorem-ipsum";

export type DummyValueTypes =
  | "name"
  | "string"
  | "number"
  | "date"
  | "boolean"
  | "id"
  | "country"
  | "age"
  | "description"
  | "email";

export type Schema<T extends Record<string, unknown>> = {
  [property in keyof T]: T[property] extends Record<string, unknown>
    ? Schema<T[property]> | (() => T[property])
    : T[property] extends (infer E)[]
    ? E extends Record<string, unknown>
      ? [Schema<E> | (() => E)]
      : [DummyValueTypes | (() => E)]
    : DummyValueTypes | (() => T[property]);
};

export type Conditions<T extends Record<string, unknown>> = {
  [property in keyof T]?: T[property] extends Record<string, unknown>
    ? never
    : T[property];
};

export const autoIncrementName = (name: string, separator = " ", start = 1) => {
  let localStart = start;
  return () => `${name}${separator}${localStart++}`;
};

export const oneOf = <T>(values: T[], startFrom = 0) => {
  let localStartFrom = startFrom;
  return () => values[localStartFrom++ % values.length];
};

export const autoIncrementId = (start = 1) => {
  let localStart = start;
  return () => {
    return localStart++;
  };
};

export const createValue: Record<DummyValueTypes, () => any> = {
  name: () =>
    uniqueNamesGenerator({ dictionaries: [names, names], separator: " " }),
  string: () =>
    uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: " ",
    }),
  number: () => Math.random() * 100000,
  date: () => new Date().toLocaleDateString(),
  id: () => uuid(),
  age: () => Math.floor(Math.random() * 100),
  country: () => uniqueNamesGenerator({ dictionaries: [countries] }),
  boolean: () => Math.random() > 0.5,
  description: () => loremIpsum(),
  email: () =>
    uniqueNamesGenerator({
      dictionaries: [names, ["@"], ["google.com"]],
      separator: "",
    }),
};

export const createDummyRecursive = <J extends Record<string, unknown>>(
  schema: Schema<J>
): J => {
  const entry = {} as Record<string, unknown>;

  Object.entries(schema).forEach(([key, value]) => {
    if (typeof value === "string")
      entry[key] = createValue[value as DummyValueTypes]();
    else if (typeof value === "function") entry[key] = value?.();
    else if (Array.isArray(value)) {
      if (typeof value[0] === "function") entry[key] = [value[0]()];
      if (typeof value[0] === "string")
        entry[key] = [createValue[value[0] as DummyValueTypes]()];
      if (typeof value[0] === "object")
        entry[key] = [createDummyRecursive(value[0])];
    } else if (typeof value === "object")
      entry[key] = createDummyRecursive(value);
  });

  return entry as J;
};

export const createTable = <T extends Record<string, unknown>>(
  schema: Schema<T>
) => {
  let tableData: T[] = [];

  const findindexByCondition = (conditions: Conditions<T>) =>
    tableData.findIndex((entry) =>
      Object.entries(conditions).every(([key, value]) => entry[key] === value)
    );

  const getAll = () => tableData;

  const getFirst = () => tableData[0];

  const add = (entry: T) => tableData.push(entry);

  const remove = (conditions: Conditions<T>) => {
    const entryToDelete = findindexByCondition(conditions);
    if (entryToDelete === -1) throw new Error("Entry not found");
    tableData.splice(entryToDelete, 1);
  };

  const log = () => console.log(tableData);

  const addDummy = (transform: (param: T) => T = (param) => param) => {
    const dummy = createDummyRecursive(schema);
    const transformedDummy = transform(dummy);
    tableData.push(transformedDummy);
    return transformedDummy;
  };

  const update = (conditions: Conditions<T>, updatedValues: Partial<T>) => {
    const indexOfEntryToUpdate = findindexByCondition(conditions);

    if (indexOfEntryToUpdate === -1)
      throw new Error("Could not find the entry");

    tableData[indexOfEntryToUpdate] = {
      ...tableData[indexOfEntryToUpdate],
      ...updatedValues,
    };

    return { ...tableData[indexOfEntryToUpdate] };
  };

  const reset = () => (tableData = []);

  const populate = (amount = 10) => [...Array(amount)].forEach(addDummy);

  const get = (conditions: Conditions<T>) => {
    const entry = tableData[findindexByCondition(conditions)];
    if (!entry) throw new Error("Entry not found");
    return entry;
  };

  return {
    getAll,
    get,
    add,
    remove,
    log,
    addDummy,
    update,
    reset,
    populate,
    getFirst,
  };
};

export const createDatabase = (
  ...tables: Pick<
    ReturnType<typeof createTable>,
    "populate" | "log" | "reset"
  >[]
) => ({
  reset: () => tables.forEach((table) => table.reset()),
  log: () => tables.forEach((table) => table.log()),
  populate: (amount = 10) => tables.forEach((table) => table.populate(amount)),
});
