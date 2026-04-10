export function useMemoEncrypt() {
  async function deriveKey(password: string, salt: Uint8Array) {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )
  }

  function toBase64(buf: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buf)))
  }

  function fromBase64(str: string) {
    return Uint8Array.from(atob(str), c => c.charCodeAt(0))
  }

  async function encrypt(plaintext: string, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await deriveKey(password, salt)
    const enc = new TextEncoder()
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
    return JSON.stringify({
      s: toBase64(salt),
      i: toBase64(iv),
      c: toBase64(ciphertext),
    })
  }

  async function decrypt(encrypted: string, password: string): Promise<string> {
    const { s, i, c } = JSON.parse(encrypted)
    const salt = fromBase64(s)
    const iv = fromBase64(i)
    const ciphertext = fromBase64(c)
    const key = await deriveKey(password, salt)
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
    return new TextDecoder().decode(plaintext)
  }

  return { encrypt, decrypt }
}
