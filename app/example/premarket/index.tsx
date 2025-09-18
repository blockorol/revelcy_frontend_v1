import React from "react";
import FolderIndex from "../FolderIndex";
import { getSectionRoutes } from "../routes";

export default function PremarketIndex() {
  return <FolderIndex title="premarket" items={getSectionRoutes("premarket")} />;
}
