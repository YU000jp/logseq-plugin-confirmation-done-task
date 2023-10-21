import { AppGraphInfo, BlockEntity } from "@logseq/libs/dist/LSPlugin.user";
import { key } from ".";
import { parse, format } from "date-fns"

export const checkDemoGraph = async (): Promise<boolean> => ((await logseq.App.getCurrentGraph()) as AppGraphInfo | null) === null
  ? true
  : false; //デモグラフの場合は返り値がnull
export function removeDialog() {
  const element = parent.document.getElementById(
    logseq.baseInfo.id + `--${key}`
  ) as HTMLDivElement | null;
  if (element) element.remove();
}
export const pushDONE = (block: BlockEntity) => {
  //先頭に 「# 」や「＃# 」、「### 」、「#### 」、「##### 」、「###### 」 がある場合は、その後ろにDONEを追加する
  const match = block.content.match(/^#+\s/)
  if (match) {
    block.content = block.content.replace(
      /^#+\s/,
      `${match[0]}DONE `
    )
  } else {
    block.content = `DONE ${block.content}`
  }
  logseq.Editor.updateBlock(block.uuid, block.content)
}
export const hiddenProperty = (inputDate: string, taskBlock: BlockEntity) => {
  //20230929のような形式で保存する
  const hiddenProperty = parse(inputDate, 'yyyy-MM-dd', new Date())

  logseq.Editor.upsertBlockProperty(
    taskBlock.uuid,
    "string",
    format(hiddenProperty, 'yyyyMMdd')
  )
  logseq.Editor.restoreEditingCursor()
  setTimeout(async () => {
    logseq.Editor.editBlock(taskBlock.uuid)
    if (taskBlock.properties?.string) logseq.Editor.removeBlockProperty(taskBlock.uuid, "string") //2重にならないように削除
    setTimeout(() => logseq.Editor.insertAtEditingCursor(`\nstring:: ${format(hiddenProperty, 'yyyyMMdd')}`), 100)
  }, 500)
}

