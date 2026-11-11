
export const metadata = {
  title: "Arth Coffee House & Restaurant | AI Review Generator",
  description:
    "Share your experience at Arth Coffee House & Restaurant, Clement Town, Dehradun.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#ffffff",
        }}
      >
        {children}
      </body>
    </html>
  );
}
