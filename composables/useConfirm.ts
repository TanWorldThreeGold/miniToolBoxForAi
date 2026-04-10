const visible = ref(false)
const message = ref('')
let _resolve: ((v: boolean) => void) | null = null

export function useConfirm() {
  function confirm(msg: string): Promise<boolean> {
    message.value = msg
    visible.value = true
    return new Promise((resolve) => {
      _resolve = resolve
    })
  }

  function handleResult(result: boolean) {
    visible.value = false
    _resolve?.(result)
    _resolve = null
  }

  return { visible, message, confirm, handleResult }
}
