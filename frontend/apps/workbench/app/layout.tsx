import type { Metadata } from "next";
import { WorkbenchAppShell } from "../app-shell/workbench-app-shell";
import "@aivis/ui-library/theme.scss";
import "@xyflow/react/dist/style.css";
import "./workbench.scss";

export const metadata: Metadata = {
  title: "AI Visualisation Workbench",
  description: "Evidence Workbench shell with local synthetic fixture content."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>
        <WorkbenchAppShell>{children}</WorkbenchAppShell>
      </body>
    </html>
  );
}
