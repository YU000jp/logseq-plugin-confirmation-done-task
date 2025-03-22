import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { TaskBlockEntity } from "."
import { parse, format } from "date-fns"


export const overwriteToProperty = async (
  taskBlock: TaskBlockEntity,
  dateAndTime: string,
  inputDateString: string
) => {
  let propertyValue = (await logseq.Editor.getBlockProperty(taskBlock.uuid, logseq.settings!.customPropertyName as string)) as string
  if (typeof propertyValue === "string")
    propertyValue += " , "
  else
    propertyValue = ""
  logseq.Editor.upsertBlockProperty(taskBlock.uuid, logseq.settings!.customPropertyName as string, propertyValue + dateAndTime)
  hiddenProperty(parse(inputDateString, 'yyyy-MM-dd', new Date()), taskBlock)
  logseq.UI.showMsg(`💪 ${t("The block property updated")}`, "success")
}


export const addPropertyToTheBlock = (
  taskBlock: TaskBlockEntity,
  dateAndTime: string,
  inputDate: Date,
  propertyName: string
) => {
  logseq.Editor.upsertBlockProperty(taskBlock.uuid, propertyName, dateAndTime)
  //隠しプロパティにも追加
  hiddenProperty(inputDate, taskBlock)
  logseq.UI.showMsg(`💪 ${t("The block property inserted")}`, "success")
}


export const modeInsertBlock = (
  taskBlock: TaskBlockEntity,
  dateAndTime: string,
  inputDateString: string
) => {
  logseq.Editor.insertBlock(taskBlock.uuid, `${dateAndTime}`, { focus: false })
  if (logseq.settings!.insertBlockCollapsed === true)
    logseq.Editor.setBlockCollapsed(taskBlock.uuid, true)
  hiddenProperty(parse(inputDateString, 'yyyy-MM-dd', new Date()), taskBlock)
  logseq.UI.showMsg(`💪 ${t("New block inserted")}`, "success")
}


export const modeUpdateBlock = (
  taskBlock: TaskBlockEntity,
  dateAndTime: string,
  inputDateString: string
) => {
  if (logseq.settings!.updateBlockContentPosition === "before")
    // "before"の場合
    //DONEの後ろに、日付や時刻を挿入する
    taskBlock.content = taskBlock.content.replace(/^(#+\s)?DONE\s/, `DONE ${dateAndTime} ${logseq.settings!.updateBlockSeparator} `)
  else // "after"の場合
    if (taskBlock.content.includes("\n"))
      //1行目の内容の後ろ(一つ目の\nの前)に、日付や時刻を挿入する
      taskBlock.content = taskBlock.content.replace(/\n/, `- ${dateAndTime}\n`)
    else
      //1行目の内容の最後に、日付や時刻を挿入する
      taskBlock.content += ` ${logseq.settings!.updateBlockSeparator} ${dateAndTime}`

  logseq.Editor.updateBlock(taskBlock.uuid, taskBlock.content)
  hiddenProperty(parse(inputDateString, 'yyyy-MM-dd', new Date()), taskBlock)
  logseq.UI.showMsg(`💪 ${t("The block updated")}`, "success")
}


export const pushDONE = (
  block: TaskBlockEntity
) => {
  //先頭に 「# 」や「＃# 」、「### 」、「#### 」、「##### 」、「###### 」 がある場合は、その後ろにDONEを追加する
  const match = block.content.match(/^#+\s/)
  if (match)
    block.content = block.content.replace(/^#+\s/, `${match[0]}DONE `)
  else
    block.content = `DONE ${block.content}`
  logseq.Editor.updateBlock(block.uuid, block.content)
}


const hiddenProperty = (
  inputDate: Date,
  taskBlock: TaskBlockEntity
) => {
  if (logseq.settings!.enableHiddenProperty === false)
    return

  logseq.showMainUI() //ユーザーによる操作を停止する
  logseq.Editor.restoreEditingCursor()

  setTimeout(async () => {
    logseq.Editor.editBlock(taskBlock.uuid)
    if (taskBlock.properties?.string)
      logseq.Editor.removeBlockProperty(taskBlock.uuid, "string") //2重にならないように削除
    setTimeout(() => {
      //string:: 20230929
      logseq.Editor.insertAtEditingCursor(`\nstring:: ${format(inputDate, 'yyyyMMdd')
        }\n`)
      logseq.hideMainUI() // ユーザーによる操作を再開する
    },
      100)
  }, 500)
}
