export const metadata = {
  title: "Mentor Trader",
  description: "Assistente de trading",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 min-h-screen">
        <main className="p-4">
          {children}
        </main>
      </body>
    </html>
  );
}

