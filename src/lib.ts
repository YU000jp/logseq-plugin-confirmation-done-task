import { AppGraphInfo, BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { format, isSameDay, parse } from "date-fns"
import { key } from "."
import { t } from "logseq-l10n"

export const checkDemoGraph = async (): Promise<boolean> => ((await logseq.App.getCurrentGraph()) as AppGraphInfo | null) === null
  ? true
  : false //デモグラフの場合は返り値がnull

export const removeDialog = () => {
  const element = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null
  if (element) element.remove()
}

export const getJournalDayDate = (str: string): Date => new Date(
  Number(str.slice(0, 4)), //year
  Number(str.slice(4, 6)) - 1, //month 0-11
  Number(str.slice(6)) //day
)

export const typeDateFromInputDate = async (flagSameDay: boolean, inputDateString: string, preferredDateFormat: string): Promise<string> => flagSameDay as boolean === true ? "" :

  //日付リンクを作成する
  (logseq.settings!.createDateLink === true
    ? "[[" +
    format(
      parse(inputDateString, 'yyyy-MM-dd', new Date()),
      preferredDateFormat
    ) +
    "]]"

    // 日付リンクを作成しない
    : format(
      parse(inputDateString, 'yyyy-MM-dd', new Date()),
      preferredDateFormat
    )
  )

// 日記ページかつ日付が一致する場合は、日付を省略する
export const flagSameDay = async (block: { page: BlockEntity["page"] }, inputDateString: string): Promise<boolean> => {
  // 省略を実行しない条件
  //ページを取得
  const page = await logseq.Editor.getPage(block.page.id) as { journal: PageEntity["journal"]; journalDay: PageEntity["journalDay"] } | null
  if (!page) return false
  if (page["journal?"] === true // 日誌フラグ
    && (page.journalDay
      && isSameDay(getJournalDayDate(String(page.journalDay)), //block.page.journalDateとinputDateの日付が一致する
        new Date(inputDateString)) //入力された日付
    )) {
    logseq.UI.showMsg(t("Omit the date if it matches the date on the journal page."), "warning")
    return true
  } else
    return false
}

// プロパティ名を変更するときに、元のプロパティ名のページをリネームする
export const renamePage = async (oldName: string, newName: string) => {
  const oldPage = await logseq.Editor.getPage(oldName) as { uuid: PageEntity["uuid"] } | null
  if (!oldPage) return
  logseq.Editor.renamePage(oldName, newName)
  logseq.UI.showMsg(`💪 ${t("Renamed page")}`, "success")
}

export const removeProvideStyle = (className: string) => {
  const doc = parent.document.head.querySelector(
    `style[data-injected-style^="${className}"]`
  ) as HTMLStyleElement | null
  if (doc) doc.remove()
}