import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user";
import { t } from "logseq-l10n";

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
  {//箇条書きコンテキストメニューからのみ実行するかどうか
    key: "onlyFromBulletList",
    title: t("Only from bullet context menu (Not recognized even after DONE)"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "removePropertyWithoutDONEtask",
    title: t("Remove property without DONE marker"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "customPropertyName",
    title: t("Custom property name"),
    type: "string",
    default: "completed",
    description: "default: `completed`",
  },
  {
    key: "addDate",
    title: t("Enable date entry into the property"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "createDateLink",
    title: t("Create the date link"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "addTime",
    title: t("Enable timestamp entry into the property"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {//タイムスタンプを前か後ろか
    key: "timeStampPosition",
    title: t("different order (time and date)"),
    type: "enum",
    default: "after",
    enumChoices: ["before", "after"],
    description: "default: `after`",
  },
  {
    key: "emphasisTime",
    title: t("Emphasis on time in property (like below *10:00* or **10:00**)"),
    type: "enum",
    default: "*",
    enumChoices: ["*", "**", "none"],
    description: "default: `*`",
  },
  {
    //DONEプロパティの表示サイズを小さくして右側に配置する Logseq v0.9.11以降
    key: "smallDONEproperty",
    title: t("Small DONE property and right align"),
    type: "boolean",
    default: true,
    description: "default: `true` (⚠️Logseq v0.9.11 or later)",
  },
  {
    //timeoutモード
    key: "timeoutMode",
    title: t("Timeout mode"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    //timeoutモードの時間
    key: "timeout",
    title: t("Timeout (ms) when timeout mode is enabled"),
    type: "enum",
    enumChoices: ["3000", "5000", "7000", "9000"],
    default: "5000",
    description: "default: `5000`",
  },
  {
    //mode select
    key: "modeSelect",
    title: t("Default mode select"),
    type: "enum",
    enumChoices: [
      "As block property",
      "Insert block",
      "Update block",
    ],
    default: "As block property",
    description: "default: `As block property`",
  },
  {
    //insert block collapsed
    key: "insertBlockCollapsed",
    title: t("\"Insert block\" only: Collapsed"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
];
