import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate: SettingSchemaDesc[] = [
  {
    key: "customPropertyName",
    title: "Custom property name",
    type: "string",
    default: "completed",
    description: "default: `completed`",
  },
  {
    key: "addDate",
    title: "Use the function to add the date to the property",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "createDateLink",
    title: "Create the date link",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "addTime",
    title: "Use the function to add a timestamp to the property",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "emphasisTime",
    title: "Emphasis on time in property (like below *10:00* or **10:00**)",
    type: "enum",
    default: "*",
    enumChoices: ["*", "**", "none"],
    description: "default: `*`",
  },
  {
    //DONEプロパティの表示サイズを小さくして右側に配置する Logseq v0.9.11以降
    key: "smallDONEproperty",
    title: "Small DONE property and right align",
    type: "boolean",
    default: true,
    description: "default: `true` (⚠️Logseq v0.9.11 or later)",
  },
  {
    //timeoutモード
    key: "timeoutMode",
    title: "Timeout mode",
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    //timeoutモードの時間
    key: "timeout",
    title: "Timeout (ms) when timeout mode is enabled",
    type: "enum",
    enumChoices: ["3000", "5000", "7000", "9000"],
    default: "5000",
    description: "default: `5000`",
  },
  {
    //mode select
    key: "modeSelect",
    title: "Default mode select",
    type: "enum",
    enumChoices: [
      "As block property",
      "Insert block property",
      "Insert block",
      "Update block",
    ],
    default: "As block property",
    description: "default: `As block property`",
  },
  {
    //Insert block モードでリファレンスを入れるかどうか
    key: "insertBlockModeUseReference",
    title: "Insert block mode: Use reference",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    //insert block collapsed
    key: "insertBlockCollapsed",
    title: "Insert block: Collapsed",
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "removePropertyWithoutDONEtask",
    title: "Remove property without DONE marker",
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
];
