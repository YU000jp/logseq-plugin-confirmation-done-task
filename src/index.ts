import "@logseq/libs" //https://plugins-doc.logseq.com/
import { AppInfo, BlockEntity, BlockUUID, LSPluginBaseInfo, } from "@logseq/libs/dist/LSPlugin.user"
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { pushDONE } from "./block"
import { showDialogProcess } from "./dialog"
import { removeDialog, removeProvideStyle, renamePage } from "./lib"
import { settingsTemplate } from "./settings"
import { provideStyleMain } from "./style"
import af from "./translations/af.json"
import de from "./translations/de.json"
import es from "./translations/es.json"
import fr from "./translations/fr.json"
import id from "./translations/id.json"
import it from "./translations/it.json"
import ja from "./translations/ja.json"
import ko from "./translations/ko.json"
import nbNO from "./translations/nb-NO.json"
import nl from "./translations/nl.json"
import pl from "./translations/pl.json"
import ptBR from "./translations/pt-BR.json"
import ptPT from "./translations/pt-PT.json"
import ru from "./translations/ru.json"
import sk from "./translations/sk.json"
import tr from "./translations/tr.json"
import uk from "./translations/uk.json"
import zhCN from "./translations/zh-CN.json"
import zhHant from "./translations/zh-Hant.json"
import { cancelledTask, waitingTask, doingTask, todoTask, doneTask } from "./otherTask"
export const keySmallDONEproperty = "not-smallDONEproperty"
export const keyStyle = "DONEpluginMain"
export const keySettingsButton = "DONEpluginSettingsButton"
export const key = "DONEdialog"
let onBlockChangedToggle: boolean = false
let processingButton: boolean = false

let configPreferredDateFormat: string
export const getConfigPreferredDateFormat = (): string => configPreferredDateFormat


const getUserConfig = async () => {
  const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string }
  configPreferredDateFormat = preferredDateFormat
}

let logseqVersion: string = "" //バージョンチェック用
let logseqVersionMd: boolean = false //旧UI系統(0.10.x以下またはOG 1.x系)かどうか
let logseqDbGraph: boolean = false //現在のグラフがDBグラフかどうか
// export const getLogseqVersion = () => logseqVersion //バージョンチェック用
export const booleanLogseqVersionMd = () => logseqVersionMd //バージョンチェック用
export const booleanDbGraph = () => logseqDbGraph //バージョンチェック用

export interface TaskBlockEntity {
  // id: EntityID;
  uuid: BlockUUID
  // left: IEntityID;
  // format: 'markdown' | 'org';
  // parent: IEntityID;
  content: string
  // page: IEntityID;
  properties?: Record<string, any>
  // anchor?: string;
  // body?: any;
  // children?: Array<BlockEntity | BlockUUIDTuple>;
  // container?: string;
  // file?: IEntityID;
  // level?: number;
  // meta?: {
  //     timestamps: any;
  //     properties: any;
  //     startPos: number;
  //     endPos: number;
  // };
  // title?: Array<any>;
  marker?: string
  // [key: string]: unknown;
}


