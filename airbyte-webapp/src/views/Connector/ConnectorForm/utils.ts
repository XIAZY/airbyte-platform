import { FormBaseItem, FormBlock } from "core/form/types";
import { naturalComparator } from "utils/objects";

import { ConnectorDefinitionSpecification } from "../../../core/domain/connector";

export function makeConnectionConfigurationPath(path: string[] = []): string {
  return ["connectionConfiguration", ...path].join(".");
}

type OAuthOutputSpec = { properties: Record<string, { type: string; path_in_connector_config: string[] }> } | undefined;

export function serverProvidedOauthPaths(
  connector?: ConnectorDefinitionSpecification
): Record<string, { path_in_connector_config: string[] }> {
  return {
    ...((connector?.advancedAuth?.oauthConfigSpecification?.completeOAuthOutputSpecification as OAuthOutputSpec)
      ?.properties ?? {}),
    ...((connector?.advancedAuth?.oauthConfigSpecification?.completeOAuthServerOutputSpecification as OAuthOutputSpec)
      ?.properties ?? {}),
  };
}

export function OrderComparator(checkRequiredProperty: boolean): (a: FormBlock, b: FormBlock) => number {
  return (a, b) => {
    const aIsNumber = Number.isInteger(a.order);
    const bIsNumber = Number.isInteger(b.order);
    // treat being a formCondition as required, because a value must be selected for it regardless of being optional or required
    const aIsRequired = a.isRequired || a._type === "formCondition" || a.always_show;
    const bIsRequired = b.isRequired || b._type === "formCondition" || b.always_show;

    switch (true) {
      case aIsNumber && bIsNumber:
        return (a.order as number) - (b.order as number);
      case aIsNumber && !bIsNumber:
        return -1;
      case bIsNumber && !aIsNumber:
        return 1;
      case checkRequiredProperty && aIsRequired && !bIsRequired:
        return -1;
      case checkRequiredProperty && !aIsRequired && bIsRequired:
        return 1;
      default:
        return naturalComparator(a.fieldKey, b.fieldKey);
    }
  };
}

export function getPatternDescriptor(formItem: FormBaseItem): string | undefined {
  if (formItem.pattern_descriptor !== undefined) {
    return formItem.pattern_descriptor;
  }
  if (formItem.pattern === undefined) {
    return undefined;
  }
  if (formItem.pattern.includes("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$")) {
    return "YYYY-MM-DDTHH:mm:ssZ";
  }
  if (formItem.pattern.includes("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$")) {
    return "YYYY-MM-DDTHH:mm:ss";
  }
  if (formItem.pattern.includes("^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$")) {
    return "YYYY-MM-DD HH:mm:ss";
  }
  if (formItem.pattern.includes("^[0-9]{4}-[0-9]{2}-[0-9]{2}$")) {
    return "YYYY-MM-DD";
  }
  if (formItem.pattern.includes("^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$")) {
    return "YYYY-MM-DDTHH:mm:ss.SSSZ";
  }
  return undefined;
}
