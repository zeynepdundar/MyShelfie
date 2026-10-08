import { EmailAuthForm } from "@/components/EmailAuthForm";

/** Misafir hesabı e-posta/şifreye bağlar; kitaplar aynı uid'de kalır. */
export default function LinkAccount() {
  return <EmailAuthForm initialMode="link" />;
}