/* main */
const main = async (notFirst?: boolean) => {

  // バージョンチェック
  if (notFirst !== true)
    logseqVersionMd = await checkLogseqVersion()
  // console.log("logseq version: ", logseqVersion)
  // console.log("logseq version is MD model: ", logseqVersionMd)
  // 100ms待つ
  await new Promise(resolve => setTimeout(resolve, 100))

  // if (logseqVersionMd === false) {
  //   // Logseq ver 0.10.*以下にしか対応していない
  //   logseq.UI.showMsg("The ’Bullet Point Custom Icon’ plugin only supports Logseq ver 0.10.* and below.", "warning", { timeout: 5000 })
  //   return
  // }
  // // DBグラフチェック
  logseqDbGraph = await checkLogseqDbGraph()
  if (logseqDbGraph === true) {
    // DBグラフには対応していない
    return showDbGraphIncompatibilityMsg()
  }

  //100ms待つ
  await new Promise(resolve => setTimeout(resolve, 100))

  logseq.App.onCurrentGraphChanged(async () => {
    logseqDbGraph = await checkLogseqDbGraph()
    if (logseqDbGraph === true)
      // DBグラフには対応していない
      return showDbGraphIncompatibilityMsg()
  })

  await l10nSetup({
    builtinTranslations: {//Full translations
      ja, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant
    }
  })

  await getUserConfig()

  /* user settings */
  logseq.useSettingsSchema(settingsTemplate())
  const updateInfo = "20250323a"
  if (!logseq.settings)
    setTimeout(() => logseq.showSettingsUI(), 300)
  else
    if (logseq.settings!.updateInfo !== updateInfo) {
      setTimeout(() => logseq.showSettingsUI(), 300)
      logseq.updateSettings({ updateInfo })
    }


  provideStyleMain(logseq.settings!.upperDONEproperty as boolean, logseqVersionMd)

  //ページ読み込み時
  logseq.App.onPageHeadActionsSlotted(() => startOnBlock())
  logseq.App.onRouteChanged(() => startOnBlock())

  //グラフ変更時
  logseq.App.onCurrentGraphChanged(() => {
    getUserConfig()
    startOnBlock()
  })

  const startOnBlock = () => {
    removeDialog()
    if (onBlockChangedToggle === false) {
      onBlockChanged()
      onBlockChangedToggle = true
    }
  }


  onBlockChanged()
  onBlockChangedToggle = true
  //end


  // DONEにするコマンド
  if (logseq.settings!.enableDoneCommand as boolean === true) {
    const registerDoneCommand = (key: string, label: string, keybinding: string, mode: string) => {
      logseq.App.registerCommandPalette({
        key,
        label: "✔️ " + t(label),
        keybinding: { binding: keybinding }
      }, async () => {
        const block = await logseq.Editor.getCurrentBlock() as TaskBlockEntity | null
        if (!block) return
        const modeSelect = logseq.settings!.modeSelect as string || "As block property"
        logseq.updateSettings({ modeSelect: mode })
        pushDONE(block)
        setTimeout(() => logseq.updateSettings({ modeSelect }), 1000)
        logseq.UI.showMsg("✔️ " + t("Set to DONE"), "success", { timeout: 3000, })
      })
    }
    // Register commands
    registerDoneCommand("setToDoneDefault", "Set to DONE  (default mode)", "", "As block property")
    registerDoneCommand("setToDoneBlockProperty", "Set to DONE  `As block property`", "", "As block property")
    registerDoneCommand("setToDoneInsert", "Set to DONE  `Insert block`", "", "Insert block")
    registerDoneCommand("setToDoneUpdate", "Set to DONE  `Update block`", "", "Update block")
  }

  //プロパティの中に、日付を連続で追加する
  if (logseq.settings!.addDateContinuously as boolean === true)
    logseq.Editor.registerBlockContextMenuItem(`💪 ${t("Add date into DONE property")}`, async ({ uuid }) => {
      const block = await logseq.Editor.getBlock(uuid) as TaskBlockEntity | null
      if (!block) return
      // 条件
      if (block.marker === "DONE" // DONEタスク
        && block.properties // プロパティがある
        && block.properties[logseq.settings!.customPropertyName as string || "completed"] // プロパティに指定のプロパティがある
      ) showDialog(block, true, `💪 ${t("Add date into DONE property")}`)
      else
        logseq.UI.showMsg(t("This is not a DONE task with the \"completed\" property"), "warning")
    })

  //Set to DONE
  logseq.Editor.registerBlockContextMenuItem(`💪 ${t("Set to DONE")}`, async ({ uuid }) => {
    const block = (await logseq.Editor.getBlock(uuid)) as TaskBlockEntity | null
    if (!block) return
    if (block.marker === "DONE")
      showDialog(block, false, `💪 ${t("Set to DONE")}`)
    else {
      //DONEタスクではなかった場合、DONEにする
      pushDONE(block)
      logseq.UI.showMsg(t("Set to DONE"), "success", { timeout: 3000, })
    }
  })

  if (logseq.settings!.smallDONEproperty === false)
    parent.document.body.classList.add(keySmallDONEproperty)


  // プラグイン設定の項目変更時
  logseq.onSettingsChanged((newSet: LSPluginBaseInfo["settings"], oldSet: LSPluginBaseInfo["settings"]) => {

    //見た目の変更
    if (oldSet.smallDONEproperty === false
      && newSet.smallDONEproperty === true)
      parent.document.body.classList!.remove(keySmallDONEproperty)
    else
      if (oldSet.smallDONEproperty === true
        && newSet.smallDONEproperty === false)
        parent.document.body.classList!.add(keySmallDONEproperty)

    //DONEプロパティの名称変更
    if (oldSet.customPropertyName !== newSet.customPropertyName)
      renamePage(oldSet.customPropertyName as string, newSet.customPropertyName as string)

    // CANCELEDプロパティの名称変更
    if (oldSet.cancelledTaskPropertyName !== newSet.cancelledTaskPropertyName)
      renamePage(oldSet.cancelledTaskPropertyName as string, newSet.cancelledTaskPropertyName as string)

    // WAITINGプロパティの名称変更
    if (oldSet.waitingTaskPropertyName !== newSet.waitingTaskPropertyName)
      renamePage(oldSet.waitingTaskPropertyName as string, newSet.waitingTaskPropertyName as string)

    // DOINGプロパティの名称変更
    if (oldSet.doingTaskPropertyName !== newSet.doingTaskPropertyName)
      renamePage(oldSet.doingTaskPropertyName as string, newSet.doingTaskPropertyName as string)

    // TODOプロパティの名称変更
    if (oldSet.todoTaskPropertyName !== newSet.todoTaskPropertyName)
      renamePage(oldSet.todoTaskPropertyName as string, newSet.todoTaskPropertyName as string)

    // トグル
    if (newSet.upperDONEproperty !== oldSet.upperDONEproperty) {
      if (newSet.upperDONEproperty === true)
        provideStyleMain(newSet.upperDONEproperty as boolean, logseqVersionMd)
      else
        removeProvideStyle(keyStyle)
    }
  })

  logseq.provideModel({
    [keySettingsButton]: () => logseq.showSettingsUI(),
  })

} /* end_main */



