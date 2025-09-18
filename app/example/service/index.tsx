import React from "react";
import FolderIndex from "../FolderIndex";
import { getSectionRoutes } from "../routes";

export default function ServiceIndex() {
  return <FolderIndex title="service" items={getSectionRoutes("service")} />;
}
