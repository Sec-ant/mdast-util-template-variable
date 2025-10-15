import type { Data, Literal } from "mdast";

export {
  templateVariableFromMarkdown,
  templateVariableToMarkdown,
} from "./lib";

export interface TemplateVariable extends Literal {
  /**
   * Node type of template variable.
   */
  type: "templateVariable";

  /**
   * Data associated with the template variable.
   */
  data?: TemplateVariableData | undefined;
}

/**
 * Info associated with mdast template variable nodes by the ecosystem.
 */
export interface TemplateVariableData extends Data {
  /**
   * Resulting element name when compiling to hast/HTML.
   */
  hName?: string | undefined;

  /**
   * Resulting children when compiling to hast/HTML.
   */
  hChildren?: Array<{ type: string; value: string }> | undefined;
}

// Add nodes to tree.
declare module "mdast" {
  interface PhrasingContentMap {
    templateVariable: TemplateVariable;
  }

  interface RootContentMap {
    templateVariable: TemplateVariable;
  }
}
