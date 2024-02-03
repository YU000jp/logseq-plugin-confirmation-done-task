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

export const pushDONE = (block: BlockEntity) => {
  //先頭に 「# 」や「＃# 」、「### 」、「#### 」、「##### 」、「###### 」 がある場合は、その後ろにDONEを追加する
  const match = block.content.match(/^#+\s/)
  if (match)
    block.content = block.content.replace(/^#+\s/, `${match[0]}DONE `)
  else
    block.content = `DONE ${block.content}`

  logseq.Editor.updateBlock(block.uuid, block.content)
}

export const hiddenProperty = (inputDate: string, taskBlock: BlockEntity) => {
  if (logseq.settings!.enableHiddenProperty === false) return

  //20230929のような形式で保存する
  const hiddenProperty = parse(inputDate, 'yyyy-MM-dd', new Date())

  logseq.Editor.upsertBlockProperty(taskBlock.uuid, "string", format(hiddenProperty, 'yyyyMMdd'))

  logseq.showMainUI() //ユーザーによる操作を停止する
  logseq.Editor.restoreEditingCursor()

  setTimeout(async () => {
    logseq.Editor.editBlock(taskBlock.uuid)
    if (taskBlock.properties?.string) logseq.Editor.removeBlockProperty(taskBlock.uuid, "string") //2重にならないように削除
    setTimeout(() => {
      logseq.Editor.insertAtEditingCursor("\n") //string:: ${format(hiddenProperty, 'yyyyMMdd')}
      logseq.hideMainUI() // ユーザーによる操作を再開する
    }
      , 100)
  }, 500)
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

