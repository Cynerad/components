function isEqual(first: unknown, other: unknown): boolean {
  if (first === other)
    return true;

  if (Number.isNaN(first) && Number.isNaN(other))
    return true;

  if (
    typeof first !== "object" || first === null
    || typeof other !== "object" || other === null
  ) {
    return false;
  }

  const objA = first as Record<PropertyKey, unknown>;
  const objB = other as Record<PropertyKey, unknown>;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length)
    return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !isEqual(objA[key], objB[key]))
      return false;
  }

  return true;
}

function add<TObj, TKey extends PropertyKey, TValue>(object: TObj, key: TKey, value: TValue) {
  return { ...object, [key]: value };
}

function remove<TObj, TKey extends readonly (keyof TObj)[]>(object: TObj, ...keys: TKey) {
  const newObject = { ...object };
  keys.forEach(key => delete newObject[key]);
  return newObject;
}

export { add, isEqual, remove };
