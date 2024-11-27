// app/layout.js or pages/_app.js
import { AuthProvider } from "../lib/AuthContext";
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
