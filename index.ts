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
  | "auto-increment-id";

export type Schema<T extends Record<string, unknown>> = {
  [property in keyof T]: T[property] extends Record<string, unknown>
    ? Schema<T[property]>
    : T[property] extends (infer E)[]
    ? E extends Record<string, unknown>
      ? [Schema<E>]
      : [DummyValueTypes]
    : DummyValueTypes | (() => any);
};

export type Conditions<T extends Record<string, unknown>> = {
  [property in keyof T]?: T[property] extends Record<string, unknown>
    ? never
    : T[property];
};

export const autoIncrementName =
  (name: string, separator = " ", start = 1) =>
  () =>
    `${name}${separator}${start++}`;

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
  "auto-increment-id": (
    (start = 1) =>
    () =>
      start++
  )(),
};

export const createDummyRecursive = <J extends Record<string, unknown>>(
  schema: Schema<J>
) => {
  const entry = {};

  Object.entries(schema).forEach(([key, value]) => {
    if (typeof value === "string") entry[key] = createValue[value]();
    if (typeof value === "function") entry[key] = value?.();
    if (typeof value === "object") entry[key] = createDummyRecursive(value);
    if (Array.isArray(value))
      entry[key] = [
        typeof value[0] === "object"
          ? createDummyRecursive(value[0])
          : createValue[value[0]](),
      ];
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

  const add = (entry: T) => tableData.push(entry);

  const remove = (conditions: Conditions<T>) => {
    const entryToDelete = findindexByCondition(conditions);
    if (entryToDelete !== -1) tableData.splice(entryToDelete, 1);
  };

  const log = () => console.log(tableData);

  const addDummy = () => tableData.push(createDummyRecursive(schema));

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

  const populate = () => {
    for (let i = 0; i < 10; i++) {
      addDummy();
    }
  };

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
  populate: () => tables.forEach((table) => table.populate()),
});
