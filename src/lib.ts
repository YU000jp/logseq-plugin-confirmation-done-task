import { AppGraphInfo, BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { format, parse } from "date-fns"
import { key } from "."

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
