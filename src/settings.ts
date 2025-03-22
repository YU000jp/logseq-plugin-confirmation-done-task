import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
  {
    key: "heading1000",
    title: t("Common Settings"),
    type: "heading",
    default: null,
    description: "",
  },
  {
    key: "createDateLink",
    title: t("Create the date link"),
    type: "boolean",
    default: true,
    description: t("Enable"),
  },
  {//タイムスタンプを前に置くか後ろに置くか
    key: "timeStampPosition",
    title: t("Putting the timestamp in front or behind"),
    type: "enum",
    default: "behind",
    enumChoices: ["front", "behind"],
    description: "",
  },
  {
    key: "emphasisTime",
    title: t("Emphasis on time in property"),
    type: "enum",
    default: "*",
    enumChoices: ["*", "**", "none"],
    description: `default: \`*\` / ${t("(like below *10:00* or **10:00**)")}`,
  },
  {//クエリー用の隠しプロパティとして、キー"string"に、日付値を入れる
    key: "enableHiddenProperty",
    title: t("Hidden property for queries"),
    type: "boolean",
    default: true,
    description: `${t("Enable")} / (key: \"string\", value: journal-day format)`,
  },


  {
    key: "heading2000",
    title: t("Styles For Task Properties"),
    type: "heading",
    default: null,
    description: "",
  },
  {
    //DONEプロパティの表示サイズを小さくして右側に配置する Logseq v0.9.11以降
    key: "smallDONEproperty",
    title: `${t("Block property")} > ${t("Small and right align")}`,
    type: "boolean",
    default: true,
    description: `${t("Enable")} (⚠️Logseq v0.9.11 or later)`,
  },
  { //20240727
    // DONEプロパティを通常よりも一段上に表示する
    key: "upperDONEproperty",
    title: `${t("Block property")} > ${t("Display the DONE property one step higher than usual")}`,
    type: "boolean",
    default: false,
    // 左側にブロック本文、右側にプロパティを配置し、一行に収めます
    description: `${t("Enable")} / ${t("Block text on the left, properties on the right, on one line")}`,
  },


  {
    key: "heading3000",
    title: `DONE ${t("Task")}`,
    type: "heading",
    default: null,
    description: t("Set completed property for DONE tasks"),
  },
  {
    key: "DONEtask",
    title: t("Enable"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//箇条書きコンテキストメニューからのみ実行するかどうか
    key: "onlyFromBulletList",
    title: t("Only from bullet context menu"),
    type: "boolean",
    default: false,
    description: `default: \`false\` / ${t("(Not recognized even after DONE)")}`,
  },
  {//箇条書きコンテキストメニューを有効にする
    key: "enableBulletContextMenu",
    title: t("Bullet context menu"),
    type: "boolean",
    default: false,
    description: "default: `false`",
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
    title: t("Date entry"),
    type: "boolean",
    default: true,
    description: t("Enable"),
  },
  {
    key: "addTime",
    title: t("Timestamp entry"),
    type: "boolean",
    default: true,
    description: t("Enable"),
  },
  {// そのブロックのページが日誌フラグを持っている場合に、完了日と同じであれば日付を省略するオプション
    key: "omitDateIfSameAsJournal",
    title: t("Omit date if same as journal"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "removePropertyWithoutDONEtask",
    title: t("Remove property without DONE marker"),
    type: "boolean",
    default: true,
    description: t("Enable"),
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
  {// Mode > "Update block" > 1行目の内容の前か後ろに、日付や時刻を挿入する
    key: "updateBlockContentPosition",
    title: `"Update block" ${t("mode")} > ${t("Before or after the content of the first line, insert the date and time")}`,
    type: "enum",
    default: "before",
    enumChoices: ["before", "after"],
    description: "default: `before`",
  },
  {// Mode > "Update block" > 区切り文字
    key: "updateBlockSeparator",
    title: `"Update block" ${t("mode")} > ${t("Separator")}`,
    type: "string",
    default: " - ",
    description: "default: ` - `",
  },
  {
    //insert block collapsed
    key: "insertBlockCollapsed",
    title: `"Insert block" ${t("mode")} > ${t("Collapsed")}`,
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  { //DONEプロパティに日付を追加する
    key: "addDateContinuously",
    title: t("Add date into DONE property"),
    type: "boolean",
    default: false,
    // Logseqもしくはプラグインの再起動が必要。
    description: `${t("Enable")} / ${t("Executed from bullet context menu.")} / (${t("Logseq or plugin restart required")})`,
  },


  {
    key: "heading4000",
    title: `CANCELLED ${t("Task")}`,
    type: "heading",
    default: null,
    description: t("Set cancelled property for CANCELLED tasks"),
  },
  {
    // Set completed property also for CANCELLED tasks
    key: "cancelledTask",
    title: t("Enable"),
    type: "boolean",
    default: false,
    description: "",
  },
  {
    //CANCELLEDタスクのプロパティの舐め
    key: "cancelledTaskPropertyName",
    title: t("Custom property name"),
    type: "string",
    default: "cancelled",
    description: "default: `cancelled`",
  },
  { //CANCELLEDタスクに時刻を入れるかどうか
    key: "cancelledTaskTime",
    title: t("Timestamp entry"),
    type: "boolean",
    default: false,
    description: t("Enable"),
  },
  { //CANCELLEDタスクではなにのに、プロパティをもつ場合は削除する
    key: "removePropertyWithoutCANCELLEDtask",
    title: t("Remove property without CANCELLED marker"),
    type: "boolean",
    default: true,
    description: t("Enable"),
  },

]