//add completed property to done task
//https://github.com/DimitryDushkin/logseq-plugin-task-check-date
const onBlockChanged = () =>
  logseq.DB.onChanged(async ({ blocks, txMeta }) => {

    if (logseq.settings!.onlyFromBulletList === true // ブロック操作によるものではない場合
      || processingButton === true //処理中の場合 
      || (txMeta
        && (txMeta["transact?"] === false //ユーザー操作ではない場合 (transactは取引の意味)
          || txMeta?.outlinerOp === "delete-blocks")) //ブロックが削除された場合
    ) return //処理しない

    processingButton = true

    //DONEタスクではないのに、completedプロパティ(それに相当する)をもつ場合は削除する
    if (logseq.settings!.removePropertyWithoutDONEtask === true) {
      const CompletedOff: TaskBlockEntity | undefined = blocks.find(({ marker, properties }) =>
        marker !== "DONE"// DONEタスクではない
        && properties
        && properties[logseq.settings!.customPropertyName as string || "completed"] // プロパティに指定のプロパティがあるか、completedプロパティがあるか
      ) as BlockEntity | undefined

      //見つかった場合は削除する
      if (CompletedOff) {
        //プロパティを削除する
        logseq.Editor.removeBlockProperty(CompletedOff.uuid, logseq.settings!.customPropertyName as string || "completed")
        //stringプロパティも削除する
        if (CompletedOff.properties!.string)
          logseq.Editor.removeBlockProperty(CompletedOff.uuid, "string")
      }
    }

    //CANCELLEDタスクではないのに、cancelledプロパティ(それに相当する)をもつ場合は削除する
    if (logseq.settings!.removePropertyWithoutCANCELLEDtask === true) {
      const canceledOff: TaskBlockEntity | undefined = blocks.find(({ marker, properties }) =>
        marker !== "CANCELED" // CANCELLEDタスクではない
        && marker !== "CANCELLED" // CANCELLEDタスクではない
        && properties
        && properties[logseq.settings!.cancelledTaskPropertyName as string || "cancelled"] // プロパティに指定のプロパティがあるか、cancelledプロパティがあるか
      ) as BlockEntity | undefined

      //見つかった場合は削除する
      if (canceledOff) {
        //プロパティを削除する
        logseq.Editor.removeBlockProperty(canceledOff.uuid, logseq.settings!.cancelledTaskPropertyName as string || "cancelled")
        //stringプロパティも削除する
        if (canceledOff.properties!.string)
          logseq.Editor.removeBlockProperty(canceledOff.uuid, "string")
      }
    }

    //WAITINGタスクではないのに、waitingプロパティ(それに相当する)をもつ場合は削除する
    if (logseq.settings!.removePropertyWithoutWAITINGtask === true) {
      const waitingOff: TaskBlockEntity | undefined = blocks.find(({ marker, properties }) =>
        marker !== "WAITING" // WAITINGタスクではない
        && properties
        && properties[logseq.settings!.waitingTaskPropertyName as string || "waiting"] // プロパティに指定のプロパティがあるか、waitingプロパティがあるか
      ) as BlockEntity | undefined

      //見つかった場合は削除する
      if (waitingOff) {
        //プロパティを削除する
        logseq.Editor.removeBlockProperty(waitingOff.uuid, logseq.settings!.waitingTaskPropertyName as string || "waiting")
        //stringプロパティも削除する
        if (waitingOff.properties!.string)
          logseq.Editor.removeBlockProperty(waitingOff.uuid, "string")
      }
    }

    //DOINGタスクではないのに、doingプロパティ(それに相当する)をもつ場合は削除する
    if (logseq.settings!.removePropertyWithoutDOINGtask === true) {
      const doingOff: TaskBlockEntity | undefined = blocks.find(({ marker, properties }) =>
        marker !== "DOING" // DOINGタスクではない
        && properties
        && properties[logseq.settings!.doingTaskPropertyName as string || "during"] // プロパティに指定のプロパティがあるか、duringプロパティがあるか
      ) as BlockEntity | undefined

      //見つかった場合は削除する
      if (doingOff) {
        //プロパティを削除する
        logseq.Editor.removeBlockProperty(doingOff.uuid, logseq.settings!.doingTaskPropertyName as string || "during")
        //stringプロパティも削除する
        if (doingOff.properties!.string)
          logseq.Editor.removeBlockProperty(doingOff.uuid, "string")
      }
    }

    //TODOタスクではないのに、createdプロパティ(それに相当する)をもつ場合は削除する
    if (logseq.settings!.removePropertyWithoutTODOtask === true) {
      const todoOff: TaskBlockEntity | undefined = blocks.find(({ marker, properties }) =>
        marker !== "TODO" // TODOタスクではない
        && properties
        && properties[logseq.settings!.todoTaskPropertyName as string || "created"] // プロパティに指定のプロパティがあるか、createdプロパティがあるか
      ) as BlockEntity | undefined

      //見つかった場合は削除する
      if (todoOff) {
        //プロパティを削除する
        logseq.Editor.removeBlockProperty(todoOff.uuid, logseq.settings!.todoTaskPropertyName as string || "created")
        //stringプロパティも削除する
        if (todoOff.properties!.string)
          logseq.Editor.removeBlockProperty(todoOff.uuid, "string")
      }
    }

    // タスクをもつブロックがあるかどうか
    const taskBlock: TaskBlockEntity | undefined = blocks.find(({ marker }) =>
      (logseq.settings!.DONEtask as boolean === true
        && marker === "DONE")
      || (logseq.settings!.cancelledTask as boolean === true
        && (marker === "CANCELED"
          || marker === "CANCELLED"))
      || (logseq.settings!.waitingTask as boolean === true
        && marker === "WAITING")
      || (logseq.settings!.doingTask as boolean === true
        && marker === "DOING")
      || (logseq.settings!.todoTask as boolean === true
        && marker === "TODO")) //TODOタスクを取得する
    //saveBlock以外は処理しない
    if (!taskBlock) {
      setTimeout(() => processingButton = false, 100)
      return
    } else {
      //チェックボタンからの場合は、現在のブロックと一致しない

      //ダイアログを表示
      if (logseq.settings!.DONEtask as boolean === true
        && taskBlock.marker === "DONE") {
        if (logseq.settings!.useDialog as boolean === true)
          showDialog(taskBlock, false)
        else
          if (!(taskBlock.properties
            && taskBlock.properties[logseq.settings!.customPropertyName as string || "completed"]))
            doneTask(taskBlock) //DONEタスクにプロパティを追加する (ダイアログを使わないでそのまま処理)
      } else
        if (taskBlock.properties)
          if ((logseq.settings!.cancelledTask as boolean === true
            && (taskBlock.marker === "CANCELED"
              || taskBlock.marker === "CANCELLED")
            && !taskBlock.properties[logseq.settings!.cancelledTaskPropertyName as string || "cancelled"]))
            cancelledTask(taskBlock) //CANCELLEDタスクにプロパティを追加する (ダイアログを使わないでそのまま処理)
          else
            if ((logseq.settings!.waitingTask as boolean === true
              && taskBlock.marker === "WAITING"
              && !taskBlock.properties[logseq.settings!.waitingTaskPropertyName as string || "waiting"]))
              waitingTask(taskBlock) //WAITINGタスクにプロパティを追加する (ダイアログを使わないでそのまま処理)
            else
              if ((logseq.settings!.doingTask as boolean === true
                && taskBlock.marker === "DOING"
                && !taskBlock.properties[logseq.settings!.doingTaskPropertyName as string || "during"]))
                doingTask(taskBlock) //DOINGタスクにプロパティを追加する (ダイアログを使わないでそのまま処理)
              else
                if ((logseq.settings!.todoTask as boolean === true
                  && taskBlock.marker === "TODO"
                  && !taskBlock.properties[logseq.settings!.todoTaskPropertyName as string || "created"]))
                  todoTask(taskBlock) //TODOタスクにプロパティを追加する (ダイアログを使わないでそのまま処理)


      setTimeout(() => processingButton = false, 300)
    }
  })


