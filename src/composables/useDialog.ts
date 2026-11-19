import { nextTick, onBeforeUnmount, shallowRef, watch, type Ref } from 'vue'

let openDialogs = 0
let previousOverflow = ''

export function useDialog(open: Ref<boolean>) {
  const dialogRef = shallowRef<HTMLElement | null>(null)
  let returnFocus: HTMLElement | null = null
  let locked = false
  function onKeydown(event: KeyboardEvent) {
    if (!open.value || !dialogRef.value) return
    if (event.key === 'Escape') { event.preventDefault(); open.value = false }
    if (event.key !== 'Tab') return
    const items = [...dialogRef.value.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')].filter(el => el.getClientRects().length > 0)
    const first = items[0]
    const last = items.at(-1)
    if (!first) { event.preventDefault(); dialogRef.value.focus() }
    else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.value)) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.value)) { event.preventDefault(); first.focus() }
  }
  function release() {
    if (!locked) return
    document.removeEventListener('keydown', onKeydown)
    openDialogs = Math.max(0, openDialogs - 1)
    if (!openDialogs) document.body.style.overflow = previousOverflow
    locked = false
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
  }
  watch(open, async value => {
    if (!value) { release(); return }
    returnFocus = document.activeElement as HTMLElement | null
    if (!locked) {
      if (!openDialogs) previousOverflow = document.body.style.overflow
      openDialogs++; locked = true
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', onKeydown)
    }
    await nextTick()
    if (open.value) dialogRef.value?.focus({ preventScroll: true })
  }, { immediate: true })
  onBeforeUnmount(release)
  return { dialogRef }
}
