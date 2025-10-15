import type {
  CompileContext,
  Extension as FromMarkdownExtension,
  Handle as FromMarkdownHandle,
  Token,
} from "mdast-util-from-markdown";
import type { Handle as ToMarkdownHandle } from "mdast-util-to-markdown";
import type { TemplateVariable, TemplateVariableData } from "..";

/**
 * Create an extension for `mdast-util-from-markdown` to enable template variables in markdown.
 */
export function templateVariableFromMarkdown() {
  return {
    enter: {
      templateVariable: enterTemplateVariable,
      templateVariableString: enterTemplateVariableString,
    },
    exit: {
      templateVariable: exitTemplateVariable,
      templateVariableString: exitTemplateVariableString,
      chunkString: exitTemplateVariableData,
    },
  } as FromMarkdownExtension;
}

/**
 * Create an extension for `mdast-util-to-markdown` to enable template variables in markdown.
 */
export function templateVariableToMarkdown() {
  return {
    unsafe: [
      {
        character: "{",
        inConstruct: "phrasing",
      },
    ],
    handlers: { templateVariable: handleTemplateVariable },
  };
}

const enterTemplateVariable: FromMarkdownHandle = function (
  this: CompileContext,
  token: Token,
) {
  this.enter(
    {
      type: "templateVariable",
      value: "",
      data: { hName: "var", hChildren: [] },
    },
    token,
  );
};

const enterTemplateVariableString: FromMarkdownHandle = function (
  this: CompileContext,
  _token: Token,
) {
  this.buffer();
};

const exitTemplateVariableString: FromMarkdownHandle = function (
  this: CompileContext,
  _token: Token,
) {
  const value = this.resume();
  const node = this.stack[this.stack.length - 1] as TemplateVariable;
  let data = node.data as TemplateVariableData | undefined;

  if (!data) {
    data = {} as TemplateVariableData;
    node.data = data;
  }

  node.value = value;
  // Provide default hast mapping for consumers using `mdast-util-to-hast`.
  data.hName = "var";
  data.hChildren = [{ type: "text", value }];
};

const exitTemplateVariable: FromMarkdownHandle = function (
  this: CompileContext,
  token: Token,
) {
  this.exit(token);
};

const exitTemplateVariableData: FromMarkdownHandle = function (
  this: CompileContext,
  token: Token,
) {
  this.config.enter.data.call(this, token);
  this.config.exit.data.call(this, token);
};

const handleTemplateVariable: ToMarkdownHandle = (node, _, state, info) => {
  const value = node.value ? String(node.value) : "";
  const tracker = state.createTracker(info);
  let result = "";

  for (const character of value) {
    if (character === "\\" || character === "{" || character === "}") {
      result += `\\${character}`;
      continue;
    }
    result += character;
  }

  return tracker.move("{{") + tracker.move(result) + tracker.move("}}");
};
