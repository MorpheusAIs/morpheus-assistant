import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Morpheus Assistant",
  description:
    "A multi-platform AI chatbot powered by the Morpheus decentralized AI network.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
