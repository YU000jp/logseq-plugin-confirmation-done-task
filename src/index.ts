import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { logseq as PL } from "../package.json";
const pluginId = PL.id; //set plugin id from package.json
import { AppGraphInfo, AppUserConfigs, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import { format } from 'date-fns';
import Swal from 'sweetalert2';


/* main */
const main = () => {
  console.info(`#${pluginId}: MAIN`); //console
  (async () => {
    try {
      await l10nSetup({ builtinTranslations: { ja } });
    } finally {
      /* user settings */
      logseq.useSettingsSchema(settingsTemplate);
      if (!logseq.settings) {
        setTimeout(() => {
          logseq.showSettingsUI();
        }
          , 300);
      }
    }
  })();


  //get theme color (For SweetAlert2)
  //checkboxなどはCSSで上書きする必要あり
  let sweetAlert2background;  //color: sweetAlert2color
  let sweetAlert2color; //background: sweetAlert2background
  const rootThemeColor = () => {
    const root = parent.document.querySelector(":root");
    if (root) {
      const rootStyles = getComputedStyle(root);
      sweetAlert2background = rootStyles.getPropertyValue("--ls-block-properties-background-color") || "#ffffff";
      sweetAlert2color = rootStyles.getPropertyValue("--ls-primary-text-color") || "#000000";
    }
  };
  rootThemeColor();
  logseq.App.onThemeModeChanged(() => { rootThemeColor(); });
  //end


  //add completed property to done task
  //https://github.com/DimitryDushkin/logseq-plugin-task-check-date
  let blockSet = "";
  logseq.DB.onChanged(async ({ blocks }) => {
    //check current graph
    const graph = await logseq.App.getCurrentGraph() as AppGraphInfo | null;
    if (graph === null) {//デモグラフの場合は返り値がnull
      return;
    }
    const TASK_MARKERS = new Set(["DONE", "NOW", "LATER", "DOING", "TODO", "WAITING"]);
    const taskBlock = blocks.find((block) => TASK_MARKERS.has(block.marker));
    if (!taskBlock) {
      return;
    }
    if (blockSet !== taskBlock.uuid) {
      blockSet = "";//ほかのブロックを触ったら解除する
      if (taskBlock.marker === "DONE") {
        if (taskBlock.properties![logseq.settings?.customPropertyName || "completed"]) {
          return;
        }
        const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
        const today: Date = new Date();
        const year: number = today.getFullYear();
        const month: string = ("0" + ((today.getMonth() as number) + 1)).slice(-2);
        const day: string = ("0" + (today.getDate() as number)).slice(-2);
        const todayFormatted = `${year}-${month}-${day}`;
        let addTime = "";
        if (logseq.settings?.addTime === true) {
          addTime = `<input id="swal-input2" class="swal2-input" type="time" value="${("0" + (today.getHours() as number)).slice(-2)}:${("0" + (today.getMinutes() as number)).slice(-2)}"/>`;
        } else {
          addTime = '<input id="swal-input2" class="swal2-input" type="hidden" value=""/>';
        }
        //dialog
        await logseq.showMainUI();
        const { value: formValues } = await Swal.fire<{
          input1: string;
          input2: string;
        }>({
          title: "Add the property to the block?",
          text: "",
          icon: "info",
          showCancelButton: true,
          html: `<input id="swal-input1" class="swal2-input" type="date" value="${todayFormatted}"/>${addTime}`,//type:dateが指定できないためhtmlとして作成
          focusConfirm: false,
          color: sweetAlert2color,
          background: sweetAlert2background,
          preConfirm: () => {
            const input1 = (document.getElementById('swal-input1') as HTMLInputElement)!.value;
            let input2;
            const valueInput2 = (document.getElementById('swal-input2') as HTMLInputElement)!.value || "";
            if (valueInput2) {
              input2 = ` **${valueInput2}**`;
            } else {
              input2 = "";
            }
            return {
              input1,
              input2,
            };
          }
        });
        if (formValues) {
          if (formValues?.input1) {//OK

            const FormattedDateUser = await format(new Date(formValues?.input1), preferredDateFormat);
            logseq.Editor.upsertBlockProperty(taskBlock.uuid, logseq.settings?.customPropertyName || "completed", FormattedDateUser + formValues?.input2);
          } else {//Cancel
            //user cancel in dialog
            logseq.UI.showMsg("Cancel", "warning");
            blockSet = taskBlock.uuid;//キャンセルだったらブロックをロックする
          }
        }
        await logseq.hideMainUI();
        //dialog end
      }
    } else {
      blockSet = taskBlock.uuid;
    }
  });
  //end

  console.info(`#${pluginId}: loaded`);//console
};/* end_main */



/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
const settingsTemplate: SettingSchemaDesc[] = [
  {
    key: "addTime",
    title: "Use the property for the date with time",
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "customPropertyName",
    title: "Custom property name",
    type: "string",
    default: "completed",
    description: "`completed` is the default.",
  },
];


logseq.ready(main).catch(console.error);