import { AppGraphInfo } from "@logseq/libs/dist/LSPlugin.user";
import { key } from ".";

export const checkDemoGraph = async (): Promise<boolean> => ((await logseq.App.getCurrentGraph()) as AppGraphInfo | null) === null
  ? true
  : false; //デモグラフの場合は返り値がnull
export function removeDialog() {
  const element = parent.document.getElementById(
    logseq.baseInfo.id + `--${key}`
  ) as HTMLDivElement | null;
  if (element) element.remove();
}

