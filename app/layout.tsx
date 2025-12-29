import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZIYU_ARCHIVE",
  description: "Notion Web Hub UI A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 <meta
  name="viewport"
  content="width=1200, initial-scale=1"
/>

  return (
    
    <html lang="ko">
      <body>
        <div className="hub-shell">{children}</div>
      </body>
    </html>
  );
}
