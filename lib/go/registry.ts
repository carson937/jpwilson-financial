import config from '../caps-tracking/jp-wilson.json' with { type: 'json' }
import type { ClientTrackingConfig } from '@/lib/caps-tracking/config'
import type { GoRegistry } from '@/lib/caps-tracking/go'
import links from './links.json' with { type: 'json' }

/**
 * JP's /go/<code> registry. Data lives in links.json — register codes with
 * `bun ~/hq/caps/systems/caps-tracking/scripts/go-link.ts add --config lib/caps-tracking/jp-wilson.json --registry lib/go/links.json ...`
 * (see caps-tracking docs/ONBOARDING.md). This module only types it.
 */
export const GO_REGISTRY = links as GoRegistry
export const GO_CONFIG = config as unknown as ClientTrackingConfig
