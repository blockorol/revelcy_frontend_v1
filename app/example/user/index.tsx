import React from "react";
import FolderIndex from "../FolderIndex";
import { getSectionRoutes } from "../routes";

export default function UserIndex() {
  return <FolderIndex title="user" items={getSectionRoutes("user")} />;
}
