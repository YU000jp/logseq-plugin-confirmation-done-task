import "@logseq/libs" //https://plugins-doc.logseq.com/
import { BlockEntity, LSPluginBaseInfo, } from "@logseq/libs/dist/LSPlugin.user"
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { pushDONE, removeDialog } from "./lib"
import { settingsTemplate } from "./settings"
import { provideStyleMain } from "./style"
import ja from "./translations/ja.json"
import af from "./translations/af.json"
import de from "./translations/de.json"
import es from "./translations/es.json"
import fr from "./translations/fr.json"
import id from "./translations/id.json"
import it from "./translations/it.json"
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
import { renamePage } from "./lib"
import { showDialog } from "./dialog"
export const keySmallDONEproperty = "not-smallDONEproperty"
export const key = "DONEdialog"
let onBlockChangedToggle: boolean = false
let processing: boolean = false

let configPreferredDateFormat: string
export const getConfigPreferredDateFormat = (): string => configPreferredDateFormat


const getUserConfig = async () => {
  const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: string }
  configPreferredDateFormat = preferredDateFormat
}


/* main */
const main = async () => {
  await l10nSetup({
    builtinTranslations: {//Full translations
      ja, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant
    }
  })

  await getUserConfig()

  /* user settings */
  logseq.useSettingsSchema(settingsTemplate())
  if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300)


  provideStyleMain()


  //ページ読み込み時
  logseq.App.onPageHeadActionsSlotted(() => startOnBlock())
  logseq.App.onRouteChanged(() => startOnBlock())

  //グラフ変更時
  logseq.App.onCurrentGraphChanged(() => startOnBlock())

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

  //プロパティの中に、日付を連続で追加する
  logseq.Editor.registerBlockContextMenuItem(`💪 ${t("Add into DONE property")}`, async ({ uuid }) => {
    const block = await logseq.Editor.getBlock(uuid) as BlockEntity | null
    if (!block) return
    // 条件
    if (block.marker === "DONE" // DONEタスク
      && block.properties // プロパティがある
      && block.properties[logseq.settings!.customPropertyName as string] // プロパティに指定のプロパティがある
    ) showDialog(block, true, `💪 ${t("Add into DONE property")}`)
    else
      logseq.UI.showMsg(t("This is not a DONE task with the \"completed\" property"), "warning")
  })

  //Set to DONE
  logseq.Editor.registerBlockContextMenuItem(`💪 ${t("Set to DONE")}`, async ({ uuid }) => {
    const block = (await logseq.Editor.getBlock(uuid)) as BlockEntity | null
    if (!block) return
    if (block.marker === "DONE") showDialog(block, false, `💪 ${t("Set to DONE")}`)
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

    //プロパティの変更
    if (oldSet.customPropertyName !== newSet.customPropertyName)
      renamePage(oldSet.customPropertyName as string, newSet.customPropertyName as string)
  })

  logseq.provideModel({
    settingsButton: () => logseq.showSettingsUI(),
  })

} /* end_main */



//add completed property to done task
//https://github.com/DimitryDushkin/logseq-plugin-task-check-date
const onBlockChanged = () => logseq.DB.onChanged(async ({ blocks, txMeta }) => {
  if (logseq.settings!.onlyFromBulletList === true //ブロック操作でDONEではなくなった場合
    || processing === true //処理中の場合 
    || (txMeta && txMeta["transact?"] === false) //ユーザー操作ではない場合 (transactは取引の意味)
  ) return //処理しない

  processing = true

  //DONEタスクではないのに、completedプロパティ(それに相当する)をもつ場合は削除する
  if (logseq.settings!.removePropertyWithoutDONEtask === true) {
    const CompletedOff = blocks.find(({ marker, properties }) =>
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

  const taskBlock = blocks.find(({ marker }) => marker === "DONE") //DONEタスクを取得する
  //saveBlock以外は処理しない
  if (!taskBlock) {
    setTimeout(() => processing = false, 100)
    return
  }

  //チェックボタンからの場合は、現在のブロックと一致しない

  //ダイアログを表示
  showDialog(taskBlock as BlockEntity, false)

  setTimeout(() => processing = false, 100)
})


logseq.ready(main).catch(console.error)
