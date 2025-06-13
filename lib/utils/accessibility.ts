export interface AriaAttributes {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-controls'?: string
  'aria-expanded'?: boolean
  'aria-hidden'?: boolean
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-busy'?: boolean
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  'aria-disabled'?: boolean
  'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup'
  'aria-grabbed'?: boolean
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
  'aria-invalid'?: boolean | 'grammar' | 'spelling'
  'aria-pressed'?: boolean | 'mixed'
  'aria-selected'?: boolean
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'
  'aria-valuemax'?: number
  'aria-valuemin'?: number
  'aria-valuenow'?: number
  'aria-valuetext'?: string
  role?: string
}

export function getAriaAttributes(attributes: Partial<AriaAttributes>): Partial<AriaAttributes> {
  return Object.fromEntries(
    Object.entries(attributes).filter(([_, value]) => value !== undefined && value !== null)
  ) as Partial<AriaAttributes>
}

export function getErrorMessageAttributes(errorId: string): Partial<AriaAttributes> {
  return getAriaAttributes({
    'aria-invalid': true,
    'aria-describedby': errorId,
  })
}

export function getLabelAttributes(labelId: string): Partial<AriaAttributes> {
  return getAriaAttributes({
    'aria-labelledby': labelId,
  })
}

export function getDescriptionAttributes(descriptionId: string): Partial<AriaAttributes> {
  return getAriaAttributes({
    'aria-describedby': descriptionId,
  })
}

export function getButtonAttributes(
  label: string,
  expanded?: boolean,
  controls?: string
): Partial<AriaAttributes> {
  return getAriaAttributes({
    'aria-label': label,
    'aria-expanded': expanded,
    'aria-controls': controls,
    role: 'button',
  })
}

export function getMenuAttributes(
  label: string,
  expanded: boolean,
  controls: string
): Partial<AriaAttributes> {
  return getAriaAttributes({
    'aria-label': label,
    'aria-expanded': expanded,
    'aria-controls': controls,
    role: 'menu',
  })
}

export function getMenuItemAttributes(
  label: string,
  disabled?: boolean,
  selected?: boolean
): Partial<AriaAttributes> {
  return getAriaAttributes({
    'aria-label': label,
    'aria-disabled': disabled,
    'aria-selected': selected,
    role: 'menuitem',
  })
}

export function getTabAttributes(
  label: string,
  selected: boolean,
  controls: string
): Partial<AriaAttributes> {
  return getAriaAttributes({
    'aria-label': label,
    'aria-selected': selected,
    'aria-controls': controls,
    role: 'tab',
  })
}

export function getTabPanelAttributes(
  label: string,
  hidden: boolean,
  labelledBy: string
): Partial<AriaAttributes> {
  return getAriaAttributes({
    'aria-label': label,
    'aria-hidden': hidden,
    'aria-labelledby': labelledBy,
    role: 'tabpanel',
  })
} 
