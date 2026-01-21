"use client";
import type { FC } from "react";
import { cn } from "@/lib/utils";

export interface ReactPreviewProps {
  code: string;
  className?: string;
  height?: number | string;
  title?: string;
}

function buildSrcDoc(code: string): string {
  const safeCode = code.replaceAll("</script>", "<\\/script>");
  const html = [
    "<!doctype html>",
    "<html>",
    "<head>",
    '<meta charset="utf-8"/>',
    '<meta name="viewport" content="width=device-width,initial-scale=1"/>',
    "<style>html,body,#root{height:100%;margin:0;padding:0;}</style>",
    "</head>",
    "<body>",
    '<div id="root"></div>',
    '<script src="https://unpkg.com/react@19.2.0/umd/react.development.js"></script>',
    '<script src="https://unpkg.com/react-dom@19.2.0/umd/react-dom.development.js"></script>',
    '<script src="https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.7/babel.min.js"></script>',
    '<script>window.onerror=function(m){var el=document.createElement("pre");el.textContent=String(m);el.style.color="red";document.body.appendChild(el);};</script>',
    '<script type="text/babel" data-presets="typescript,react">',
    safeCode,
    '\nconst root = ReactDOM.createRoot(document.getElementById("root"));',
    "\nroot.render(React.createElement(App));",
    "</script>",
    "</body>",
    "</html>",
  ].join("");
  return html;
}

const ReactPreview: FC<ReactPreviewProps> = ({
  code,
  className,
  height,
  title,
}) => {
  const iframeHeight =
    typeof height === "number" ? `${height}px` : (height ?? "400px");
  const srcDoc = buildSrcDoc(code);
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-sm",
        className,
      )}
    >
      <iframe
        title={title ?? "React Preview"}
        srcDoc={srcDoc}
        className="w-full"
        style={{ height: iframeHeight }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default ReactPreview;
