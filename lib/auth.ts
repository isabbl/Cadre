import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  AuthError,
} from "firebase/auth";
import { auth } from "./firebase";

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "auth/user-not-found":
      return "Email não encontrado.";
    case "auth/wrong-password":
      return "Senha incorreta.";
    case "auth/invalid-credential":
      return "Email ou senha incorretos.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
    case "auth/invalid-email":
      return "Email inválido.";
    default:
      return "Erro ao fazer login. Tente novamente.";
  }
}
