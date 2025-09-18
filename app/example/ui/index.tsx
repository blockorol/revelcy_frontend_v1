import React from "react";
import FolderIndex from "../FolderIndex";
import { getSectionRoutes } from "../routes";

export default function UiIndex() {
  return <FolderIndex title="ui" items={getSectionRoutes("ui")} />;
}
