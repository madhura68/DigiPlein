export type BuildInfo = {
  version: string
  builtAt: string | null
  builtAtLabel: string
}

const formatter = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/Amsterdam',
})

function formatBuildTime(value: string | undefined): Pick<BuildInfo, 'builtAt' | 'builtAtLabel'> {
  if (!value) return { builtAt: null, builtAtLabel: 'Onbekend' }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { builtAt: null, builtAtLabel: 'Onbekend' }
  }

  return {
    builtAt: value,
    builtAtLabel: formatter.format(date),
  }
}

export function getBuildInfo(): BuildInfo {
  const { builtAt, builtAtLabel } = formatBuildTime(process.env.NEXT_PUBLIC_BUILD_TIME)

  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'Onbekend',
    builtAt,
    builtAtLabel,
  }
}
