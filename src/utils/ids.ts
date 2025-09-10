import { customAlphabet } from "nanoid";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0,1,O,I para evitar confusión
export const nanoid10 = customAlphabet(ALPHABET, 10);