let processingShowDialog: Boolean = false
const showDialog = async (taskBlock: TaskBlockEntity, additional: Boolean, addTitle?: string) => {
  if (additional === false
    && taskBlock.properties![logseq.settings!.customPropertyName as string || "completed"]) return //すでにプロパティがある場合は追加しない

  //ブロック操作でDONEではなくなった場合
  logseq.DB.onBlockChanged(taskBlock.uuid, async (block: TaskBlockEntity) => {
    //DONEを入力してからブロックでキャンセルした場合にダイアログを消す
    if (block.marker !== "DONE") removeDialog()
  })

  if (processingShowDialog === true
    || parent.document.getElementById(`${logseq.baseInfo.id}--${key}`) as HTMLDivElement) return //すでにダイアログがある場合は追加しない
  processingShowDialog = true
  //ダイアログを表示
  await showDialogProcess(taskBlock, addTitle, additional) //ロック解除
  setTimeout(() => processingShowDialog = false, 1000)

} //end showDialog


// アプリ世代のチェック 旧UI系統(0.10.x以下またはOG 1.x系)ならtrue、新UI系統(DB系アプリ)ならfalse
const checkLogseqVersion = async (): Promise<boolean> => {
  const info = (await logseq.App.getInfo()) as AppInfo | null
  const versionString = typeof info?.version === "string" ? info.version : "0.0.0"
  //  0.11.0もしくは0.11.0-alpha+nightly.20250427のような形式なので、先頭の3つの数値(1桁、2桁、2桁)を正規表現で取得する
  const version = versionString.match(/(\d+)\.(\d+)\.(\d+)/)
  if (version) {
    logseqVersion = version[0] //バージョンを取得
    // console.log("logseq version: ", logseqVersion)

    // 0.11.x以降または2.x以降は新UI系統(DB系アプリ)。0.10.x以下とOG 1.x系は旧UI系統
    const isDbEra = Number(version[1]) >= 2
      || (Number(version[1]) === 0 && Number(version[2]) >= 11)
    logseqVersionMd = !isDbEra
    return !isDbEra
  } else logseqVersion = "0.0.0"
  return false
}
// DBグラフかどうかのチェック(公式API。0.10.x系ホストには未実装のためfalse)
const checkLogseqDbGraph = async (): Promise<boolean> => {
  try {
    const value = await (logseq.App as any).checkCurrentIsDbGraph()
    return typeof value === "boolean" ? value : false
  } catch {
    return false // API非搭載ホスト = DBグラフを開けない旧アプリ
  }
}

const showDbGraphIncompatibilityMsg = () => {
  logseq.UI.showMsg("The ’DONE task property’ plugin does not support Logseq DB graph.", "warning", { timeout: 5000 })
  return
}

logseq.ready(main).catch(console.error)