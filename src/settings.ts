import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
  {
    key: "addDate",
    title: t("Date > Enable date entry"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {
    key: "createDateLink",
    title: t("Date > Create the date link"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {// そのブロックのページがジャーナルフラグを持っている場合に、完了日と同じであれば日付を省略するオプション
    key: "omitDateIfSameAsJournal",
    title: t("Date > Omit date if same as journal"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "addTime",
    title: t("Time > Enable timestamp entry"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {//タイムスタンプを前か後ろか
    key: "timeStampPosition",
    title: t("Time > Different order (time and date)"),
    type: "enum",
    default: "after",
    enumChoices: ["before", "after"],
    description: "default: `after`",
  },
  {
    key: "emphasisTime",
    title: t("Time > Emphasis on time in property (like below *10:00* or **10:00**)"),
    type: "enum",
    default: "*",
    enumChoices: ["*", "**", "none"],
    description: "default: `*`",
  },
  {
    //DONEプロパティの表示サイズを小さくして右側に配置する Logseq v0.9.11以降
    key: "smallDONEproperty",
    title: t("Block property > Small and right align"),
    type: "boolean",
    default: true,
    description: "default: `true` (⚠️Logseq v0.9.11 or later)",
  },
  {//箇条書きコンテキストメニューからのみ実行するかどうか
    key: "onlyFromBulletList",
    title: t("Process > Only from bullet context menu (Not recognized even after DONE)"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    key: "removePropertyWithoutDONEtask",
    title: t("Process > Remove property without DONE marker"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {//クエリー用の隠しプロパティとして、キー"string"に、日付値を入れる
    key: "enableHiddenProperty",
    title: t("Process > Enable hidden property for queries (key: \"string\", value: journal-day format)"),
    type: "boolean",
    default: true,
    description: "default: `true`",
  },
  {// Mode > "Update block" > 1行目の内容の前か後ろに、日付や時刻を挿入する
    key: "updateBlockContentPosition",
    title: t("Mode > \"Update block\" > Before or after the content of the first line, insert the date and time"),
    type: "enum",
    default: "before",
    enumChoices: ["before", "after"],
    description: "default: `before`",
  },
  {// Mode > "Update block" > 区切り文字
    key: "updateBlockSeparator",
    title: t("Mode > \"Update block\" > Separator"),
    type: "string",
    default: " - ",
    description: "default: ` - `",
  },
  {
    //insert block collapsed
    key: "insertBlockCollapsed",
    title: t("Mode > \"Insert block\" > Collapsed"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    //mode select
    key: "modeSelect",
    title: t("Mode > Default mode select"),
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
    //timeoutモード
    key: "timeoutMode",
    title: t("Timeout > Enable feature"),
    type: "boolean",
    default: false,
    description: "default: `false`",
  },
  {
    //timeoutモードの時間
    key: "timeout",
    title: t("Timeout > (ms)"),
    type: "enum",
    enumChoices: ["3000", "5000", "7000", "9000"],
    default: "5000",
    description: "default: `5000`",
  },
  {
    key: "customPropertyName",
    title: t("Change > Custom property name"),
    type: "string",
    default: "completed",
    description: "default: `completed`",
  },
]
