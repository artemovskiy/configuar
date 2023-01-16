import { JSONSchema6 } from 'json-schema';

export const prefixObjectKeys = (prefix: string, schema: JSONSchema6): JSONSchema6 => {
  const properties: JSONSchema6['properties'] = {};
  if (schema.properties && Object.keys(schema.properties).length > 0) {
    for (const key of Object.keys(schema.properties)) {
      properties[prefix + key] = schema.properties[key];
    }
  }

  return {
    type: 'object',
    properties,
    required: (schema.required ?? []).map((key) => prefix + key),
  };
};

export const mergeObjectSchemasRight = (left: JSONSchema6, right: JSONSchema6): JSONSchema6 => {
  const result: JSONSchema6 = JSON.parse(JSON.stringify(left));

  for (const key of Object.keys(right.properties)) {
    result.properties[key] = right.properties[key];
  }

  result.required = (left.required ?? []).filter((property) => !right.properties[property])
    .concat(right.required);

  return result;
};
