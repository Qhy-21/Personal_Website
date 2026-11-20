import { onMounted, onUnmounted } from 'vue'

const CARD_SELECTOR = [
  '.pixel-card', '.project-card', '.interest-section', '.pixel-window',
  '.orbit-card', '.planet-panel', '.profile-section', '.waline-card',
  '.reader-main', '.song-card', '.bracket-wrap', '.bookshelf', '.book-3d', '.resume-notice',
  '.project-modal-inner', '.interest-modal-inner', '.visitor-modal-inner',
  '.avatar-dialog', '.qr-dialog', '.xusong-confirm-card',
].join(',')
type LightState = { x: string; y: string; visible: boolean }

export function useSharedCardLight() {
  const cards = new Set<HTMLElement>()
  const visibleCards = new Set<HTMLElement>()
  const rectangles = new WeakMap<HTMLElement, DOMRect>()
  const written = new WeakMap<HTMLElement, LightState>()
  const lightLayers = new WeakMap<HTMLElement, HTMLElement>()
  let mutationObserver: MutationObserver | null = null
  let intersectionObserver: IntersectionObserver | null = null
  let cardResizeObserver: ResizeObserver | null = null
  let pointerMedia: MediaQueryList | null = null
  let animationFrame = 0
  let pointerX = 0
  let pointerY = 0
  let pointerPresent = false
  let geometryDirty = true
  let active = false

  function setVisible(card: HTMLElement, visible: boolean) {
    const state = written.get(card)
    if (!state || state.visible === visible) return
    lightLayers.get(card)?.style.setProperty('--card-light-visible', visible ? '1' : '0')
    state.visible = visible
  }
  function updateLight() {
    animationFrame = 0
    if (!active || !pointerPresent || document.hidden) return
    // Moving the pointer never reads layout. Positions are cached until a
    // scroll, resize, disclosure, or content change actually changes geometry.
    if (geometryDirty) {
      for (const card of visibleCards) {
        if (card.isConnected) rectangles.set(card, card.getBoundingClientRect())
      }
      geometryDirty = false
    }
    for (const card of visibleCards) {
      const rect = rectangles.get(card)
      const state = written.get(card)
      const layer = lightLayers.get(card)
      if (!rect || !state || !layer) continue
      const distanceX = Math.max(rect.left - pointerX, 0, pointerX - rect.right)
      const distanceY = Math.max(rect.top - pointerY, 0, pointerY - rect.bottom)
      const lit = Math.hypot(distanceX, distanceY) < 360
      if (lit) {
        const x = `${Math.round(pointerX - rect.left)}px`
        const y = `${Math.round(pointerY - rect.top)}px`
        if (state.x !== x) { layer.style.setProperty('--card-light-x', x); state.x = x }
        if (state.y !== y) { layer.style.setProperty('--card-light-y', y); state.y = y }
      }
      setVisible(card, lit)
    }
  }
  function scheduleUpdate() {
    if (active && pointerPresent && !document.hidden && !animationFrame) animationFrame = requestAnimationFrame(updateLight)
  }
  function invalidateGeometry() {
    geometryDirty = true
    scheduleUpdate()
  }
  function onPointerMove(event: PointerEvent) {
    if (event.pointerType === 'touch' || !active) return
    const x = Math.round(event.clientX)
    const y = Math.round(event.clientY)
    if (pointerPresent && pointerX === x && pointerY === y) return
    pointerX = x
    pointerY = y
    pointerPresent = true
    scheduleUpdate()
  }
  function clearLight() {
    pointerPresent = false
    cancelAnimationFrame(animationFrame)
    animationFrame = 0
    visibleCards.forEach(card => setVisible(card, false))
  }
  function registerCard(card: HTMLElement) {
    if (cards.has(card)) return
    cards.add(card)
    written.set(card, { x: '', y: '', visible: false })
    card.setAttribute('data-card-light', '')
    const layer = document.createElement('span')
    layer.className = 'card-light-layer'
    layer.setAttribute('aria-hidden', 'true')
    lightLayers.set(card, layer)
    card.append(layer)
    intersectionObserver?.observe(card)
    cardResizeObserver?.observe(card)
  }
  function registerTree(node: Node) {
    if (!(node instanceof HTMLElement)) return
    if (node.matches(CARD_SELECTOR)) registerCard(node)
    node.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach(registerCard)
  }
  function start() {
    if (active) return
    active = true
    geometryDirty = true
    cardResizeObserver = new ResizeObserver(invalidateGeometry)
    intersectionObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const card = entry.target as HTMLElement
        if (entry.isIntersecting) visibleCards.add(card)
        else { visibleCards.delete(card); setVisible(card, false) }
      }
      invalidateGeometry()
    }, { rootMargin: '24px' })
    registerTree(document.body)
    mutationObserver = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(registerTree))
      if (records.some(record => record.removedNodes.length)) {
        for (const card of cards) {
          if (!card.isConnected) {
            intersectionObserver?.unobserve(card)
            cardResizeObserver?.unobserve(card)
            visibleCards.delete(card)
            cards.delete(card)
            lightLayers.get(card)?.remove()
            card.removeAttribute('data-card-light')
          }
        }
      }
      invalidateGeometry()
    })
    const main = document.querySelector('.site-main')
    if (main) mutationObserver.observe(main, { childList: true, subtree: true })
    // Teleported dialogs are direct body children. Dock text and unrelated
    // components do not need a document-wide subtree observer.
    mutationObserver.observe(document.body, { childList: true })
    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', clearLight)
    document.addEventListener('scroll', invalidateGeometry, { passive: true, capture: true })
    document.addEventListener('visibilitychange', clearLight)
    document.addEventListener('toggle', invalidateGeometry, true)
    window.addEventListener('blur', clearLight)
    window.addEventListener('resize', invalidateGeometry, { passive: true })
  }
  function stop() {
    clearLight()
    active = false
    mutationObserver?.disconnect()
    intersectionObserver?.disconnect()
    cardResizeObserver?.disconnect()
    document.removeEventListener('pointermove', onPointerMove)
    document.documentElement.removeEventListener('pointerleave', clearLight)
    document.removeEventListener('scroll', invalidateGeometry, true)
    document.removeEventListener('visibilitychange', clearLight)
    document.removeEventListener('toggle', invalidateGeometry, true)
    window.removeEventListener('blur', clearLight)
    window.removeEventListener('resize', invalidateGeometry)
    cards.forEach(card => {
      card.removeAttribute('data-card-light')
      lightLayers.get(card)?.remove()
    })
    cards.clear()
    visibleCards.clear()
  }
  function syncCapability() { if (pointerMedia?.matches) start(); else stop() }

  onMounted(() => {
    pointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)')
    pointerMedia.addEventListener('change', syncCapability)
    syncCapability()
  })
  onUnmounted(() => {
    pointerMedia?.removeEventListener('change', syncCapability)
    stop()
  })
}
